"""
Live Data Engine - Real-time Data Collection and Processing
Provides live, real-time data for immersive virtual travel experiences
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import aiohttp
import websockets
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional
import numpy as np
from dataclasses import dataclass
import cv2
import base64
from PIL import Image
import io
import redis
import motor.motor_asyncio
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Virtual Vacation - Live Data Engine",
    description="Real-time data collection and processing for immersive virtual travel",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics
live_data_requests = Counter('live_data_requests_total', 'Total live data requests', ['data_type'])
data_processing_time = Histogram('data_processing_seconds', 'Time spent processing live data')
websocket_connections = Counter('websocket_connections_total', 'Total WebSocket connections')

# Database connections
redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
mongodb_client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://mongodb:27017')

@dataclass
class LiveEvent:
    """Represents a live event happening at a location"""
    id: str
    location: dict
    event_type: str
    description: str
    participants: int
    timestamp: datetime
    image_url: str
    live_stream_url: Optional[str] = None
    social_media_posts: List[dict] = None

@dataclass
class LiveWeatherData:
    """Enhanced live weather with atmospheric conditions"""
    location: dict
    temperature: float
    humidity: float
    visibility: float
    wind_speed: float
    wind_direction: float
    pressure: float
    uv_index: float
    air_quality: dict
    weather_description: str
    live_webcam_url: Optional[str] = None
    timestamp: datetime

class LiveDataCollector:
    """Collects real-time data from multiple sources"""
    
    def __init__(self):
        self.active_streams = {}
        self.webcam_feeds = {}
        self.social_feeds = {}
        
    async def get_live_webcams(self, latitude: float, longitude: float, radius: int = 50) -> List[dict]:
        """Get live webcam feeds near location"""
        try:
            # Windy.com webcams API
            async with aiohttp.ClientSession() as session:
                url = f"https://api.windy.com/api/webcams/v2/list/nearby={latitude},{longitude},{radius}"
                headers = {"x-windy-key": "YOUR_WINDY_API_KEY"}  # Free tier available
                
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        webcams = []
                        
                        for webcam in data.get('result', {}).get('webcams', []):
                            webcams.append({
                                'id': webcam['id'],
                                'title': webcam['title'],
                                'live_url': webcam['image']['current']['preview'],
                                'player_url': webcam.get('player', {}).get('live', ''),
                                'location': webcam['location'],
                                'status': webcam['status'],
                                'views': webcam.get('statistics', {}).get('views', 0),
                                'updated': webcam['image']['update']
                            })
                        
                        return webcams
        except Exception as e:
            logger.error(f"Error fetching webcams: {e}")
            return []

    async def get_live_social_activity(self, location: dict, keywords: List[str]) -> List[dict]:
        """Get live social media activity from location"""
        try:
            social_posts = []
            
            # Twitter/X API v2 (with geolocation)
            # Instagram Basic Display API
            # Reddit API for location-based posts
            # Flickr API for recent photos
            
            # Mock implementation - replace with actual API calls
            current_time = datetime.now()
            
            mock_posts = [
                {
                    'platform': 'twitter',
                    'user': '@traveler123',
                    'content': f"Amazing sunset at {location.get('name', 'this location')}! 🌅",
                    'timestamp': current_time - timedelta(minutes=5),
                    'likes': 42,
                    'image_url': 'https://example.com/sunset.jpg',
                    'coordinates': location
                },
                {
                    'platform': 'instagram',
                    'user': '@photoexplorer',
                    'content': f"Live from {location.get('name', 'here')} - the energy is incredible!",
                    'timestamp': current_time - timedelta(minutes=15),
                    'likes': 156,
                    'image_url': 'https://example.com/crowd.jpg',
                    'coordinates': location
                }
            ]
            
            return mock_posts
            
        except Exception as e:
            logger.error(f"Error fetching social activity: {e}")
            return []

    async def get_live_traffic_data(self, latitude: float, longitude: float) -> dict:
        """Get real-time traffic and crowd density"""
        try:
            # Google Maps Traffic API
            # TomTom Traffic API
            # HERE Traffic API
            
            # Mock implementation
            return {
                'traffic_level': np.random.choice(['light', 'moderate', 'heavy'], p=[0.5, 0.3, 0.2]),
                'crowd_density': np.random.randint(10, 100),
                'popular_spots': [
                    {'name': 'Central Plaza', 'crowd_level': 85, 'wait_time': '5-10 min'},
                    {'name': 'Local Market', 'crowd_level': 62, 'wait_time': '2-5 min'},
                    {'name': 'Tourist Center', 'crowd_level': 40, 'wait_time': 'No wait'}
                ],
                'events_happening': [
                    {'name': 'Street Performance', 'type': 'music', 'participants': 25},
                    {'name': 'Food Festival', 'type': 'food', 'participants': 150}
                ],
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error fetching traffic data: {e}")
            return {}

    async def get_live_environmental_data(self, latitude: float, longitude: float) -> dict:
        """Get real-time environmental conditions"""
        try:
            # AirVisual API for air quality
            # UV Index APIs
            # Noise level APIs
            # Light pollution data
            
            async with aiohttp.ClientSession() as session:
                # Air quality from AirVisual
                air_url = f"http://api.airvisual.com/v2/nearest_city?lat={latitude}&lon={longitude}&key=YOUR_AIRVISUAL_KEY"
                
                air_quality = {}
                try:
                    async with session.get(air_url) as response:
                        if response.status == 200:
                            data = await response.json()
                            current = data['data']['current']
                            air_quality = {
                                'aqi': current['pollution']['aqius'],
                                'main_pollutant': current['pollution']['mainus'],
                                'level': self._get_aqi_level(current['pollution']['aqius'])
                            }
                except:
                    air_quality = {'aqi': 50, 'main_pollutant': 'pm25', 'level': 'good'}
                
                return {
                    'air_quality': air_quality,
                    'uv_index': np.random.randint(1, 11),
                    'noise_level': np.random.randint(30, 80),  # dB
                    'light_pollution': np.random.choice(['minimal', 'moderate', 'high']),
                    'visibility': np.random.uniform(5.0, 20.0),  # km
                    'humidity': np.random.uniform(30, 90),
                    'timestamp': datetime.now()
                }
                
        except Exception as e:
            logger.error(f"Error fetching environmental data: {e}")
            return {}

    def _get_aqi_level(self, aqi: int) -> str:
        """Convert AQI number to descriptive level"""
        if aqi <= 50:
            return 'good'
        elif aqi <= 100:
            return 'moderate'
        elif aqi <= 150:
            return 'unhealthy_sensitive'
        elif aqi <= 200:
            return 'unhealthy'
        elif aqi <= 300:
            return 'very_unhealthy'
        else:
            return 'hazardous'

# Initialize live data collector
live_collector = LiveDataCollector()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        websocket_connections.inc()

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws/live-feed/{location_id}")
async def websocket_live_feed(websocket: WebSocket, location_id: str):
    """WebSocket endpoint for live data streaming"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Get location data
            location_data = await get_location_coordinates(location_id)
            if not location_data:
                await websocket.send_text(json.dumps({"error": "Location not found"}))
                break
            
            lat, lon = location_data['latitude'], location_data['longitude']
            
            # Collect live data
            live_data = {
                'timestamp': datetime.now().isoformat(),
                'location_id': location_id,
                'webcams': await live_collector.get_live_webcams(lat, lon),
                'social_activity': await live_collector.get_live_social_activity(location_data, [location_id]),
                'traffic': await live_collector.get_live_traffic_data(lat, lon),
                'environment': await live_collector.get_live_environmental_data(lat, lon),
                'events': await get_live_events(lat, lon)
            }
            
            await websocket.send_text(json.dumps(live_data, default=str))
            await asyncio.sleep(10)  # Update every 10 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

