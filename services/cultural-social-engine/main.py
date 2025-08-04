"""
Cultural & Social Dynamics Engine
Simulates human behavior, cultural patterns, and social interactions worldwide
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import datetime
import pytz
from typing import Dict, List, Any
import numpy as np
from dataclasses import dataclass, asdict
import uuid

app = FastAPI(title="Cultural & Social Dynamics Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@dataclass
class CulturalProfile:
    country: str
    primary_language: str
    secondary_languages: List[str]
    religions: List[Dict[str, float]]  # religion: percentage
    ethnic_groups: List[Dict[str, float]]
    traditional_foods: List[str]
    festivals: List[Dict[str, Any]]
    customs: List[str]
    social_norms: List[str]
    business_etiquette: List[str]
    greeting_styles: List[str]
    communication_style: str  # direct, indirect, mixed
    hierarchy_level: str  # high, medium, low
    collectivism_score: float  # 0-10, 0=individualistic, 10=collectivistic
    time_orientation: str  # monochronic, polychronic
    music_genres: List[str]
    dance_styles: List[str]
    art_forms: List[str]
    architectural_styles: List[str]
    clothing_styles: List[str]
    sports_preferences: List[str]

@dataclass
class SocialBehavior:
    location: str
    time_of_day: str
    day_of_week: str
    social_activities: List[Dict[str, Any]]
    gathering_spots: List[Dict[str, Any]]
    interaction_patterns: Dict[str, float]
    mood_indicators: Dict[str, float]
    social_media_activity: Dict[str, Any]
    community_events: List[Dict[str, Any]]
    generational_differences: Dict[str, Dict[str, Any]]

@dataclass
class LanguageUsage:
    location: str
    primary_languages: List[Dict[str, float]]
    language_mixing: bool
    accent_variations: List[str]
    slang_terms: List[str]
    business_language: str
    tourist_language_support: Dict[str, float]
    sign_language_usage: float
    multilingual_percentage: float

@dataclass
class EconomicBehavior:
    location: str
    shopping_patterns: Dict[str, Any]
    payment_preferences: Dict[str, float]
    bargaining_culture: bool
    tipping_customs: Dict[str, Any]
    business_hours: Dict[str, str]
    work_life_balance: float  # 1-10
    economic_inequality: float  # Gini coefficient
    consumer_confidence: float
    entrepreneurship_rate: float

@dataclass
class FoodCulture:
    location: str
    cuisine_types: List[Dict[str, float]]
    meal_times: Dict[str, str]
    dining_etiquette: List[str]
    street_food_culture: float  # 1-10
    vegetarian_percentage: float
    dietary_restrictions: Dict[str, float]
    food_markets: List[Dict[str, Any]]
    restaurant_culture: Dict[str, Any]
    cooking_methods: List[str]
    seasonal_foods: Dict[str, List[str]]

class CulturalDynamicsDatabase:
    def __init__(self):
        self.cultural_profiles = {}
        self.social_behaviors = {}
        self.language_usage = {}
        self.economic_behaviors = {}
        self.food_cultures = {}
        self.real_time_dynamics = {}
        
    async def initialize_cultural_data(self):
        """Initialize comprehensive cultural data for major regions"""
        await self.load_cultural_profiles()
        await self.load_social_behaviors()
        await self.load_language_data()
        await self.load_economic_behaviors()
        await self.load_food_cultures()
        
    async def load_cultural_profiles(self):
        """Load cultural profiles for different countries/regions"""
        
        # France
        self.cultural_profiles["France"] = CulturalProfile(
            country="France",
            primary_language="French",
            secondary_languages=["English", "Arabic", "Portuguese", "Spanish", "Italian"],
            religions=[
                {"Catholic": 0.51},
                {"Atheist/Agnostic": 0.35},
                {"Muslim": 0.08},
                {"Protestant": 0.02},
                {"Other": 0.04}
            ],
            ethnic_groups=[
                {"French": 0.85},
                {"North African": 0.06},
                {"Sub-Saharan African": 0.03},
                {"Turkish": 0.01},
                {"Other European": 0.05}
            ],
            traditional_foods=[
                "Croissant", "Baguette", "Coq au Vin", "Ratatouille", "Bouillabaisse",
                "Crème Brûlée", "Escargot", "Foie Gras", "Quiche Lorraine", "Cassoulet"
            ],
            festivals=[
                {"name": "Bastille Day", "date": "July 14", "type": "National", "participants": 67000000},
                {"name": "Cannes Film Festival", "date": "May", "type": "Cultural", "participants": 200000},
                {"name": "Fête de la Musique", "date": "June 21", "type": "Musical", "participants": 5000000}
            ],
            customs=[
                "La bise (cheek kissing)", "Long lunch breaks", "Evening aperitif",
                "Sunday family meals", "Respect for food culture", "Fashion consciousness"
            ],
            social_norms=[
                "Formal address until invited to use first names",
                "Punctuality highly valued", "Privacy highly respected",
                "Intellectual conversation appreciated", "Quality over quantity mindset"
            ],
            business_etiquette=[
                "Formal dress code", "Hierarchical structure", "Long lunch meetings",
                "Personal relationships important", "August vacation sacred"
            ],
            greeting_styles=["Handshake", "La bise", "Bonjour/Bonsoir"],
            communication_style="Direct but diplomatic",
            hierarchy_level="Medium-High",
            collectivism_score=3.2,
            time_orientation="Monochronic with flexibility",
            music_genres=["Chanson", "Electronic", "Jazz", "Classical", "Hip-Hop"],
            dance_styles=["Ballet", "Can-Can", "Ballroom", "Contemporary"],
            art_forms=["Impressionism", "Sculpture", "Architecture", "Fashion Design"],
            architectural_styles=["Gothic", "Baroque", "Neoclassical", "Modern"],
            clothing_styles=["Chic", "Elegant", "Minimalist", "Fashion-forward"],
            sports_preferences=["Football", "Tennis", "Rugby", "Cycling", "Skiing"]
        )
        
        # Japan
        self.cultural_profiles["Japan"] = CulturalProfile(
            country="Japan",
            primary_language="Japanese",
            secondary_languages=["English", "Chinese", "Korean"],
            religions=[
                {"Shinto": 0.48},
                {"Buddhist": 0.46},
                {"Christian": 0.02},
                {"Other": 0.04}
            ],
            ethnic_groups=[
                {"Japanese": 0.987},
                {"Chinese": 0.005},
                {"Korean": 0.004},
                {"Other": 0.004}
            ],
            traditional_foods=[
                "Sushi", "Ramen", "Tempura", "Soba", "Udon", "Miso Soup",
                "Yakitori", "Tonkatsu", "Bento", "Mochi", "Sake"
            ],
            festivals=[
                {"name": "Cherry Blossom Festival", "date": "April", "type": "Cultural", "participants": 50000000},
                {"name": "Golden Week", "date": "Late April-Early May", "type": "National", "participants": 127000000},
                {"name": "Obon", "date": "August", "type": "Religious", "participants": 80000000}
            ],
            customs=[
                "Bowing", "Removing shoes indoors", "Gift giving (omiyage)",
                "Respect for elders", "Group harmony (wa)", "Seasonal awareness"
            ],
            social_norms=[
                "Avoiding direct confrontation", "Punctuality essential",
                "Quiet public behavior", "Reading social cues (kuuki wo yomu)",
                "Collective responsibility"
            ],
            business_etiquette=[
                "Business card ritual", "Hierarchy respect", "Consensus building (nemawashi)",
                "After-work socializing", "Long-term relationships"
            ],
            greeting_styles=["Bowing", "Formal language", "Business cards"],
            communication_style="Indirect and contextual",
            hierarchy_level="High",
            collectivism_score=8.1,
            time_orientation="Monochronic",
            music_genres=["J-Pop", "Enka", "Jazz", "Classical", "Rock"],
            dance_styles=["Traditional Dance", "Butoh", "Hip-Hop", "Contemporary"],
            art_forms=["Calligraphy", "Origami", "Ikebana", "Pottery", "Manga"],
            architectural_styles=["Traditional", "Modern", "Zen", "Contemporary"],
            clothing_styles=["Kimono", "Business Formal", "Street Fashion", "Minimalist"],
            sports_preferences=["Baseball", "Sumo", "Football", "Tennis", "Martial Arts"]
        )
        
        # United States
        self.cultural_profiles["United States"] = CulturalProfile(
            country="United States",
            primary_language="English",
            secondary_languages=["Spanish", "Chinese", "French", "German", "Arabic"],
            religions=[
                {"Christian": 0.65},
                {"Unaffiliated": 0.23},
                {"Jewish": 0.02},
                {"Muslim": 0.015},
                {"Hindu": 0.007},
                {"Buddhist": 0.007},
                {"Other": 0.041}
            ],
            ethnic_groups=[
                {"White": 0.723},
                {"Hispanic/Latino": 0.185},
                {"Black/African American": 0.134},
                {"Asian": 0.062},
                {"Native American": 0.013},
                {"Other": 0.027}
            ],
            traditional_foods=[
                "Hamburger", "Hot Dog", "Apple Pie", "BBQ", "Mac and Cheese",
                "Fried Chicken", "Pancakes", "Buffalo Wings", "Clam Chowder", "Cheesecake"
            ],
            festivals=[
                {"name": "Independence Day", "date": "July 4", "type": "National", "participants": 330000000},
                {"name": "Thanksgiving", "date": "November", "type": "Cultural", "participants": 300000000},
                {"name": "Super Bowl", "date": "February", "type": "Sports", "participants": 100000000}
            ],
            customs=[
                "Firm handshakes", "Personal space respect", "Small talk",
                "Tipping culture", "Casual dress", "Individual achievement focus"
            ],
            social_norms=[
                "Direct communication", "Punctuality important",
                "Equality emphasis", "Networking culture", "Work-life balance varies"
            ],
            business_etiquette=[
                "Direct communication", "Individual achievement", "Networking events",
                "Casual Friday", "Performance-based rewards"
            ],
            greeting_styles=["Handshake", "Wave", "Hug (close friends)", "Verbal greeting"],
            communication_style="Direct and explicit",
            hierarchy_level="Low-Medium",
            collectivism_score=2.1,
            time_orientation="Monochronic",
            music_genres=["Pop", "Country", "Hip-Hop", "Rock", "Jazz", "Blues"],
            dance_styles=["Hip-Hop", "Line Dancing", "Ballroom", "Contemporary"],
            art_forms=["Pop Art", "Abstract", "Street Art", "Photography"],
            architectural_styles=["Colonial", "Modern", "Art Deco", "Contemporary"],
            clothing_styles=["Casual", "Business Casual", "Athleisure", "Preppy"],
            sports_preferences=["American Football", "Basketball", "Baseball", "Soccer", "Tennis"]
        )
        
    async def load_social_behaviors(self):
        """Load social behavior patterns for different locations"""
        
        # Paris social behaviors
        self.social_behaviors["Paris, France"] = SocialBehavior(
            location="Paris, France",
            time_of_day="varies",
            day_of_week="varies",
            social_activities=[
                {"activity": "Café sitting", "popularity": 0.85, "time": "morning/afternoon"},
                {"activity": "Museum visits", "popularity": 0.72, "time": "afternoon"},
                {"activity": "Evening walks", "popularity": 0.90, "time": "evening"},
                {"activity": "Wine bar socializing", "popularity": 0.68, "time": "evening"}
            ],
            gathering_spots=[
                {"location": "Café de Flore", "type": "café", "capacity": 200, "atmosphere": "intellectual"},
                {"location": "Place des Vosges", "type": "square", "capacity": 1000, "atmosphere": "romantic"},
                {"location": "Latin Quarter", "type": "district", "capacity": 5000, "atmosphere": "bohemian"}
            ],
            interaction_patterns={
                "stranger_friendliness": 0.45,
                "group_socializing": 0.78,
                "public_affection": 0.62,
                "personal_space": 0.55,
                "eye_contact": 0.70
            },
            mood_indicators={
                "happiness": 0.72,
                "stress": 0.58,
                "satisfaction": 0.68,
                "energy": 0.65,
                "optimism": 0.70
            },
            social_media_activity={
                "posts_per_hour": 15000,
                "instagram_stories": 8000,
                "location_tags": 12000,
                "trending_topics": ["#ParisLife", "#Culture", "#Fashion"]
            },
            community_events=[
                {"name": "Neighborhood Market", "frequency": "daily", "participants": 500},
                {"name": "Street Concerts", "frequency": "weekly", "participants": 200},
                {"name": "Art Exhibition Opening", "frequency": "monthly", "participants": 150}
            ],
            generational_differences={
                "Gen Z": {"tech_usage": 0.95, "traditional_values": 0.35, "global_outlook": 0.88},
                "Millennials": {"tech_usage": 0.85, "traditional_values": 0.45, "global_outlook": 0.82},
                "Gen X": {"tech_usage": 0.65, "traditional_values": 0.65, "global_outlook": 0.70},
                "Boomers": {"tech_usage": 0.35, "traditional_values": 0.85, "global_outlook": 0.55}
            }
        )
        
    async def load_language_data(self):
        """Load language usage patterns"""
        
        self.language_usage["Paris, France"] = LanguageUsage(
            location="Paris, France",
            primary_languages=[
                {"French": 0.88},
                {"English": 0.45},
                {"Arabic": 0.12},
                {"Spanish": 0.08}
            ],
            language_mixing=True,
            accent_variations=["Parisian", "Southern", "Northern", "International"],
            slang_terms=["Verlan", "Modern expressions", "Youth slang"],
            business_language="French with English terms",
            tourist_language_support={
                "English": 0.75,
                "Spanish": 0.45,
                "German": 0.35,
                "Italian": 0.40,
                "Chinese": 0.25
            },
            sign_language_usage=0.05,
            multilingual_percentage=0.67
        )
        
    async def load_economic_behaviors(self):
        """Load economic behavior patterns"""
        
        self.economic_behaviors["Paris, France"] = EconomicBehavior(
            location="Paris, France",
            shopping_patterns={
                "peak_hours": ["12:00-14:00", "18:00-20:00"],
                "preferred_days": ["Saturday", "Sunday"],
                "online_vs_offline": {"online": 0.35, "offline": 0.65},
                "seasonal_variations": {"summer": 0.85, "winter": 1.15}
            },
            payment_preferences={
                "cash": 0.25,
                "card": 0.65,
                "mobile": 0.10
            },
            bargaining_culture=False,
            tipping_customs={
                "restaurants": "5-10%",
                "taxis": "round up",
                "hotels": "1-2 euros",
                "bars": "round up"
            },
            business_hours={
                "shops": "10:00-19:00",
                "restaurants": "12:00-14:00, 19:00-23:00",
                "cafes": "07:00-23:00",
                "banks": "09:00-17:00"
            },
            work_life_balance=7.2,
            economic_inequality=0.29,
            consumer_confidence=6.8,
            entrepreneurship_rate=0.08
        )
        
    async def load_food_cultures(self):
        """Load food culture data"""
        
        self.food_cultures["Paris, France"] = FoodCulture(
            location="Paris, France",
            cuisine_types=[
                {"French": 0.65},
                {"International": 0.20},
                {"Asian": 0.08},
                {"Mediterranean": 0.07}
            ],
            meal_times={
                "breakfast": "07:00-09:00",
                "lunch": "12:00-14:00",
                "dinner": "19:30-22:00",
                "snack": "16:00-17:00"
            },
            dining_etiquette=[
                "Keep hands on table",
                "Wait for 'Bon appétit'",
                "Finish everything on plate",
                "Cheese before dessert",
                "Wine with meals"
            ],
            street_food_culture=6.5,
            vegetarian_percentage=0.05,
            dietary_restrictions={
                "halal": 0.08,
                "kosher": 0.02,
                "vegan": 0.03,
                "gluten_free": 0.02
            },
            food_markets=[
                {"name": "Marché des Enfants Rouges", "type": "covered", "vendors": 30},
                {"name": "Marché Saint-Germain", "type": "outdoor", "vendors": 50},
                {"name": "Marché aux Puces", "type": "flea market with food", "vendors": 15}
            ],
            restaurant_culture={
                "michelin_starred": 134,
                "bistros": 2500,
                "cafes": 7000,
                "brasseries": 800,
                "reservation_culture": True
            },
            cooking_methods=["Sautéing", "Braising", "Roasting", "Poaching", "Flambéing"],
            seasonal_foods={
                "spring": ["Asparagus", "Strawberries", "Artichokes"],
                "summer": ["Tomatoes", "Peaches", "Zucchini"],
                "autumn": ["Mushrooms", "Game", "Chestnuts"],
                "winter": ["Oysters", "Citrus", "Root vegetables"]
            }
        )

# Initialize cultural dynamics database
cultural_db = CulturalDynamicsDatabase()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    """Initialize the cultural dynamics engine on startup"""
    print("🌍 Initializing Cultural & Social Dynamics Engine...")
    await cultural_db.initialize_cultural_data()
    print("✅ Cultural Dynamics Engine Ready!")

@app.websocket("/ws/cultural-dynamics")
async def cultural_dynamics_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Send real-time cultural and social updates
            cultural_update = await generate_real_time_cultural_update()
            await websocket.send_text(json.dumps(cultural_update))
            await asyncio.sleep(3)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def generate_real_time_cultural_update() -> Dict:
    """Generate real-time cultural and social dynamics data"""
    current_time = datetime.datetime.now(pytz.UTC)
    
    return {
        "timestamp": current_time.isoformat(),
        "type": "cultural_update",
        "locations": {
            "Paris, France": await generate_location_cultural_data("Paris, France", current_time),
            "Tokyo, Japan": await generate_location_cultural_data("Tokyo, Japan", current_time),
            "New York, USA": await generate_location_cultural_data("New York, USA", current_time)
        },
        "global_cultural_trends": await generate_global_cultural_trends(),
        "social_movements": await generate_social_movements(),
        "cultural_exchanges": await generate_cultural_exchanges()
    }

async def generate_location_cultural_data(location: str, current_time: datetime.datetime) -> Dict:
    """Generate real-time cultural data for a specific location"""
    
    # Get local time
    local_time = current_time  # Simplified for demo
    hour = local_time.hour
    day_of_week = local_time.strftime('%A')
    
    return {
        "local_time": local_time.strftime("%Y-%m-%d %H:%M:%S"),
        "day_of_week": day_of_week,
        "cultural_activities": generate_cultural_activities(location, hour, day_of_week),
        "social_interactions": generate_social_interactions(location, hour),
        "language_dynamics": generate_language_dynamics(location, hour),
        "food_scene": generate_food_scene(location, hour),
        "economic_activity": generate_economic_cultural_activity(location, hour),
        "generational_patterns": generate_generational_patterns(location, hour),
        "mood_atmosphere": generate_cultural_mood(location, hour),
        "cultural_events": generate_live_cultural_events(location),
        "social_media_pulse": generate_social_media_cultural_pulse(location),
        "traditional_vs_modern": generate_tradition_modernity_balance(location, hour)
    }

def generate_cultural_activities(location: str, hour: int, day_of_week: str) -> Dict:
    """Generate current cultural activities"""
    activities = []
    
    if location == "Paris, France":
        if 7 <= hour <= 10:
            activities = [
                {"activity": "Morning café culture", "participants": random.randint(50000, 100000), "intensity": "high"},
                {"activity": "Bakery visits", "participants": random.randint(80000, 150000), "intensity": "very high"},
                {"activity": "Commuter reading", "participants": random.randint(200000, 400000), "intensity": "medium"}
            ]
        elif 12 <= hour <= 14:
            activities = [
                {"activity": "Lunch socializing", "participants": random.randint(800000, 1200000), "intensity": "very high"},
                {"activity": "Business lunch culture", "participants": random.randint(50000, 100000), "intensity": "high"},
                {"activity": "Park lunching", "participants": random.randint(30000, 80000), "intensity": "medium"}
            ]
        elif 18 <= hour <= 23:
            activities = [
                {"activity": "Aperitif culture", "participants": random.randint(300000, 500000), "intensity": "very high"},
                {"activity": "Evening strolls", "participants": random.randint(200000, 400000), "intensity": "high"},
                {"activity": "Cultural events", "participants": random.randint(20000, 50000), "intensity": "medium"}
            ]
    
    return {
        "current_activities": activities,
        "cultural_hotspots": [
            {"location": "Latin Quarter", "activity_level": random.uniform(0.6, 0.9)},
            {"location": "Marais District", "activity_level": random.uniform(0.7, 0.95)},
            {"location": "Montmartre", "activity_level": random.uniform(0.5, 0.8)}
        ],
        "cultural_intensity": random.choice(["low", "medium", "high", "very high"])
    }

def generate_social_interactions(location: str, hour: int) -> Dict:
    """Generate social interaction patterns"""
    
    interaction_level = "high" if 18 <= hour <= 23 else "medium" if 12 <= hour <= 14 else "low"
    
    return {
        "interaction_level": interaction_level,
        "greeting_patterns": {
            "formal_greetings": random.uniform(0.3, 0.8),
            "casual_interactions": random.uniform(0.5, 0.9),
            "tourist_local_interactions": random.uniform(0.2, 0.6)
        },
        "social_spaces": [
            {"type": "cafés", "occupancy": f"{random.randint(60, 95)}%", "social_intensity": random.uniform(0.6, 0.9)},
            {"type": "parks", "occupancy": f"{random.randint(30, 80)}%", "social_intensity": random.uniform(0.4, 0.7)},
            {"type": "markets", "occupancy": f"{random.randint(40, 90)}%", "social_intensity": random.uniform(0.7, 0.95)}
        ],
        "community_cohesion": random.uniform(0.6, 0.8),
        "intergenerational_mixing": random.uniform(0.4, 0.7)
    }

def generate_language_dynamics(location: str, hour: int) -> Dict:
    """Generate real-time language usage patterns"""
    
    return {
        "primary_language_usage": random.uniform(0.75, 0.95),
        "multilingual_conversations": random.uniform(0.15, 0.35),
        "tourist_language_adaptation": random.uniform(0.4, 0.8),
        "business_language_patterns": {
            "local_language": random.uniform(0.6, 0.8),
            "english_mixing": random.uniform(0.2, 0.5),
            "technical_terms": random.uniform(0.3, 0.7)
        },
        "generational_language_differences": {
            "youth_slang_usage": random.uniform(0.6, 0.9),
            "traditional_expressions": random.uniform(0.3, 0.7),
            "digital_language_influence": random.uniform(0.5, 0.8)
        },
        "accent_patterns": ["local", "regional", "international"],
        "code_switching_frequency": random.uniform(0.2, 0.6)
    }

def generate_food_scene(location: str, hour: int) -> Dict:
    """Generate current food culture activity"""
    
    if 7 <= hour <= 9:
        scene_type = "breakfast"
        activity_level = "high"
    elif 12 <= hour <= 14:
        scene_type = "lunch"
        activity_level = "very high"
    elif 19 <= hour <= 22:
        scene_type = "dinner"
        activity_level = "very high"
    else:
        scene_type = "casual"
        activity_level = "medium"
    
    return {
        "current_meal_period": scene_type,
        "activity_level": activity_level,
        "popular_foods": generate_time_appropriate_foods(location, hour),
        "restaurant_occupancy": f"{random.randint(50, 95)}%",
        "street_food_activity": random.uniform(0.3, 0.8),
        "food_markets_active": random.randint(5, 25),
        "culinary_events": [
            {"event": "Wine tasting", "participants": random.randint(50, 200)},
            {"event": "Cooking class", "participants": random.randint(20, 80)},
            {"event": "Food festival", "participants": random.randint(500, 5000)}
        ],
        "dietary_trend_adoption": {
            "plant_based": random.uniform(0.05, 0.15),
            "local_sourcing": random.uniform(0.3, 0.7),
            "fusion_cuisine": random.uniform(0.2, 0.5)
        }
    }

def generate_time_appropriate_foods(location: str, hour: int) -> List[str]:
    """Generate foods popular at current time"""
    if location == "Paris, France":
        if 7 <= hour <= 9:
            return ["Croissant", "Pain au chocolat", "Café au lait", "Tartine"]
        elif 12 <= hour <= 14:
            return ["Croque-monsieur", "Salade niçoise", "Quiche", "Baguette sandwich"]
        elif 19 <= hour <= 22:
            return ["Coq au vin", "Ratatouille", "Bouillabaisse", "Tarte tatin"]
    
    return ["Local specialties", "Seasonal dishes", "Traditional meals"]

def generate_economic_cultural_activity(location: str, hour: int) -> Dict:
    """Generate economic activity with cultural context"""
    
    return {
        "shopping_culture": {
            "luxury_goods": random.uniform(0.3, 0.8),
            "local_artisans": random.uniform(0.4, 0.7),
            "vintage_second_hand": random.uniform(0.3, 0.6),
            "farmers_markets": random.uniform(0.5, 0.9)
        },
        "payment_behavior": {
            "cash_preference": random.uniform(0.2, 0.4),
            "contactless_adoption": random.uniform(0.6, 0.9),
            "mobile_payments": random.uniform(0.1, 0.3)
        },
        "work_culture": {
            "lunch_break_importance": random.uniform(0.8, 0.95),
            "after_work_socializing": random.uniform(0.5, 0.8),
            "weekend_work": random.uniform(0.1, 0.3)
        },
        "tourist_economic_impact": {
            "local_business_boost": random.uniform(0.4, 0.8),
            "cultural_site_revenue": random.uniform(0.6, 0.9),
            "hospitality_demand": random.uniform(0.5, 0.85)
        }
    }

def generate_generational_patterns(location: str, hour: int) -> Dict:
    """Generate generational behavior patterns"""
    
    return {
        "digital_natives": {
            "social_media_usage": random.uniform(0.8, 0.95),
            "traditional_culture_engagement": random.uniform(0.3, 0.6),
            "global_vs_local_preference": random.uniform(0.6, 0.8)
        },
        "millennials": {
            "work_life_balance_priority": random.uniform(0.7, 0.9),
            "cultural_experience_seeking": random.uniform(0.8, 0.95),
            "sustainability_consciousness": random.uniform(0.6, 0.85)
        },
        "generation_x": {
            "traditional_values_adherence": random.uniform(0.6, 0.8),
            "technological_adaptation": random.uniform(0.5, 0.7),
            "family_time_priority": random.uniform(0.8, 0.95)
        },
        "baby_boomers": {
            "cultural_heritage_preservation": random.uniform(0.8, 0.95),
            "community_involvement": random.uniform(0.7, 0.9),
            "leisure_activity_engagement": random.uniform(0.6, 0.8)
        },
        "intergenerational_activities": [
            {"activity": "Family meals", "participation": random.uniform(0.7, 0.9)},
            {"activity": "Cultural events", "participation": random.uniform(0.5, 0.8)},
            {"activity": "Community festivals", "participation": random.uniform(0.6, 0.85)}
        ]
    }

def generate_cultural_mood(location: str, hour: int) -> Dict:
    """Generate current cultural mood and atmosphere"""
    
    base_mood = random.uniform(0.6, 0.8)
    
    # Adjust based on time of day
    if 7 <= hour <= 9:
        energy_modifier = 0.1  # Morning energy
    elif 12 <= hour <= 14:
        energy_modifier = 0.15  # Lunch sociability
    elif 18 <= hour <= 23:
        energy_modifier = 0.2  # Evening liveliness
    else:
        energy_modifier = -0.1  # Quieter times
    
    return {
        "overall_mood": min(1.0, base_mood + energy_modifier),
        "energy_level": random.uniform(0.5, 0.9),
        "social_openness": random.uniform(0.4, 0.8),
        "cultural_pride": random.uniform(0.7, 0.9),
        "innovation_acceptance": random.uniform(0.5, 0.8),
        "stress_levels": random.uniform(0.3, 0.7),
        "community_satisfaction": random.uniform(0.6, 0.85),
        "cultural_confidence": random.uniform(0.7, 0.9),
        "atmospheric_descriptors": [
            random.choice(["vibrant", "relaxed", "energetic", "contemplative"]),
            random.choice(["welcoming", "bustling", "serene", "dynamic"]),
            random.choice(["traditional", "modern", "eclectic", "sophisticated"])
        ]
    }

def generate_live_cultural_events(location: str) -> List[Dict]:
    """Generate currently happening cultural events"""
    
    events = [
        {
            "name": "Neighborhood Art Walk",
            "type": "cultural",
            "participants": random.randint(100, 500),
            "cultural_significance": "medium",
            "tourist_appeal": random.uniform(0.3, 0.7)
        },
        {
            "name": "Traditional Music Performance",
            "type": "musical",
            "participants": random.randint(50, 300),
            "cultural_significance": "high",
            "tourist_appeal": random.uniform(0.6, 0.9)
        },
        {
            "name": "Local Food Festival",
            "type": "culinary",
            "participants": random.randint(200, 2000),
            "cultural_significance": "high",
            "tourist_appeal": random.uniform(0.7, 0.95)
        }
    ]
    
    return random.sample(events, random.randint(1, 3))

def generate_social_media_cultural_pulse(location: str) -> Dict:
    """Generate social media cultural activity"""
    
    return {
        "trending_cultural_topics": [
            "#LocalTraditions",
            "#CulturalFusion",
            "#StreetArt",
            "#LocalFood",
            "#CommunityEvents"
        ],
        "cultural_hashtag_volume": random.randint(1000, 10000),
        "cross_cultural_posts": random.randint(500, 3000),
        "cultural_influencer_activity": random.uniform(0.4, 0.8),
        "tourist_cultural_sharing": random.randint(200, 1500),
        "local_pride_expressions": random.uniform(0.6, 0.9),
        "cultural_debate_topics": [
            "Traditional vs Modern",
            "Cultural Preservation",
            "Tourism Impact",
            "Language Evolution"
        ]
    }

def generate_tradition_modernity_balance(location: str, hour: int) -> Dict:
    """Generate the balance between traditional and modern cultural elements"""
    
    return {
        "traditional_practices_active": random.uniform(0.4, 0.8),
        "modern_adaptations": random.uniform(0.6, 0.9),
        "cultural_fusion_examples": [
            "Traditional crafts with modern design",
            "Classical music with contemporary elements",
            "Historic architecture with modern amenities",
            "Traditional cuisine with international influences"
        ],
        "preservation_efforts": random.uniform(0.5, 0.8),
        "innovation_integration": random.uniform(0.6, 0.85),
        "generational_bridge_activities": [
            {"activity": "Cultural workshops", "effectiveness": random.uniform(0.6, 0.9)},
            {"activity": "Heritage tours", "effectiveness": random.uniform(0.5, 0.8)},
            {"activity": "Storytelling events", "effectiveness": random.uniform(0.7, 0.95)}
        ],
        "cultural_evolution_rate": random.uniform(0.3, 0.7)
    }

async def generate_global_cultural_trends() -> List[Dict]:
    """Generate global cultural trends"""
    
    return [
        {
            "trend": "Digital Cultural Exchange",
            "growth_rate": random.uniform(0.15, 0.35),
            "global_reach": random.uniform(0.6, 0.9),
            "impact_level": "high"
        },
        {
            "trend": "Sustainable Cultural Tourism",
            "growth_rate": random.uniform(0.10, 0.25),
            "global_reach": random.uniform(0.4, 0.7),
            "impact_level": "medium"
        },
        {
            "trend": "Fusion Cuisine Movement",
            "growth_rate": random.uniform(0.08, 0.20),
            "global_reach": random.uniform(0.5, 0.8),
            "impact_level": "medium"
        }
    ]

async def generate_social_movements() -> List[Dict]:
    """Generate active social movements"""
    
    return [
        {
            "movement": "Cultural Heritage Preservation",
            "participants": random.randint(100000, 1000000),
            "geographic_spread": "global",
            "momentum": random.uniform(0.6, 0.9)
        },
        {
            "movement": "Local Language Revitalization",
            "participants": random.randint(50000, 500000),
            "geographic_spread": "regional",
            "momentum": random.uniform(0.5, 0.8)
        }
    ]

async def generate_cultural_exchanges() -> List[Dict]:
    """Generate cultural exchange activities"""
    
    return [
        {
            "exchange": "International Student Programs",
            "participants": random.randint(500000, 2000000),
            "cultural_impact": random.uniform(0.7, 0.95),
            "countries_involved": random.randint(50, 150)
        },
        {
            "exchange": "Artist Residency Programs",
            "participants": random.randint(10000, 100000),
            "cultural_impact": random.uniform(0.8, 0.98),
            "countries_involved": random.randint(30, 80)
        }
    ]

# API Endpoints

@app.get("/api/cultural-profile/{location}")
async def get_cultural_profile(location: str):
    """Get comprehensive cultural profile for a location"""
    
    # Extract country from location
    country = location.split(", ")[-1] if ", " in location else location
    
    if country in cultural_db.cultural_profiles:
        return cultural_db.cultural_profiles[country]
    else:
        return {"error": "Cultural profile not found for this location"}

@app.get("/api/social-behavior/{location}")
async def get_social_behavior(location: str):
    """Get current social behavior patterns for a location"""
    
    if location in cultural_db.social_behaviors:
        return cultural_db.social_behaviors[location]
    else:
        return {"error": "Social behavior data not found for this location"}

@app.get("/api/language-usage/{location}")
async def get_language_usage(location: str):
    """Get language usage patterns for a location"""
    
    if location in cultural_db.language_usage:
        return cultural_db.language_usage[location]
    else:
        return {"error": "Language usage data not found for this location"}

@app.get("/api/food-culture/{location}")
async def get_food_culture(location: str):
    """Get food culture information for a location"""
    
    if location in cultural_db.food_cultures:
        return cultural_db.food_cultures[location]
    else:
        return {"error": "Food culture data not found for this location"}

@app.get("/api/cultural-calendar/{location}")
async def get_cultural_calendar(location: str):
    """Get cultural events calendar for a location"""
    
    # Generate mock cultural calendar
    current_date = datetime.datetime.now()
    events = []
    
    for i in range(30):  # Next 30 days
        event_date = current_date + datetime.timedelta(days=i)
        if random.random() < 0.3:  # 30% chance of event each day
            events.append({
                "date": event_date.strftime("%Y-%m-%d"),
                "event": random.choice([
                    "Art Exhibition Opening", "Music Concert", "Food Festival",
                    "Cultural Workshop", "Traditional Dance", "Local Market",
                    "Film Screening", "Literary Reading", "Craft Fair"
                ]),
                "cultural_significance": random.choice(["low", "medium", "high"]),
                "expected_attendance": random.randint(50, 5000)
            })
    
    return {"location": location, "events": events}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
