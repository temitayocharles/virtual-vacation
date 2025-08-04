from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
from motor.motor_asyncio import AsyncIOMotorClient
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import joblib
import os
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
from datetime import datetime, timedelta
import hvac
from geopy.distance import geodesic
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Virtual Vacation AI Recommendation Engine",
    description="ML-powered recommendation system for personalized travel experiences",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
redis_client = None
mongodb_client = None
vault_client = None
recommendation_model = None
location_clusters = None
user_preference_vectorizer = None

# Pydantic models
class UserPreferences(BaseModel):
    user_id: str
    preferred_climates: List[str] = []  # tropical, temperate, cold, etc.
    activity_types: List[str] = []  # adventure, culture, relaxation, etc.
    budget_range: str = "medium"  # low, medium, high
    travel_style: str = "balanced"  # adventure, luxury, budget, family
    interests: List[str] = []  # history, nature, food, art, etc.
    languages: List[str] = ["en"]
    accessibility_needs: List[str] = []

class RecommendationRequest(BaseModel):
    user_id: str
    current_location: Optional[Dict[str, float]] = None  # lat, lng
    preferences: Optional[UserPreferences] = None
    exclude_visited: bool = True
    limit: int = 10

class FeedbackRequest(BaseModel):
    user_id: str
    destination_id: str
    rating: float  # 1-5
    feedback_type: str  # "like", "dislike", "neutral"
    comments: Optional[str] = None

class DestinationProfile(BaseModel):
    id: str
    name: str
    country: str
    location: Dict[str, float]
    climate: str
    activity_types: List[str]
    interests: List[str]
    budget_level: str
    description: str
    popularity_score: float
    features: Dict[str, Any]

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
        await mongodb_client.admin.command('ping')
        logger.info("✅ MongoDB connection established")
        
        # Initialize ML models
        await initialize_ml_models()
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

async def initialize_ml_models():
    """Initialize or train ML models for recommendations"""
    global recommendation_model, location_clusters, user_preference_vectorizer
    
    try:
        model_path = "/app/models"
        os.makedirs(model_path, exist_ok=True)
        
        # Try to load existing models
        try:
            recommendation_model = joblib.load(f"{model_path}/recommendation_model.pkl")
            location_clusters = joblib.load(f"{model_path}/location_clusters.pkl")
            user_preference_vectorizer = joblib.load(f"{model_path}/preference_vectorizer.pkl")
            logger.info("✅ Loaded existing ML models")
        except FileNotFoundError:
            logger.info("🔄 Training new ML models...")
            await train_recommendation_models()
            
    except Exception as e:
        logger.error(f"❌ Failed to initialize ML models: {e}")
        # Create dummy models for now
        recommendation_model = DummyRecommendationModel()
        logger.info("⚠️ Using dummy recommendation model")

async def train_recommendation_models():
    """Train ML models using destination and user data"""
    global recommendation_model, location_clusters, user_preference_vectorizer
    
    try:
        db = mongodb_client.virtual_vacation
        
        # Get destination data
        destinations_cursor = db.destinations.find({})
        destinations = []
        async for dest in destinations_cursor:
            destinations.append(dest)
        
        if not destinations:
            logger.warning("⚠️ No destination data found for training")
            recommendation_model = DummyRecommendationModel()
            return
        
        # Create destination feature matrix
        destination_features = []
        for dest in destinations:
            features = {
                'latitude': dest.get('location', {}).get('latitude', 0),
                'longitude': dest.get('location', {}).get('longitude', 0),
                'climate_score': hash(dest.get('climate', '')) % 100,
                'activity_diversity': len(dest.get('activity_types', [])),
                'interest_diversity': len(dest.get('interests', [])),
                'popularity': dest.get('popularity_score', 0),
                'budget_level': {'low': 1, 'medium': 2, 'high': 3}.get(dest.get('budget_level', 'medium'), 2)
            }
            destination_features.append(features)
        
        # Train location clustering model
        feature_matrix = np.array([[f['latitude'], f['longitude']] for f in destination_features])
        location_clusters = KMeans(n_clusters=min(10, len(destinations)), random_state=42)
        location_clusters.fit(feature_matrix)
        
        # Train preference vectorizer
        preference_texts = []
        for dest in destinations:
            text = f"{dest.get('description', '')} {' '.join(dest.get('activity_types', []))} {' '.join(dest.get('interests', []))}"
            preference_texts.append(text)
        
        user_preference_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        user_preference_vectorizer.fit(preference_texts)
        
        # Create simple recommendation model
        recommendation_model = ContentBasedRecommendationModel(
            destinations=destinations,
            location_clusters=location_clusters,
            vectorizer=user_preference_vectorizer
        )
        
        # Save models
        model_path = "/app/models"
        joblib.dump(recommendation_model, f"{model_path}/recommendation_model.pkl")
        joblib.dump(location_clusters, f"{model_path}/location_clusters.pkl")
        joblib.dump(user_preference_vectorizer, f"{model_path}/preference_vectorizer.pkl")
        
        logger.info("✅ ML models trained and saved successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to train models: {e}")
        recommendation_model = DummyRecommendationModel()

