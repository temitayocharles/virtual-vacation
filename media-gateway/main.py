from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncio
import aiofiles
import httpx
import redis.asyncio as redis
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import cv2
import numpy as np
from pathlib import Path
import minio
import io
import hvac

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Virtual Vacation Media Gateway",
    description="Streaming service for 360° content, panoramic images, and multimedia assets",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Global variables for connections
redis_client = None
mongodb_client = None
vault_client = None

# Pydantic models
class MediaMetadata(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    location: Dict[str, float]  # lat, lng
    content_type: str  # "360_video", "panoramic_image", "audio", "3d_model"
    file_path: str
    file_size: int
    duration: Optional[float] = None
    resolution: Optional[str] = None
    format: str
    created_at: str
    tags: List[str] = []

class StreamRequest(BaseModel):
    media_id: str
    quality: Optional[str] = "medium"  # low, medium, high, ultra
    start_time: Optional[float] = 0

class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    radius: Optional[float] = 1000  # meters

# Startup event
@app.on_event("startup")
async def startup_event():
    global redis_client, mongodb_client, vault_client
    
    try:
        # Initialize Vault client
        vault_addr = os.getenv("VAULT_ADDR", "http://vault:8200")
        vault_token = os.getenv("VAULT_TOKEN")
        
        if vault_token:
            vault_client = hvac.Client(url=vault_addr, token=vault_token)
            logger.info("✅ Vault client initialized")
        
        # Initialize Redis
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
        redis_client = redis.from_url(redis_url)
        await redis_client.ping()
        logger.info("✅ Redis connection established")
        
        # Initialize MongoDB
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://mongodb:27017/virtual_vacation")
        mongodb_client = AsyncIOMotorClient(mongodb_url)
        # Test connection
        await mongodb_client.admin.command('ping')
        logger.info("✅ MongoDB connection established")
        
        # Create storage directories
        storage_path = Path("/app/storage")
        storage_path.mkdir(exist_ok=True)
        (storage_path / "360_content").mkdir(exist_ok=True)
        (storage_path / "panoramic_images").mkdir(exist_ok=True)
        (storage_path / "audio").mkdir(exist_ok=True)
        (storage_path / "3d_models").mkdir(exist_ok=True)
        logger.info("✅ Storage directories created")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    global redis_client, mongodb_client
    
    if redis_client:
        await redis_client.close()
    
    if mongodb_client:
        mongodb_client.close()

# Health check endpoint
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "services": {
            "redis": "unknown",
            "mongodb": "unknown",
            "vault": "unknown",
            "storage": "unknown"
        }
    }
    
    try:
        # Check Redis
        await redis_client.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception:
        health_status["services"]["redis"] = "unhealthy"
    
    try:
        # Check MongoDB
        await mongodb_client.admin.command('ping')
        health_status["services"]["mongodb"] = "healthy"
    except Exception:
        health_status["services"]["mongodb"] = "unhealthy"
    
    try:
        # Check Vault
        if vault_client and vault_client.is_authenticated():
            health_status["services"]["vault"] = "healthy"
        else:
            health_status["services"]["vault"] = "unhealthy"
    except Exception:
        health_status["services"]["vault"] = "unhealthy"
    
    # Check storage
    storage_path = Path("/app/storage")
    if storage_path.exists() and storage_path.is_dir():
        health_status["services"]["storage"] = "healthy"
    else:
        health_status["services"]["storage"] = "unhealthy"
    
    # Overall health
    unhealthy_services = [k for k, v in health_status["services"].items() if v == "unhealthy"]
    if unhealthy_services:
        health_status["status"] = "degraded"
        health_status["unhealthy_services"] = unhealthy_services
    
    return health_status