@app.get("/api/live/location/{location_id}")
async def get_live_location_data(location_id: str):
    """Get comprehensive live data for a location"""
    start_time = time.time()
    live_data_requests.labels(data_type='location').inc()
    
    try:
        location_data = await get_location_coordinates(location_id)
        if not location_data:
            raise HTTPException(status_code=404, detail="Location not found")
        
        lat, lon = location_data['latitude'], location_data['longitude']
        
        # Collect all live data in parallel
        webcams_task = live_collector.get_live_webcams(lat, lon)
        social_task = live_collector.get_live_social_activity(location_data, [location_id])
        traffic_task = live_collector.get_live_traffic_data(lat, lon)
        env_task = live_collector.get_live_environmental_data(lat, lon)
        events_task = get_live_events(lat, lon)
        
        webcams, social, traffic, environment, events = await asyncio.gather(
            webcams_task, social_task, traffic_task, env_task, events_task
        )
        
        live_data = {
            'location': location_data,
            'timestamp': datetime.now().isoformat(),
            'webcams': webcams,
            'social_activity': social,
            'traffic': traffic,
            'environment': environment,
            'events': events,
            'data_freshness': 'live'  # Data collected in real-time
        }
        
        # Cache briefly for performance
        cache_key = f"live_data:{location_id}"
        await redis_client.setex(cache_key, 30, json.dumps(live_data, default=str))
        
        data_processing_time.observe(time.time() - start_time)
        return live_data
        
    except Exception as e:
        logger.error(f"Error getting live location data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch live data")

