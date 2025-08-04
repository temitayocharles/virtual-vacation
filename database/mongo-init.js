// MongoDB initialization script for Virtual Vacation
// This script creates the initial database structure and sample data

// Switch to virtual_vacation database
db = db.getSiblingDB('virtual_vacation');

// Create collections with validation
db.createCollection("destinations", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["id", "name", "country", "location"],
         properties: {
            id: { bsonType: "string", description: "Unique destination identifier" },
            name: { bsonType: "string", description: "Destination name" },
            country: { bsonType: "string", description: "Country name" },
            location: {
               bsonType: "object",
               required: ["latitude", "longitude"],
               properties: {
                  latitude: { bsonType: "double", minimum: -90, maximum: 90 },
                  longitude: { bsonType: "double", minimum: -180, maximum: 180 }
               }
            }
         }
      }
   }
});

db.createCollection("user_preferences", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["user_id"],
         properties: {
            user_id: { bsonType: "string" }
         }
      }
   }
});

db.createCollection("user_visits");
db.createCollection("user_feedback");
db.createCollection("media");

// Create indexes for better performance
db.destinations.createIndex({ "location": "2dsphere" });
db.destinations.createIndex({ "id": 1 }, { unique: true });
db.destinations.createIndex({ "country": 1 });
db.destinations.createIndex({ "activity_types": 1 });
db.destinations.createIndex({ "popularity_score": -1 });

db.user_preferences.createIndex({ "user_id": 1 }, { unique: true });
db.user_visits.createIndex({ "user_id": 1 });
db.user_visits.createIndex({ "destination_id": 1 });
db.user_visits.createIndex({ "created_at": -1 });

db.user_feedback.createIndex({ "user_id": 1 });
db.user_feedback.createIndex({ "destination_id": 1 });
db.user_feedback.createIndex({ "created_at": -1 });

db.media.createIndex({ "location": "2dsphere" });
db.media.createIndex({ "id": 1 }, { unique: true });
db.media.createIndex({ "content_type": 1 });

