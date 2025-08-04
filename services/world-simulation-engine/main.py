"""
Ultra-Comprehensive World Simulation Engine
Simulates every aspect of human civilization and natural phenomena
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import datetime
import pytz
import requests
from typing import Dict, List, Any
import numpy as np
from dataclasses import dataclass, asdict
import aiohttp
import uuid
from pydantic import BaseModel
import logging

app = FastAPI(title="World Simulation Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
@dataclass
class Location:
    country: str
    state: str
    city: str
    district: str
    coordinates: tuple
    timezone: str
    population: int
    elevation: int
    climate_zone: str

@dataclass
class WeatherCondition:
    temperature: float
    humidity: int
    pressure: float
    wind_speed: float
    wind_direction: int
    precipitation: float
    visibility: float
    uv_index: int
    air_quality: int
    weather_type: str
    sunrise: str
    sunset: str

@dataclass
class CulturalElement:
    languages: List[str]
    religions: List[str]
    festivals: List[str]
    traditional_foods: List[str]
    customs: List[str]
    music_genres: List[str]
    dance_styles: List[str]
    architecture_style: str
    clothing_styles: List[str]

@dataclass
class EconomicData:
    currency: str
    exchange_rate: float
    gdp_per_capita: float
    unemployment_rate: float
    inflation_rate: float
    cost_of_living_index: float
    average_income: float
    poverty_rate: float

@dataclass
class Infrastructure:
    roads: Dict[str, int]  # road types and lengths
    railways: Dict[str, int]
    airports: List[str]
    ports: List[str]
    hospitals: int
    schools: int
    universities: int
    banks: int
    shopping_centers: int
    restaurants: int
    hotels: int
    churches: int
    mosques: int
    temples: int
    parks: int
    museums: int
    theaters: int

@dataclass
class TransportSystem:
    bus_routes: List[str]
    metro_lines: List[str]
    taxi_availability: int
    bike_sharing: bool
    traffic_density: float
    parking_availability: float
    public_transport_efficiency: float

@dataclass
class NaturalEnvironment:
    forests: Dict[str, float]  # forest types and coverage
    rivers: List[str]
    lakes: List[str]
    mountains: List[str]
    beaches: List[str]
    wildlife: List[str]
    protected_areas: List[str]
    biodiversity_index: float
    pollution_levels: Dict[str, float]

@dataclass
class LiveActivity:
    current_events: List[str]
    traffic_conditions: Dict[str, str]
    public_transport_status: Dict[str, str]
    business_hours: Dict[str, str]
    crowd_levels: Dict[str, int]
    emergency_services: Dict[str, bool]
    construction_projects: List[str]

# Global World Database
class WorldDatabase:
    def __init__(self):
        self.locations = {}
        self.weather_cache = {}
        self.cultural_data = {}
        self.economic_data = {}
        self.infrastructure_data = {}
        self.transport_data = {}
        self.environment_data = {}
        self.live_activities = {}
        
    async def initialize_world_data(self):
        """Initialize comprehensive world data"""
        await self.load_countries_data()
        await self.load_cities_data()
        await self.generate_infrastructure_data()
        await self.generate_transport_systems()
        await self.generate_natural_environment()
        
    async def load_countries_data(self):
        """Load all countries and their basic data"""
        try:
            async with aiohttp.ClientSession() as session:
                # Free REST Countries API
                async with session.get("https://restcountries.com/v3.1/all") as response:
                    countries = await response.json()
                    
                for country in countries:
                    country_name = country.get('name', {}).get('common', '')
                    if country_name:
                        self.locations[country_name] = {
                            'capital': country.get('capital', [''])[0] if country.get('capital') else '',
                            'population': country.get('population', 0),
                            'area': country.get('area', 0),
                            'region': country.get('region', ''),
                            'subregion': country.get('subregion', ''),
                            'languages': list(country.get('languages', {}).values()) if country.get('languages') else [],
                            'currencies': list(country.get('currencies', {}).keys()) if country.get('currencies') else [],
                            'timezones': country.get('timezones', []),
                            'coordinates': country.get('latlng', [0, 0]),
                            'flag': country.get('flag', ''),
                            'borders': country.get('borders', [])
                        }
        except Exception as e:
            logging.error(f"Error loading countries data: {e}")
            
    async def generate_infrastructure_data(self):
        """Generate infrastructure data for locations"""
        pass
        
    async def generate_transport_systems(self):
        """Generate transport systems for locations"""
        pass
        
    async def generate_natural_environment(self):
        """Generate natural environment data"""
        pass
            
    async def load_cities_data(self):
        """Generate comprehensive city data for major cities worldwide"""
        major_cities = [
            # Europe
            ("London", "UK", [51.5074, -0.1278]), ("Paris", "France", [48.8566, 2.3522]),
            ("Berlin", "Germany", [52.5200, 13.4050]), ("Rome", "Italy", [41.9028, 12.4964]),
            ("Madrid", "Spain", [40.4168, -3.7038]), ("Amsterdam", "Netherlands", [52.3676, 4.9041]),
            ("Vienna", "Austria", [48.2082, 16.3738]), ("Prague", "Czech Republic", [50.0755, 14.4378]),
            ("Budapest", "Hungary", [47.4979, 19.0402]), ("Warsaw", "Poland", [52.2297, 21.0122]),
            
            # Asia
            ("Tokyo", "Japan", [35.6762, 139.6503]), ("Beijing", "China", [39.9042, 116.4074]),
            ("Mumbai", "India", [19.0760, 72.8777]), ("Delhi", "India", [28.7041, 77.1025]),
            ("Bangkok", "Thailand", [13.7563, 100.5018]), ("Singapore", "Singapore", [1.3521, 103.8198]),
            ("Seoul", "South Korea", [37.5665, 126.9780]), ("Hong Kong", "Hong Kong", [22.3193, 114.1694]),
            ("Dubai", "UAE", [25.2048, 55.2708]), ("Istanbul", "Turkey", [41.0082, 28.9784]),
            
            # Americas
            ("New York", "USA", [40.7128, -74.0060]), ("Los Angeles", "USA", [34.0522, -118.2437]),
            ("Chicago", "USA", [41.8781, -87.6298]), ("Toronto", "Canada", [43.6532, -79.3832]),
            ("Mexico City", "Mexico", [19.4326, -99.1332]), ("São Paulo", "Brazil", [-23.5505, -46.6333]),
            ("Buenos Aires", "Argentina", [-34.6118, -58.3960]), ("Lima", "Peru", [-12.0464, -77.0428]),
            
            # Africa
            ("Cairo", "Egypt", [30.0444, 31.2357]), ("Lagos", "Nigeria", [6.5244, 3.3792]),
            ("Johannesburg", "South Africa", [-26.2041, 28.0473]), ("Casablanca", "Morocco", [33.5731, -7.5898]),
            
            # Oceania
            ("Sydney", "Australia", [-33.8688, 151.2093]), ("Melbourne", "Australia", [-37.8136, 144.9631]),
            ("Auckland", "New Zealand", [-36.8485, 174.7633])
        ]
        
        for city, country, coords in major_cities:
            self.locations[f"{city}, {country}"] = await self.generate_comprehensive_city_data(city, country, coords)
            
    async def generate_comprehensive_city_data(self, city: str, country: str, coords: List[float]) -> Dict:
        """Generate ultra-detailed city data"""
        population = random.randint(500000, 15000000)
        
        return {
            'coordinates': coords,
            'population': population,
            'timezone': self.get_timezone_from_coords(coords),
            'elevation': random.randint(0, 2000),
            'climate_zone': self.determine_climate_zone(coords),
            
            # Urban Infrastructure
            'districts': self.generate_districts(city, population),
            'neighborhoods': self.generate_neighborhoods(city, population),
            'streets': self.generate_street_network(city, population),
            
            # Transportation
            'transport': {
                'metro_lines': random.randint(2, 15),
                'bus_routes': random.randint(50, 500),
                'taxi_companies': random.randint(5, 20),
                'bike_sharing_stations': random.randint(100, 1000),
                'airports': random.randint(1, 3),
                'train_stations': random.randint(2, 10),
                'ports': random.randint(0, 3)
            },
            
            # Educational Institutions
            'education': {
                'primary_schools': population // 5000,
                'secondary_schools': population // 10000,
                'universities': random.randint(1, 20),
                'vocational_schools': random.randint(5, 50),
                'libraries': random.randint(10, 100)
            },
            
            # Healthcare
            'healthcare': {
                'hospitals': population // 50000,
                'clinics': population // 10000,
                'pharmacies': population // 5000,
                'emergency_services': True
            },
            
            # Commercial & Business
            'commercial': {
                'shopping_malls': random.randint(5, 50),
                'supermarkets': population // 20000,
                'restaurants': population // 1000,
                'cafes': population // 2000,
                'banks': random.randint(20, 200),
                'atms': population // 5000,
                'gas_stations': random.randint(50, 500)
            },
            
            # Entertainment & Culture
            'entertainment': {
                'theaters': random.randint(5, 30),
                'cinemas': random.randint(10, 100),
                'museums': random.randint(5, 50),
                'art_galleries': random.randint(10, 100),
                'sports_stadiums': random.randint(1, 10),
                'parks': random.randint(20, 200),
                'nightclubs': random.randint(10, 100),
                'amusement_parks': random.randint(0, 5)
            },
            
            # Religious & Spiritual
            'religious': {
                'churches': random.randint(10, 200),
                'mosques': random.randint(0, 100),
                'temples': random.randint(0, 50),
                'synagogues': random.randint(0, 20),
                'other_religious_sites': random.randint(5, 50)
            },
            
            # Hotels & Accommodation
            'accommodation': {
                'luxury_hotels': random.randint(5, 50),
                'mid_range_hotels': random.randint(20, 200),
                'budget_hotels': random.randint(50, 500),
                'hostels': random.randint(10, 100),
                'vacation_rentals': random.randint(100, 5000)
            },
            
            # Natural Features
            'natural_features': {
                'rivers': self.generate_rivers(city),
                'lakes': self.generate_lakes(city),
                'forests': self.generate_urban_forests(city),
                'beaches': self.generate_beaches(city, coords),
                'mountains': self.generate_nearby_mountains(coords),
                'wildlife': self.generate_urban_wildlife(city)
            }
        }
        
    def generate_districts(self, city: str, population: int) -> List[Dict]:
        """Generate city districts with unique characteristics"""
        num_districts = min(20, max(5, population // 200000))
        districts = []
        
        district_types = [
            "Financial District", "Historic Center", "Shopping District", "Residential Area",
            "Industrial Zone", "Tech Hub", "Arts Quarter", "Waterfront", "University District",
            "Entertainment District", "Government Quarter", "Cultural District"
        ]
        
        for i in range(num_districts):
            district_type = random.choice(district_types)
            districts.append({
                'name': f"{city} {district_type} {i+1}",
                'type': district_type,
                'population': random.randint(10000, 500000),
                'area_km2': random.uniform(1, 50),
                'characteristics': self.generate_district_characteristics(district_type)
            })
            
        return districts
        
    def generate_district_characteristics(self, district_type: str) -> Dict:
        """Generate specific characteristics for each district type"""
        characteristics = {
            "Financial District": {
                'skyscrapers': random.randint(10, 100),
                'banks': random.randint(20, 200),
                'business_centers': random.randint(5, 50),
                'avg_building_height': random.randint(20, 80)
            },
            "Historic Center": {
                'historic_buildings': random.randint(50, 500),
                'monuments': random.randint(5, 50),
                'museums': random.randint(3, 20),
                'oldest_building_year': random.randint(1200, 1800)
            },
            "Shopping District": {
                'shopping_centers': random.randint(5, 30),
                'boutiques': random.randint(100, 1000),
                'restaurants': random.randint(50, 500),
                'pedestrian_zones': random.randint(2, 10)
            }
        }
        
        return characteristics.get(district_type, {})
        
    def generate_neighborhoods(self, city: str, population: int) -> List[Dict]:
        """Generate detailed neighborhoods within the city"""
        num_neighborhoods = min(100, max(20, population // 50000))
        neighborhoods = []
        
        neighborhood_types = [
            "Upscale Residential", "Middle Class Residential", "Working Class", "Student Area",
            "Artist Quarter", "Business District", "Shopping Area", "Historic Neighborhood",
            "Waterfront Community", "Suburban Area", "Industrial Residential", "Ethnic Enclave"
        ]
        
        for i in range(num_neighborhoods):
            neighborhood_type = random.choice(neighborhood_types)
            neighborhoods.append({
                'name': f"{city} {neighborhood_type} {i+1}",
                'type': neighborhood_type,
                'population': random.randint(5000, 50000),
                'avg_rent': random.randint(500, 5000),
                'safety_rating': random.uniform(3.0, 9.5),
                'walkability_score': random.randint(50, 100),
                'amenities': self.generate_neighborhood_amenities(neighborhood_type)
            })
            
        return neighborhoods
        
    def generate_neighborhood_amenities(self, neighborhood_type: str) -> List[str]:
        """Generate amenities based on neighborhood type"""
        all_amenities = [
            "Grocery Store", "Pharmacy", "Coffee Shop", "Restaurant", "Park", "School",
            "Bank", "Post Office", "Gym", "Library", "Medical Clinic", "Public Transport",
            "Shopping Center", "Cinema", "Playground", "Community Center", "Gas Station"
        ]
        
        # Different neighborhood types have different amenity distributions
        if neighborhood_type == "Upscale Residential":
            return random.sample(all_amenities, random.randint(12, 17))
        elif neighborhood_type == "Student Area":
            student_amenities = all_amenities + ["University", "Student Housing", "Bookstore", "Internet Cafe"]
            return random.sample(student_amenities, random.randint(10, 15))
        else:
            return random.sample(all_amenities, random.randint(8, 14))
            
    def generate_street_network(self, city: str, population: int) -> Dict:
        """Generate comprehensive street network"""
        return {
            'highways': random.randint(2, 10),
            'main_roads': random.randint(50, 500),
            'secondary_roads': random.randint(200, 2000),
            'residential_streets': random.randint(1000, 10000),
            'pedestrian_zones': random.randint(5, 50),
            'bike_lanes_km': random.randint(50, 1000),
            'total_road_length_km': random.randint(1000, 50000)
        }
        
    def generate_rivers(self, city: str) -> List[Dict]:
        """Generate rivers flowing through or near the city"""
        num_rivers = random.randint(0, 5)
        rivers = []
        
        river_names = [f"{city} River", f"Great {city} River", f"{city} Creek", f"Little {city} River"]
        
        for i in range(num_rivers):
            rivers.append({
                'name': random.choice(river_names) + f" {i+1}" if i > 0 else random.choice(river_names),
                'length_km': random.randint(10, 500),
                'width_m': random.randint(20, 500),
                'depth_m': random.uniform(2, 20),
                'flow_rate': random.uniform(10, 1000),
                'water_quality': random.choice(['Excellent', 'Good', 'Fair', 'Poor']),
                'recreational_activities': random.sample(
                    ['Boating', 'Fishing', 'Swimming', 'Kayaking', 'River Cruise', 'Walking Path'], 
                    random.randint(2, 6)
                )
            })
            
        return rivers
        
    def generate_lakes(self, city: str) -> List[Dict]:
        """Generate lakes within or near the city"""
        num_lakes = random.randint(0, 8)
        lakes = []
        
        for i in range(num_lakes):
            lakes.append({
                'name': f"{city} Lake {i+1}",
                'area_km2': random.uniform(0.5, 100),
                'max_depth_m': random.uniform(5, 200),
                'water_type': random.choice(['Freshwater', 'Saltwater', 'Brackish']),
                'recreational_activities': random.sample(
                    ['Swimming', 'Boating', 'Fishing', 'Water Sports', 'Picnicking', 'Bird Watching'],
                    random.randint(2, 5)
                )
            })
            
        return lakes
        
    def generate_urban_forests(self, city: str) -> List[Dict]:
        """Generate urban forests and green spaces"""
        num_forests = random.randint(1, 10)
        forests = []
        
        for i in range(num_forests):
            forests.append({
                'name': f"{city} Urban Forest {i+1}",
                'area_hectares': random.uniform(10, 1000),
                'tree_species': random.sample([
                    'Oak', 'Pine', 'Maple', 'Birch', 'Cedar', 'Willow', 'Elm', 'Poplar'
                ], random.randint(3, 8)),
                'wildlife': random.sample([
                    'Squirrels', 'Birds', 'Rabbits', 'Deer', 'Foxes', 'Raccoons'
                ], random.randint(2, 5)),
                'facilities': random.sample([
                    'Walking Trails', 'Picnic Areas', 'Playground', 'Visitor Center', 'Parking'
                ], random.randint(2, 5))
            })
            
        return forests
        
    def generate_beaches(self, city: str, coords: List[float]) -> List[Dict]:
        """Generate beaches if the city is coastal"""
        # Simple check for coastal cities (this would be more sophisticated in reality)
        is_coastal = random.choice([True, False]) if abs(coords[0]) < 60 else False
        
        if not is_coastal:
            return []
            
        num_beaches = random.randint(1, 8)
        beaches = []
        
        beach_types = ['Sandy', 'Rocky', 'Pebble', 'Mixed']
        
        for i in range(num_beaches):
            beaches.append({
                'name': f"{city} Beach {i+1}",
                'length_km': random.uniform(0.5, 10),
                'type': random.choice(beach_types),
                'water_temperature_avg': random.uniform(15, 28),
                'amenities': random.sample([
                    'Lifeguards', 'Beach Volleyball', 'Restaurants', 'Showers', 'Parking',
                    'Water Sports Rental', 'Beach Chairs', 'Umbrellas', 'Boardwalk'
                ], random.randint(3, 8)),
                'activities': random.sample([
                    'Swimming', 'Surfing', 'Sunbathing', 'Beach Games', 'Fishing', 'Boating'
                ], random.randint(2, 5))
            })
            
        return beaches
        
    def generate_nearby_mountains(self, coords: List[float]) -> List[Dict]:
        """Generate mountains near the city"""
        # Mountainous regions are more likely at certain latitudes
        mountain_probability = max(0, min(1, (abs(coords[0]) - 20) / 50))
        
        if random.random() > mountain_probability:
            return []
            
        num_mountains = random.randint(1, 5)
        mountains = []
        
        for i in range(num_mountains):
            mountains.append({
                'name': f"Mount {chr(65+i)}",
                'height_m': random.randint(500, 4000),
                'distance_km': random.randint(10, 100),
                'hiking_trails': random.randint(2, 15),
                'difficulty_levels': random.sample(['Easy', 'Moderate', 'Difficult', 'Expert'], random.randint(2, 4)),
                'amenities': random.sample([
                    'Visitor Center', 'Parking', 'Restrooms', 'Camping', 'Ski Resort', 'Cable Car'
                ], random.randint(2, 5))
            })
            
        return mountains
        
    def generate_urban_wildlife(self, city: str) -> List[Dict]:
        """Generate urban wildlife found in the city"""
        common_wildlife = [
            {'species': 'Pigeons', 'population': random.randint(10000, 100000), 'habitat': 'Streets, Parks'},
            {'species': 'Squirrels', 'population': random.randint(1000, 50000), 'habitat': 'Parks, Trees'},
            {'species': 'Sparrows', 'population': random.randint(5000, 80000), 'habitat': 'Buildings, Parks'},
            {'species': 'Cats (Stray)', 'population': random.randint(500, 10000), 'habitat': 'Alleys, Buildings'},
            {'species': 'Rats', 'population': random.randint(50000, 500000), 'habitat': 'Underground, Buildings'},
            {'species': 'Seagulls', 'population': random.randint(1000, 20000), 'habitat': 'Waterfront, Streets'},
            {'species': 'Crows', 'population': random.randint(2000, 30000), 'habitat': 'Trees, Buildings'},
            {'species': 'Rabbits', 'population': random.randint(500, 15000), 'habitat': 'Parks, Gardens'}
        ]
        
        return random.sample(common_wildlife, random.randint(4, 8))
        
    def get_timezone_from_coords(self, coords: List[float]) -> str:
        """Determine timezone from coordinates"""
        # Simplified timezone calculation
        longitude = coords[1]
        timezone_offset = int(longitude / 15)
        
        timezone_map = {
            -12: "Pacific/Kwajalein", -11: "Pacific/Midway", -10: "Pacific/Honolulu",
            -9: "America/Anchorage", -8: "America/Los_Angeles", -7: "America/Denver",
            -6: "America/Chicago", -5: "America/New_York", -4: "America/Caracas",
            -3: "America/Sao_Paulo", -2: "Atlantic/South_Georgia", -1: "Atlantic/Azores",
            0: "Europe/London", 1: "Europe/Paris", 2: "Europe/Berlin",
            3: "Europe/Moscow", 4: "Asia/Dubai", 5: "Asia/Karachi",
            6: "Asia/Dhaka", 7: "Asia/Bangkok", 8: "Asia/Shanghai",
            9: "Asia/Tokyo", 10: "Australia/Sydney", 11: "Pacific/Norfolk",
            12: "Pacific/Auckland"
        }
        
        return timezone_map.get(timezone_offset, "UTC")
        
    def determine_climate_zone(self, coords: List[float]) -> str:
        """Determine climate zone from coordinates"""
        latitude = abs(coords[0])
        
        if latitude < 23.5:
            return "Tropical"
        elif latitude < 35:
            return "Subtropical"
        elif latitude < 50:
            return "Temperate"
        elif latitude < 66.5:
            return "Continental"
        else:
            return "Polar"

# Initialize world database
world_db = WorldDatabase()

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
    """Initialize the world simulation on startup"""
    print("🌍 Initializing Ultra-Comprehensive World Simulation...")
    await world_db.initialize_world_data()
    print("✅ World Simulation Engine Ready!")

@app.websocket("/ws/world-simulation")
async def world_simulation_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Send comprehensive world updates every 2 seconds
            world_update = await generate_real_time_world_update()
            await websocket.send_text(json.dumps(world_update))
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def generate_real_time_world_update() -> Dict:
    """Generate real-time world simulation data"""
    current_time = datetime.datetime.now(pytz.UTC)
    
    # Generate updates for major cities
    city_updates = {}
    major_cities = ["London, UK", "Paris, France", "Tokyo, Japan", "New York, USA", "Sydney, Australia"]
    
    for city in major_cities:
        if city in world_db.locations:
            city_updates[city] = await generate_city_real_time_data(city, current_time)
    
    return {
        "timestamp": current_time.isoformat(),
        "type": "world_update",
        "cities": city_updates,
        "global_stats": await generate_global_statistics(),
        "natural_phenomena": await generate_natural_phenomena(),
        "economic_indicators": await generate_global_economic_data(),
        "cultural_events": await generate_global_cultural_events()
    }

async def generate_city_real_time_data(city: str, current_time: datetime.datetime) -> Dict:
    """Generate comprehensive real-time data for a city"""
    city_data = world_db.locations.get(city, {})
    coordinates = city_data.get('coordinates', [0, 0])
    
    # Calculate local time
    timezone_str = city_data.get('timezone', 'UTC')
    try:
        timezone = pytz.timezone(timezone_str)
        local_time = current_time.astimezone(timezone)
    except:
        local_time = current_time
    
    return {
        "local_time": local_time.strftime("%Y-%m-%d %H:%M:%S %Z"),
        "weather": await generate_real_time_weather(coordinates),
        "traffic": generate_traffic_conditions(),
        "public_transport": generate_transport_status(),
        "business_activity": generate_business_activity(local_time.hour),
        "crowd_levels": generate_crowd_levels(local_time.hour),
        "events": generate_city_events(),
        "emergency_services": generate_emergency_status(),
        "air_quality": generate_air_quality(),
        "noise_levels": generate_noise_levels(local_time.hour),
        "energy_consumption": generate_energy_data(local_time.hour),
        "water_usage": generate_water_usage(local_time.hour),
        "waste_management": generate_waste_data(),
        "tourism_activity": generate_tourism_data(local_time.hour),
        "construction_projects": generate_construction_activity(),
        "retail_activity": generate_retail_data(local_time.hour),
        "restaurant_bookings": generate_restaurant_data(local_time.hour),
        "hotel_occupancy": generate_hotel_data(),
        "cultural_activities": generate_cultural_activity_data(local_time),
        "sports_events": generate_sports_events(),
        "educational_activity": generate_education_data(local_time.hour),
        "healthcare_status": generate_healthcare_data(),
        "financial_markets": generate_financial_activity(local_time.hour),
        "technology_usage": generate_tech_usage_data(local_time.hour)
    }

async def generate_real_time_weather(coordinates: List[float]) -> Dict:
    """Generate realistic weather data"""
    return {
        "temperature": round(random.uniform(-10, 35), 1),
        "feels_like": round(random.uniform(-15, 40), 1),
        "humidity": random.randint(30, 90),
        "pressure": round(random.uniform(980, 1030), 1),
        "wind_speed": round(random.uniform(0, 25), 1),
        "wind_direction": random.randint(0, 360),
        "visibility": round(random.uniform(1, 20), 1),
        "uv_index": random.randint(1, 11),
        "precipitation": round(random.uniform(0, 10), 1),
        "cloud_cover": random.randint(0, 100),
        "weather_condition": random.choice([
            "Clear", "Partly Cloudy", "Cloudy", "Overcast", "Light Rain", 
            "Heavy Rain", "Drizzle", "Snow", "Fog", "Thunderstorm"
        ]),
        "sunrise": "06:30",
        "sunset": "19:45"
    }

def generate_traffic_conditions() -> Dict:
    """Generate real-time traffic data"""
    return {
        "overall_congestion": random.choice(["Light", "Moderate", "Heavy", "Severe"]),
        "average_speed_kmh": random.randint(15, 60),
        "incidents": random.randint(0, 15),
        "road_closures": random.randint(0, 5),
        "construction_zones": random.randint(2, 20),
        "parking_availability": f"{random.randint(20, 85)}%",
        "fuel_prices": {
            "gasoline": round(random.uniform(1.20, 2.50), 2),
            "diesel": round(random.uniform(1.10, 2.30), 2)
        }
    }

def generate_transport_status() -> Dict:
    """Generate public transportation status"""
    return {
        "metro_status": random.choice(["Normal", "Delays", "Reduced Service", "Maintenance"]),
        "bus_on_time_percentage": random.randint(75, 95),
        "taxi_availability": random.choice(["High", "Medium", "Low"]),
        "bike_share_availability": f"{random.randint(60, 95)}%",
        "ride_share_surge": random.uniform(1.0, 3.5),
        "ferry_status": random.choice(["Operating", "Delayed", "Cancelled"]) if random.random() > 0.5 else None
    }

def generate_business_activity(hour: int) -> Dict:
    """Generate business activity based on time of day"""
    is_business_hours = 9 <= hour <= 17
    activity_level = "High" if is_business_hours else "Low"
    
    return {
        "activity_level": activity_level,
        "open_businesses_percentage": random.randint(85, 98) if is_business_hours else random.randint(15, 40),
        "office_occupancy": f"{random.randint(70, 95)}%" if is_business_hours else f"{random.randint(5, 25)}%",
        "retail_foot_traffic": random.choice(["High", "Medium", "Low"]),
        "restaurant_bookings": generate_restaurant_bookings(hour),
        "delivery_activity": random.choice(["Very High", "High", "Medium", "Low"])
    }

def generate_restaurant_bookings(hour: int) -> str:
    """Generate restaurant booking levels based on time"""
    if 12 <= hour <= 14 or 18 <= hour <= 21:
        return random.choice(["Very High", "High"])
    elif 7 <= hour <= 10 or 15 <= hour <= 17:
        return "Medium"
    else:
        return random.choice(["Low", "Very Low"])

def generate_crowd_levels(hour: int) -> Dict:
    """Generate crowd levels in different areas"""
    areas = ["Downtown", "Shopping Districts", "Parks", "Tourist Areas", "Transportation Hubs"]
    crowd_data = {}
    
    for area in areas:
        if area == "Parks" and (6 <= hour <= 9 or 17 <= hour <= 20):
            crowd_level = random.choice(["Medium", "High"])
        elif area == "Shopping Districts" and 10 <= hour <= 20:
            crowd_level = random.choice(["High", "Very High"])
        elif area == "Tourist Areas" and 9 <= hour <= 18:
            crowd_level = random.choice(["Medium", "High", "Very High"])
        elif area == "Transportation Hubs" and (7 <= hour <= 9 or 17 <= hour <= 19):
            crowd_level = random.choice(["High", "Very High"])
        else:
            crowd_level = random.choice(["Low", "Medium"])
            
        crowd_data[area] = {
            "level": crowd_level,
            "estimated_people": random.randint(50, 5000),
            "wait_times": f"{random.randint(0, 30)} minutes"
        }
    
    return crowd_data

def generate_city_events() -> List[Dict]:
    """Generate ongoing city events"""
    event_types = [
        "Concert", "Festival", "Sports Game", "Art Exhibition", "Conference",
        "Street Fair", "Food Market", "Cultural Event", "Parade", "Workshop"
    ]
    
    num_events = random.randint(3, 12)
    events = []
    
    for _ in range(num_events):
        events.append({
            "name": f"{random.choice(['Summer', 'Spring', 'Winter', 'Autumn', 'Annual', 'Monthly'])} {random.choice(event_types)}",
            "type": random.choice(event_types),
            "location": f"{random.choice(['Central', 'North', 'South', 'East', 'West'])} District",
            "attendance": random.randint(100, 50000),
            "duration": f"{random.randint(1, 8)} hours",
            "status": random.choice(["Ongoing", "Starting Soon", "Ending Soon"])
        })
    
    return events

def generate_emergency_status() -> Dict:
    """Generate emergency services status"""
    return {
        "fire_department": {
            "active_calls": random.randint(0, 8),
            "response_time_avg": f"{random.randint(4, 12)} minutes",
            "stations_active": random.randint(15, 25)
        },
        "police": {
            "active_incidents": random.randint(5, 30),
            "response_time_avg": f"{random.randint(8, 20)} minutes",
            "patrol_units": random.randint(50, 150)
        },
        "ambulance": {
            "active_calls": random.randint(10, 40),
            "response_time_avg": f"{random.randint(6, 18)} minutes",
            "available_units": random.randint(20, 60)
        },
        "hospitals": {
            "emergency_room_wait": f"{random.randint(15, 180)} minutes",
            "bed_availability": f"{random.randint(70, 95)}%",
            "critical_cases": random.randint(0, 15)
        }
    }

def generate_air_quality() -> Dict:
    """Generate air quality data"""
    aqi = random.randint(15, 200)
    
    if aqi <= 50:
        quality = "Good"
    elif aqi <= 100:
        quality = "Moderate"
    elif aqi <= 150:
        quality = "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        quality = "Unhealthy"
    else:
        quality = "Very Unhealthy"
    
    return {
        "aqi": aqi,
        "quality": quality,
        "pm25": round(random.uniform(5, 75), 1),
        "pm10": round(random.uniform(10, 150), 1),
        "ozone": round(random.uniform(20, 120), 1),
        "no2": round(random.uniform(10, 80), 1),
        "so2": round(random.uniform(5, 50), 1),
        "co": round(random.uniform(0.1, 10), 1)
    }

def generate_noise_levels(hour: int) -> Dict:
    """Generate noise level data based on time"""
    base_noise = 45 if 22 <= hour or hour <= 6 else 65
    traffic_noise = base_noise + random.randint(-5, 15)
    
    return {
        "average_db": traffic_noise,
        "peak_db": traffic_noise + random.randint(10, 25),
        "sources": random.sample([
            "Traffic", "Construction", "Aircraft", "Public Transport", 
            "Pedestrians", "Music", "Industrial", "Events"
        ], random.randint(3, 6)),
        "quiet_zones": random.randint(5, 25)
    }

def generate_energy_data(hour: int) -> Dict:
    """Generate energy consumption data"""
    peak_hours = 7 <= hour <= 9 or 18 <= hour <= 21
    consumption_level = "High" if peak_hours else "Medium" if 10 <= hour <= 17 else "Low"
    
    return {
        "consumption_level": consumption_level,
        "grid_load_percentage": random.randint(60, 95) if peak_hours else random.randint(40, 70),
        "renewable_percentage": random.randint(25, 85),
        "outages": random.randint(0, 3),
        "voltage_stability": random.uniform(95, 100)
    }

def generate_water_usage(hour: int) -> Dict:
    """Generate water usage data"""
    peak_usage = 6 <= hour <= 9 or 18 <= hour <= 22
    
    return {
        "consumption_level": "High" if peak_usage else "Medium",
        "pressure_psi": round(random.uniform(40, 80), 1),
        "quality_rating": random.choice(["Excellent", "Good", "Fair"]),
        "treatment_plants_active": random.randint(3, 8),
        "reservoir_level": f"{random.randint(65, 98)}%"
    }

def generate_waste_data() -> Dict:
    """Generate waste management data"""
    return {
        "collection_routes_active": random.randint(50, 200),
        "recycling_percentage": random.randint(35, 75),
        "landfill_capacity": f"{random.randint(60, 95)}%",
        "composting_facilities": random.randint(5, 15),
        "waste_to_energy_plants": random.randint(1, 5)
    }

def generate_tourism_data(hour: int) -> Dict:
    """Generate tourism activity data"""
    tourist_hours = 9 <= hour <= 18
    
    return {
        "visitor_count": random.randint(5000, 50000) if tourist_hours else random.randint(1000, 15000),
        "hotel_occupancy": f"{random.randint(65, 95)}%",
        "attraction_wait_times": {
            "Museums": f"{random.randint(5, 45)} minutes",
            "Monuments": f"{random.randint(10, 60)} minutes",
            "Tours": f"{random.randint(15, 90)} minutes"
        },
        "tour_groups_active": random.randint(20, 150) if tourist_hours else random.randint(5, 30),
        "visitor_satisfaction": random.uniform(7.5, 9.5)
    }

def generate_construction_activity() -> Dict:
    """Generate construction project data"""
    return {
        "active_projects": random.randint(50, 300),
        "road_work_sites": random.randint(10, 50),
        "building_permits_issued": random.randint(5, 30),
        "completion_this_month": random.randint(2, 15),
        "noise_complaints": random.randint(0, 25)
    }

def generate_retail_data(hour: int) -> Dict:
    """Generate retail activity data"""
    shopping_hours = 10 <= hour <= 21
    
    return {
        "foot_traffic": "High" if shopping_hours else "Low",
        "sales_volume": random.choice(["High", "Medium", "Low"]),
        "queue_lengths": f"{random.randint(2, 15)} people average",
        "popular_categories": random.sample([
            "Fashion", "Electronics", "Food", "Home Goods", "Books", "Toys"
        ], 3),
        "discount_events": random.randint(5, 25)
    }

def generate_hotel_data() -> Dict:
    """Generate hotel occupancy and service data"""
    return {
        "overall_occupancy": f"{random.randint(60, 95)}%",
        "average_rate": f"${random.randint(80, 350)}",
        "guest_satisfaction": random.uniform(7.0, 9.5),
        "services_active": random.sample([
            "Room Service", "Concierge", "Spa", "Restaurant", "Business Center", "Fitness Center"
        ], random.randint(4, 6)),
        "events_hosted": random.randint(2, 15)
    }

def generate_cultural_activity_data(local_time: datetime.datetime) -> Dict:
    """Generate cultural activities based on local time"""
    return {
        "theaters_showing": random.randint(10, 50),
        "museums_open": random.randint(15, 80),
        "art_galleries_active": random.randint(20, 100),
        "cultural_events_today": random.randint(5, 30),
        "music_venues_active": random.randint(8, 40),
        "libraries_open": random.randint(20, 150),
        "community_centers_active": random.randint(10, 50)
    }

def generate_sports_events() -> List[Dict]:
    """Generate sports events and activities"""
    sports = ["Football", "Basketball", "Tennis", "Baseball", "Soccer", "Hockey", "Swimming", "Athletics"]
    events = []
    
    for _ in range(random.randint(2, 8)):
        events.append({
            "sport": random.choice(sports),
            "venue": f"{random.choice(['City', 'Metropolitan', 'Central', 'Olympic'])} {random.choice(['Stadium', 'Arena', 'Center', 'Complex'])}",
            "attendance": random.randint(500, 80000),
            "status": random.choice(["In Progress", "Starting Soon", "Finished", "Scheduled"])
        })
    
    return events

def generate_education_data(hour: int) -> Dict:
    """Generate educational institution data"""
    school_hours = 8 <= hour <= 16
    
    return {
        "schools_in_session": random.randint(200, 800) if school_hours else 0,
        "university_classes_active": random.randint(50, 300) if school_hours else random.randint(10, 100),
        "library_usage": "High" if school_hours else "Medium",
        "student_population_active": random.randint(50000, 300000) if school_hours else random.randint(10000, 80000),
        "research_projects_active": random.randint(100, 500)
    }

def generate_healthcare_data() -> Dict:
    """Generate healthcare system data"""
    return {
        "hospitals_operational": random.randint(15, 50),
        "clinics_open": random.randint(100, 500),
        "emergency_room_capacity": f"{random.randint(70, 95)}%",
        "ambulance_response_time": f"{random.randint(6, 18)} minutes",
        "pharmacy_availability": f"{random.randint(85, 98)}%",
        "medical_procedures_today": random.randint(200, 1500)
    }

def generate_financial_activity(hour: int) -> Dict:
    """Generate financial market and banking activity"""
    market_hours = 9 <= hour <= 16
    
    return {
        "banks_open": random.randint(100, 500) if market_hours else 0,
        "atm_availability": f"{random.randint(95, 99)}%",
        "transaction_volume": "High" if market_hours else "Low",
        "currency_exchange_rate": round(random.uniform(0.8, 1.5), 4),
        "stock_market_status": "Open" if market_hours else "Closed",
        "daily_trading_volume": f"${random.randint(10, 500)} million"
    }

def generate_tech_usage_data(hour: int) -> Dict:
    """Generate technology usage patterns"""
    return {
        "internet_usage": "Peak" if 19 <= hour <= 23 else "High" if 9 <= hour <= 17 else "Medium",
        "mobile_data_consumption": random.choice(["Very High", "High", "Medium"]),
        "wifi_hotspots_active": random.randint(5000, 50000),
        "app_downloads": random.randint(10000, 100000),
        "social_media_activity": "Peak" if 19 <= hour <= 23 else "High",
        "e_commerce_transactions": random.randint(5000, 50000)
    }

async def generate_global_statistics() -> Dict:
    """Generate global world statistics"""
    return {
        "total_world_population": 8100000000 + random.randint(-1000000, 1000000),
        "active_flights": random.randint(8000, 15000),
        "ships_at_sea": random.randint(50000, 80000),
        "global_internet_users": random.randint(5200000000, 5400000000),
        "languages_spoken_today": random.randint(6500, 7000),
        "currencies_in_circulation": random.randint(180, 200),
        "time_zones_active": 24,
        "countries_with_daylight": random.randint(100, 150)
    }

async def generate_natural_phenomena() -> Dict:
    """Generate natural phenomena occurring worldwide"""
    return {
        "active_storms": random.randint(5, 30),
        "earthquakes_today": random.randint(50, 200),
        "volcanic_activity": random.randint(0, 5),
        "forest_fires": random.randint(10, 100),
        "floods": random.randint(2, 20),
        "aurora_activity": random.choice(["High", "Medium", "Low", "None"]),
        "meteor_showers": random.randint(0, 3),
        "solar_activity": random.choice(["High", "Moderate", "Low"])
    }

async def generate_global_economic_data() -> Dict:
    """Generate global economic indicators"""
    return {
        "global_gdp_growth": round(random.uniform(-2.0, 6.0), 2),
        "oil_price_usd": round(random.uniform(60, 120), 2),
        "gold_price_usd": round(random.uniform(1800, 2200), 2),
        "bitcoin_price_usd": round(random.uniform(20000, 70000), 2),
        "global_inflation_avg": round(random.uniform(1.5, 8.0), 2),
        "major_stock_indices": {
            "S&P 500": random.randint(3800, 5200),
            "NASDAQ": random.randint(11000, 16000),
            "Dow Jones": random.randint(32000, 42000),
            "FTSE 100": random.randint(7000, 8500),
            "Nikkei 225": random.randint(25000, 35000)
        }
    }

async def generate_global_cultural_events() -> List[Dict]:
    """Generate cultural events happening worldwide"""
    events = [
        {"name": "International Music Festival", "location": "Various Cities", "participants": random.randint(100000, 1000000)},
        {"name": "Global Art Exhibition", "location": "Major Museums", "participants": random.randint(50000, 500000)},
        {"name": "World Literature Conference", "location": "Academic Institutions", "participants": random.randint(10000, 100000)},
        {"name": "International Food Festival", "location": "Multiple Countries", "participants": random.randint(200000, 2000000)},
        {"name": "Global Sports Championship", "location": "Various Venues", "participants": random.randint(500000, 5000000)}
    ]
    
    return random.sample(events, random.randint(2, len(events)))

# API Endpoints

@app.get("/api/countries")
async def get_all_countries():
    """Get list of all countries with basic info"""
    return {"countries": list(world_db.locations.keys())}

@app.get("/api/country/{country_name}")
async def get_country_details(country_name: str):
    """Get detailed information about a specific country"""
    if country_name not in world_db.locations:
        raise HTTPException(status_code=404, detail="Country not found")
    
    return world_db.locations[country_name]

@app.get("/api/city/{city_name}")
async def get_city_details(city_name: str):
    """Get comprehensive city information"""
    if city_name not in world_db.locations:
        raise HTTPException(status_code=404, detail="City not found")
    
    city_data = world_db.locations[city_name]
    current_time = datetime.datetime.now(pytz.UTC)
    
    # Add real-time data
    city_data["real_time"] = await generate_city_real_time_data(city_name, current_time)
    
    return city_data

@app.get("/api/weather/{location}")
async def get_weather(location: str):
    """Get current weather for any location"""
    # In a real implementation, this would use actual weather APIs
    coordinates = [random.uniform(-90, 90), random.uniform(-180, 180)]
    weather_data = await generate_real_time_weather(coordinates)
    
    return {
        "location": location,
        "weather": weather_data,
        "last_updated": datetime.datetime.now().isoformat()
    }

@app.get("/api/live-data/{location}")
async def get_live_location_data(location: str):
    """Get comprehensive live data for any location"""
    current_time = datetime.datetime.now(pytz.UTC)
    live_data = await generate_city_real_time_data(location, current_time)
    
    return {
        "location": location,
        "data": live_data,
        "timestamp": current_time.isoformat()
    }

@app.get("/api/global-overview")
async def get_global_overview():
    """Get global world overview with statistics"""
    return {
        "global_stats": await generate_global_statistics(),
        "natural_phenomena": await generate_natural_phenomena(),
        "economic_indicators": await generate_global_economic_data(),
        "cultural_events": await generate_global_cultural_events(),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/search/locations")
async def search_locations(query: str):
    """Search for locations by name"""
    matching_locations = []
    query_lower = query.lower()
    
    for location_name in world_db.locations.keys():
        if query_lower in location_name.lower():
            matching_locations.append({
                "name": location_name,
                "coordinates": world_db.locations[location_name].get('coordinates', [0, 0]),
                "population": world_db.locations[location_name].get('population', 0)
            })
    
    return {"results": matching_locations[:20]}  # Limit to top 20 results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