class DummyRecommendationModel:
    """Fallback recommendation model"""
    
    def recommend(self, user_preferences: UserPreferences, exclude_visited: List[str] = None, limit: int = 10):
        # Return sample recommendations
        sample_destinations = [
            {
                "id": "paris_france",
                "name": "Paris",
                "country": "France",
                "score": 0.95,
                "reason": "Based on your interest in culture and history"
            },
            {
                "id": "tokyo_japan",
                "name": "Tokyo",
                "country": "Japan",
                "score": 0.90,
                "reason": "Perfect blend of modern and traditional experiences"
            },
            {
                "id": "new_york_usa",
                "name": "New York",
                "country": "USA",
                "score": 0.88,
                "reason": "Vibrant city life and diverse cultural offerings"
            }
        ]
        
        return sample_destinations[:limit]

class ContentBasedRecommendationModel:
    """Content-based recommendation model using destination features"""
    
    def __init__(self, destinations, location_clusters, vectorizer):
        self.destinations = destinations
        self.location_clusters = location_clusters
        self.vectorizer = vectorizer
        
        # Pre-compute destination vectors
        self.destination_vectors = self._compute_destination_vectors()
    
    def _compute_destination_vectors(self):
        """Pre-compute TF-IDF vectors for all destinations"""
        texts = []
        for dest in self.destinations:
            text = f"{dest.get('description', '')} {' '.join(dest.get('activity_types', []))} {' '.join(dest.get('interests', []))}"
            texts.append(text)
        
        return self.vectorizer.transform(texts)
    
    def recommend(self, user_preferences: UserPreferences, exclude_visited: List[str] = None, limit: int = 10):
        """Generate recommendations based on user preferences"""
        try:
            # Create user preference vector
            user_text = f"{' '.join(user_preferences.activity_types)} {' '.join(user_preferences.interests)} {user_preferences.travel_style}"
            user_vector = self.vectorizer.transform([user_text])
            
            # Calculate similarity scores
            similarity_scores = cosine_similarity(user_vector, self.destination_vectors).flatten()
            
            # Create recommendations
            recommendations = []
            for i, dest in enumerate(self.destinations):
                if exclude_visited and dest.get('id') in exclude_visited:
                    continue
                
                score = similarity_scores[i]
                
                # Boost score based on preference matching
                if dest.get('budget_level') == user_preferences.budget_range:
                    score += 0.1
                
                activity_match = len(set(dest.get('activity_types', [])) & set(user_preferences.activity_types))
                score += activity_match * 0.05
                
                recommendations.append({
                    "id": dest.get('id'),
                    "name": dest.get('name'),
                    "country": dest.get('country'),
                    "score": float(score),
                    "reason": self._generate_reason(dest, user_preferences),
                    "location": dest.get('location'),
                    "climate": dest.get('climate'),
                    "activity_types": dest.get('activity_types', []),
                    "budget_level": dest.get('budget_level')
                })
            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    def _generate_reason(self, destination, user_preferences):
        """Generate explanation for why this destination is recommended"""
        reasons = []
        
        # Check activity type matches
        activity_matches = set(destination.get('activity_types', [])) & set(user_preferences.activity_types)
        if activity_matches:
            reasons.append(f"Matches your interest in {', '.join(list(activity_matches)[:2])}")
        
        # Check interest matches
        interest_matches = set(destination.get('interests', [])) & set(user_preferences.interests)
        if interest_matches:
            reasons.append(f"Great for {', '.join(list(interest_matches)[:2])} enthusiasts")
        
        # Check budget compatibility
        if destination.get('budget_level') == user_preferences.budget_range:
            reasons.append(f"Fits your {user_preferences.budget_range} budget")
        
        if not reasons:
            reasons.append("Highly rated destination with diverse experiences")
        
        return "; ".join(reasons)