// Insert sample destinations
db.destinations.insertMany([
  {
    id: "paris_france",
    name: "Paris",
    country: "France",
    location: { latitude: 48.8566, longitude: 2.3522 },
    climate: "temperate",
    activity_types: ["culture", "history", "art", "food"],
    interests: ["museums", "architecture", "romance", "shopping"],
    budget_level: "high",
    description: "The City of Light, famous for its art, fashion, gastronomy, and iconic landmarks like the Eiffel Tower and Louvre Museum.",
    popularity_score: 95.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  },
  {
    id: "tokyo_japan",
    name: "Tokyo",
    country: "Japan",
    location: { latitude: 35.6762, longitude: 139.6503 },
    climate: "temperate",
    activity_types: ["culture", "technology", "food", "shopping"],
    interests: ["temples", "modern_architecture", "anime", "cuisine"],
    budget_level: "high",
    description: "A bustling metropolis blending ultra-modern skyscrapers with traditional temples and gardens.",
    popularity_score: 92.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  },
  {
    id: "new_york_usa",
    name: "New York City",
    country: "United States",
    location: { latitude: 40.7128, longitude: -74.0060 },
    climate: "temperate",
    activity_types: ["culture", "entertainment", "shopping", "food"],
    interests: ["broadway", "museums", "skyline", "diversity"],
    budget_level: "high",
    description: "The Big Apple - a global hub of culture, fashion, art, and finance with iconic landmarks.",
    popularity_score: 90.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  },
  {
    id: "london_uk",
    name: "London",
    country: "United Kingdom",
    location: { latitude: 51.5074, longitude: -0.1278 },
    climate: "temperate",
    activity_types: ["culture", "history", "royalty", "theater"],
    interests: ["museums", "palaces", "gardens", "pubs"],
    budget_level: "high",
    description: "Historic capital with royal palaces, world-class museums, and iconic red buses and phone booths.",
    popularity_score: 88.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  },
  {
    id: "bali_indonesia",
    name: "Bali",
    country: "Indonesia",
    location: { latitude: -8.3405, longitude: 115.0920 },
    climate: "tropical",
    activity_types: ["relaxation", "nature", "spirituality", "adventure"],
    interests: ["beaches", "temples", "rice_terraces", "wellness"],
    budget_level: "medium",
    description: "Tropical paradise known for its stunning beaches, ancient temples, and vibrant culture.",
    popularity_score: 85.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: false,
      wheelchair_accessible: false
    },
    created_at: new Date()
  },
  {
    id: "rome_italy",
    name: "Rome",
    country: "Italy",
    location: { latitude: 41.9028, longitude: 12.4964 },
    climate: "mediterranean",
    activity_types: ["history", "culture", "food", "art"],
    interests: ["ancient_ruins", "vatican", "cuisine", "fountains"],
    budget_level: "medium",
    description: "The Eternal City, home to ancient Roman ruins, Vatican City, and incredible Italian cuisine.",
    popularity_score: 87.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  },
  {
    id: "sydney_australia",
    name: "Sydney",
    country: "Australia",
    location: { latitude: -33.8688, longitude: 151.2093 },
    climate: "temperate",
    activity_types: ["beaches", "culture", "adventure", "nature"],
    interests: ["opera_house", "harbor_bridge", "beaches", "wildlife"],
    budget_level: "high",
    description: "Harbor city famous for its Opera House, Harbour Bridge, and beautiful beaches.",
    popularity_score: 83.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  },
  {
    id: "machu_picchu_peru",
    name: "Machu Picchu",
    country: "Peru",
    location: { latitude: -13.1631, longitude: -72.5450 },
    climate: "mountain",
    activity_types: ["history", "adventure", "nature", "hiking"],
    interests: ["ancient_civilization", "mountains", "archaeology", "trekking"],
    budget_level: "medium",
    description: "Ancient Incan citadel set high in the Andes Mountains, one of the New Seven Wonders of the World.",
    popularity_score: 91.0,
    features: {
      street_view_available: false,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: false
    },
    created_at: new Date()
  },
  {
    id: "santorini_greece",
    name: "Santorini",
    country: "Greece",
    location: { latitude: 36.3932, longitude: 25.4615 },
    climate: "mediterranean",
    activity_types: ["relaxation", "romance", "beaches", "culture"],
    interests: ["sunsets", "whitewashed_buildings", "wine", "volcanic_beaches"],
    budget_level: "high",
    description: "Stunning Greek island known for its dramatic cliffs, whitewashed buildings, and spectacular sunsets.",
    popularity_score: 89.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: false,
      wheelchair_accessible: false
    },
    created_at: new Date()
  },
  {
    id: "iceland_reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    location: { latitude: 64.1466, longitude: -21.9426 },
    climate: "cold",
    activity_types: ["nature", "adventure", "relaxation", "culture"],
    interests: ["northern_lights", "geysers", "glaciers", "hot_springs"],
    budget_level: "high",
    description: "Gateway to Iceland's natural wonders including geysers, glaciers, and the Northern Lights.",
    popularity_score: 82.0,
    features: {
      street_view_available: true,
      has_360_content: true,
      has_audio_guide: true,
      wheelchair_accessible: true
    },
    created_at: new Date()
  }
]);

// Insert sample media content
db.media.insertMany([
  {
    id: "paris_360_tour",
    title: "360° Tour of Eiffel Tower",
    description: "Immersive 360-degree experience at the iconic Eiffel Tower",
    location: { latitude: 48.8584, longitude: 2.2945 },
    content_type: "360_video",
    file_path: "/app/storage/360_content/paris_eiffel_360.mp4",
    file_size: 524288000,
    duration: 300.0,
    resolution: "4K",
    format: "mp4",
    created_at: new Date().toISOString(),
    tags: ["paris", "eiffel_tower", "landmark", "360"]
  },
  {
    id: "tokyo_shibuya_panorama",
    title: "Shibuya Crossing Panorama",
    description: "Panoramic view of the famous Shibuya crossing",
    location: { latitude: 35.6598, longitude: 139.7006 },
    content_type: "panoramic_image",
    file_path: "/app/storage/panoramic_images/tokyo_shibuya.jpg",
    file_size: 15728640,
    resolution: "8K",
    format: "jpg",
    created_at: new Date().toISOString(),
    tags: ["tokyo", "shibuya", "crossing", "urban"]
  },
  {
    id: "paris_cafe_ambience",
    title: "Parisian Café Ambience",
    description: "Authentic sounds of a traditional Parisian café",
    location: { latitude: 48.8566, longitude: 2.3522 },
    content_type: "audio",
    file_path: "/app/storage/audio/paris_cafe.mp3",
    file_size: 8388608,
    duration: 600.0,
    format: "mp3",
    created_at: new Date().toISOString(),
    tags: ["paris", "cafe", "ambience", "authentic"]
  }
]);

print("✅ Virtual Vacation database initialized successfully!");
print("📊 Collections created: destinations, user_preferences, user_visits, user_feedback, media");
print("🏗️ Indexes created for optimal performance");
print("🌍 Sample destinations and media content inserted");
print("🚀 Database ready for Virtual Vacation application!");