@app.get("/api/live/webcam/{webcam_id}")
async def get_webcam_stream(webcam_id: str):
    """Get live webcam stream data"""
    try:
        # Fetch current webcam image
        async with aiohttp.ClientSession() as session:
            # This would connect to actual webcam APIs
            webcam_url = f"https://api.webcams.travel/rest?method=wct.webcams.list&devid=YOUR_DEV_ID&webcamid={webcam_id}"
            
            async with session.get(webcam_url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'webcam_id': webcam_id,
                        'live_image': data.get('webcam', {}).get('image', ''),
                        'status': 'live',
                        'timestamp': datetime.now().isoformat(),
                        'resolution': data.get('webcam', {}).get('resolution', ''),
                        'fps': data.get('webcam', {}).get('fps', 30)
                    }
        
        raise HTTPException(status_code=404, detail="Webcam not found")
        
    except Exception as e:
        logger.error(f"Error fetching webcam stream: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch webcam stream")

@app.get("/api/live/events/{latitude}/{longitude}")
async def get_live_events(latitude: float, longitude: float, radius: int = 10):
    """Get live events happening near location"""
    try:
        # Eventbrite API
        # Meetup API
        # Facebook Events API
        # Local event APIs
        
        # Mock live events - replace with actual API calls
        current_time = datetime.now()
        
        live_events = [
            LiveEvent(
                id="event_001",
                location={'latitude': latitude, 'longitude': longitude, 'name': 'Central Square'},
                event_type="street_performance",
                description="Local musician performing live acoustic set",
                participants=25,
                timestamp=current_time,
                image_url="https://example.com/performance.jpg",
                live_stream_url="https://stream.example.com/live_music"
            ),
            LiveEvent(
                id="event_002",
                location={'latitude': latitude + 0.001, 'longitude': longitude + 0.001, 'name': 'Market Square'},
                event_type="food_festival",
                description="Weekend food market with local vendors",
                participants=150,
                timestamp=current_time,
                image_url="https://example.com/market.jpg"
            )
        ]
        
        return [event.__dict__ for event in live_events]
        
    except Exception as e:
        logger.error(f"Error fetching live events: {e}")
        return []