# Health check endpoint
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "services": {
            "redis": "unknown",
            "mongodb": "unknown",
            "ml_models": "unknown"
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
    
    # Check ML models
    if recommendation_model:
        health_status["services"]["ml_models"] = "healthy"
    else:
        health_status["services"]["ml_models"] = "unhealthy"
    
    return health_status

# Get personalized recommendations
@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized destination recommendations for a user"""
    try:
        # Get user preferences
        if request.preferences:
            user_prefs = request.preferences
        else:
            # Load user preferences from database
            db = mongodb_client.virtual_vacation
            user_data = await db.user_preferences.find_one({"user_id": request.user_id})
            
            if user_data:
                user_prefs = UserPreferences(**user_data)
            else:
                # Use default preferences
                user_prefs = UserPreferences(user_id=request.user_id)
        
        # Get user's visited destinations
        visited_destinations = []
        if request.exclude_visited:
            db = mongodb_client.virtual_vacation
            visits_cursor = db.user_visits.find({"user_id": request.user_id})
            async for visit in visits_cursor:
                visited_destinations.append(visit["destination_id"])
        
        # Generate recommendations
        recommendations = recommendation_model.recommend(
            user_preferences=user_prefs,
            exclude_visited=visited_destinations,
            limit=request.limit
        )
        
        # Cache recommendations
        cache_key = f"recommendations:{request.user_id}"
        await redis_client.setex(
            cache_key, 
            3600,  # 1 hour cache
            json.dumps(recommendations)
        )
        
        return {
            "user_id": request.user_id,
            "total_recommendations": len(recommendations),
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

# Update user preferences
@app.post("/api/preferences")
async def update_user_preferences(preferences: UserPreferences):
    """Update user preferences for better recommendations"""
    try:
        db = mongodb_client.virtual_vacation
        
        # Upsert user preferences
        await db.user_preferences.replace_one(
            {"user_id": preferences.user_id},
            preferences.dict(),
            upsert=True
        )
        
        # Clear cached recommendations
        cache_key = f"recommendations:{preferences.user_id}"
        await redis_client.delete(cache_key)
        
        return {
            "message": "User preferences updated successfully",
            "user_id": preferences.user_id
        }
        
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")

# Submit user feedback
@app.post("/api/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Submit user feedback to improve recommendations"""
    try:
        db = mongodb_client.virtual_vacation
        
        # Store feedback
        feedback_doc = feedback.dict()
        feedback_doc["created_at"] = datetime.now()
        
        await db.user_feedback.insert_one(feedback_doc)
        
        # Update destination popularity based on feedback
        if feedback.rating >= 4:
            await db.destinations.update_one(
                {"id": feedback.destination_id},
                {"$inc": {"popularity_score": 0.1}}
            )
        elif feedback.rating <= 2:
            await db.destinations.update_one(
                {"id": feedback.destination_id},
                {"$inc": {"popularity_score": -0.05}}
            )
        
        return {
            "message": "Feedback submitted successfully",
            "user_id": feedback.user_id,
            "destination_id": feedback.destination_id
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

# Get similar destinations
@app.get("/api/similar/{destination_id}")
async def get_similar_destinations(destination_id: str, limit: int = 5):
    """Get destinations similar to the specified one"""
    try:
        db = mongodb_client.virtual_vacation
        
        # Get the reference destination
        ref_destination = await db.destinations.find_one({"id": destination_id})
        if not ref_destination:
            raise HTTPException(status_code=404, detail="Destination not found")
        
        # Find similar destinations based on features
        pipeline = [
            {
                "$match": {
                    "id": {"$ne": destination_id},
                    "climate": ref_destination.get("climate"),
                    "activity_types": {"$in": ref_destination.get("activity_types", [])}
                }
            },
            {"$limit": limit}
        ]
        
        similar_destinations = []
        async for dest in db.destinations.aggregate(pipeline):
            dest["_id"] = str(dest["_id"])
            similar_destinations.append(dest)
        
        return {
            "reference_destination": destination_id,
            "similar_destinations": similar_destinations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding similar destinations: {e}")
        raise HTTPException(status_code=500, detail="Failed to find similar destinations")

# Get trending destinations
@app.get("/api/trending")
async def get_trending_destinations(limit: int = 10):
    """Get currently trending destinations based on user activity"""
    try:
        db = mongodb_client.virtual_vacation
        
        # Get destinations with recent high activity
        last_week = datetime.now() - timedelta(days=7)
        
        pipeline = [
            {
                "$lookup": {
                    "from": "user_visits",
                    "localField": "id",
                    "foreignField": "destination_id",
                    "as": "recent_visits"
                }
            },
            {
                "$addFields": {
                    "recent_visit_count": {
                        "$size": {
                            "$filter": {
                                "input": "$recent_visits",
                                "cond": {"$gte": ["$$this.created_at", last_week]}
                            }
                        }
                    }
                }
            },
            {"$sort": {"recent_visit_count": -1, "popularity_score": -1}},
            {"$limit": limit},
            {"$project": {"recent_visits": 0}}
        ]
        
        trending_destinations = []
        async for dest in db.destinations.aggregate(pipeline):
            dest["_id"] = str(dest["_id"])
            trending_destinations.append(dest)
        
        return {
            "trending_destinations": trending_destinations,
            "period": "last_7_days",
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting trending destinations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trending destinations")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