# Get media by location
@app.post("/api/media/location")
async def get_media_by_location(request: LocationRequest):
    """Get available media content for a specific location"""
    try:
        db = mongodb_client.virtual_vacation
        
        # Query for media within radius of location
        media_cursor = db.media.find({
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [request.longitude, request.latitude]
                    },
                    "$maxDistance": request.radius
                }
            }
        })
        
        media_list = []
        async for media in media_cursor:
            media["_id"] = str(media["_id"])
            media_list.append(media)
        
        return {
            "location": {
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            "radius": request.radius,
            "media_count": len(media_list),
            "media": media_list
        }
        
    except Exception as e:
        logger.error(f"Error fetching media by location: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch media")

# Stream 360° video content
@app.post("/api/stream/360")
async def stream_360_video(request: StreamRequest):
    """Stream 360° video content with adaptive quality"""
    try:
        # Get media metadata from MongoDB
        db = mongodb_client.virtual_vacation
        media = await db.media.find_one({"id": request.media_id})
        
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        if media["content_type"] != "360_video":
            raise HTTPException(status_code=400, detail="Media is not a 360° video")
        
        file_path = Path(media["file_path"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Media file not found")
        
        # Stream file with range support
        async def generate_video_stream():
            async with aiofiles.open(file_path, mode='rb') as file:
                while True:
                    chunk = await file.read(8192)  # 8KB chunks
                    if not chunk:
                        break
                    yield chunk
        
        return StreamingResponse(
            generate_video_stream(),
            media_type="video/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Type": "video/mp4",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error streaming 360 video: {e}")
        raise HTTPException(status_code=500, detail="Failed to stream video")

# Get panoramic image
@app.get("/api/panoramic/{media_id}")
async def get_panoramic_image(media_id: str, quality: str = "medium"):
    """Serve panoramic images with different quality levels"""
    try:
        # Get media metadata
        db = mongodb_client.virtual_vacation
        media = await db.media.find_one({"id": media_id})
        
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        if media["content_type"] != "panoramic_image":
            raise HTTPException(status_code=400, detail="Media is not a panoramic image")
        
        file_path = Path(media["file_path"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Image file not found")
        
        # Return the image file
        return FileResponse(
            path=str(file_path),
            media_type="image/jpeg",
            headers={
                "Cache-Control": "max-age=3600",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving panoramic image: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve image")

# Stream audio content
@app.get("/api/audio/{media_id}")
async def stream_audio(media_id: str):
    """Stream audio content (ambient sounds, music, narration)"""
    try:
        # Get media metadata
        db = mongodb_client.virtual_vacation
        media = await db.media.find_one({"id": media_id})
        
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        if media["content_type"] != "audio":
            raise HTTPException(status_code=400, detail="Media is not audio")
        
        file_path = Path(media["file_path"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Stream audio file
        async def generate_audio_stream():
            async with aiofiles.open(file_path, mode='rb') as file:
                while True:
                    chunk = await file.read(4096)  # 4KB chunks
                    if not chunk:
                        break
                    yield chunk
        
        return StreamingResponse(
            generate_audio_stream(),
            media_type="audio/mpeg",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Type": "audio/mpeg",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error streaming audio: {e}")
        raise HTTPException(status_code=500, detail="Failed to stream audio")

# Upload media content (for admin use)
@app.post("/api/upload")
async def upload_media(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata: str = None
):
    """Upload media content with metadata"""
    try:
        if not metadata:
            raise HTTPException(status_code=400, detail="Metadata is required")
        
        metadata_dict = json.loads(metadata)
        
        # Generate file path
        storage_dir = Path("/app/storage") / metadata_dict["content_type"]
        storage_dir.mkdir(exist_ok=True)
        
        file_path = storage_dir / f"{metadata_dict['id']}.{file.filename.split('.')[-1]}"
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Save metadata to MongoDB
        metadata_dict["file_path"] = str(file_path)
        metadata_dict["file_size"] = len(content)
        
        db = mongodb_client.virtual_vacation
        await db.media.insert_one(metadata_dict)
        
        return {
            "message": "Media uploaded successfully",
            "media_id": metadata_dict["id"],
            "file_path": str(file_path)
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid metadata JSON")
    except Exception as e:
        logger.error(f"Error uploading media: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload media")

# Get media metadata
@app.get("/api/media/{media_id}")
async def get_media_metadata(media_id: str):
    """Get metadata for a specific media item"""
    try:
        db = mongodb_client.virtual_vacation
        media = await db.media.find_one({"id": media_id})
        
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        media["_id"] = str(media["_id"])
        return media
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching media metadata: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch metadata")

# List all media with filters
@app.get("/api/media")
async def list_media(
    content_type: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """List media with optional filters"""
    try:
        db = mongodb_client.virtual_vacation
        
        # Build query
        query = {}
        if content_type:
            query["content_type"] = content_type
        
        # Execute query
        cursor = db.media.find(query).skip(offset).limit(limit)
        
        media_list = []
        async for media in cursor:
            media["_id"] = str(media["_id"])
            media_list.append(media)
        
        total_count = await db.media.count_documents(query)
        
        return {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "media": media_list
        }
        
    except Exception as e:
        logger.error(f"Error listing media: {e}")
        raise HTTPException(status_code=500, detail="Failed to list media")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