@app.get("/api/live/people-counter/{location_id}")
async def get_live_people_count(location_id: str):
    """Get real-time people count and crowd analysis"""
    try:
        # This would integrate with:
        # - Computer vision APIs for crowd counting
        # - Anonymized phone location data
        # - Transit data APIs
        # - Social media check-ins
        
        location_data = await get_location_coordinates(location_id)
        if not location_data:
            raise HTTPException(status_code=404, detail="Location not found")
        
        # Mock crowd analysis - replace with actual APIs
        crowd_data = {
            'location_id': location_id,
            'timestamp': datetime.now().isoformat(),
            'total_people_estimate': np.random.randint(50, 500),
            'crowd_density': np.random.choice(['low', 'moderate', 'high', 'very_high'], p=[0.3, 0.4, 0.2, 0.1]),
            'movement_patterns': {
                'walking_speed': np.random.uniform(0.5, 2.0),  # m/s
                'main_directions': ['north', 'south'],
                'bottlenecks': ['main_entrance', 'photo_spot']
            },
            'demographics': {
                'tourists': np.random.randint(60, 90),  # percentage
                'locals': np.random.randint(10, 40),
                'age_groups': {
                    'young_adults': 40,
                    'adults': 35,
                    'seniors': 15,
                    'children': 10
                }
            },
            'popular_activities': [
                {'activity': 'photography', 'participants': 45},
                {'activity': 'sightseeing', 'participants': 120},
                {'activity': 'dining', 'participants': 80}
            ]
        }
        
        return crowd_data
        
    except Exception as e:
        logger.error(f"Error getting people count: {e}")
        raise HTTPException(status_code=500, detail="Failed to get crowd data")

@app.get("/api/live/sounds/{location_id}")
async def get_live_ambient_sounds(location_id: str):
    """Get live ambient sounds and audio landscape"""
    try:
        location_data = await get_location_coordinates(location_id)
        if not location_data:
            raise HTTPException(status_code=404, detail="Location not found")
        
        # This would integrate with:
        # - Freesound.org API
        # - Radio streams
        # - Live audio feeds
        # - Environmental sound monitoring
        
        audio_landscape = {
            'location_id': location_id,
            'timestamp': datetime.now().isoformat(),
            'ambient_sounds': [
                {
                    'type': 'traffic',
                    'intensity': np.random.randint(30, 70),
                    'description': 'Moderate city traffic',
                    'audio_url': 'https://freesound.org/data/previews/123/123456_1234567-lq.mp3'
                },
                {
                    'type': 'nature',
                    'intensity': np.random.randint(20, 60),
                    'description': 'Birds chirping, wind in trees',
                    'audio_url': 'https://freesound.org/data/previews/456/456789_9876543-lq.mp3'
                },
                {
                    'type': 'human_activity',
                    'intensity': np.random.randint(40, 80),
                    'description': 'Conversations, footsteps, laughter',
                    'audio_url': 'https://freesound.org/data/previews/789/789012_2468135-lq.mp3'
                }
            ],
            'noise_level': {
                'current_db': np.random.randint(45, 75),
                'category': 'moderate',
                'peak_times': ['12:00-14:00', '17:00-19:00']
            },
            'live_radio': {
                'local_stations': [
                    {'name': 'Local FM 101.5', 'genre': 'pop', 'stream_url': 'http://stream.radio.co/s12345/listen'},
                    {'name': 'City Jazz 97.3', 'genre': 'jazz', 'stream_url': 'http://stream.radio.co/s67890/listen'}
                ]
            }
        }
        
        return audio_landscape
        
    except Exception as e:
        logger.error(f"Error getting ambient sounds: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audio data")

async def get_location_coordinates(location_id: str) -> Optional[dict]:
    """Get location coordinates from database"""
    try:
        db = mongodb_client.virtual_vacation
        location = await db.destinations.find_one({"id": location_id})
        
        if location:
            return {
                'latitude': location['location']['latitude'],
                'longitude': location['location']['longitude'],
                'name': location['name'],
                'country': location['country']
            }
        return None
        
    except Exception as e:
        logger.error(f"Error getting location coordinates: {e}")
        return None

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "live-data-engine",
        "timestamp": datetime.now().isoformat(),
        "active_connections": len(manager.active_connections)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
