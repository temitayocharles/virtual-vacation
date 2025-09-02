-- Test Database Initialization Script
-- This script creates the necessary tables and indexes for testing

-- Create the virtual_vacation_test database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    capital VARCHAR(255),
    region VARCHAR(100),
    population BIGINT,
    area DECIMAL,
    flag_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) REFERENCES countries(code),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    population BIGINT,
    timezone VARCHAR(100),
    elevation INTEGER,
    description TEXT,
    image_url VARCHAR(500),
    street_view_available BOOLEAN DEFAULT false,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    city_id UUID REFERENCES cities(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User visits table
CREATE TABLE IF NOT EXISTS user_visits (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    city_id UUID REFERENCES cities(id),
    visit_duration INTEGER, -- in seconds
    transport_mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Radio stations table
CREATE TABLE IF NOT EXISTS radio_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) REFERENCES countries(code),
    city_id UUID REFERENCES cities(id),
    stream_url VARCHAR(500) NOT NULL,
    genre VARCHAR(100),
    language VARCHAR(50),
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambient sounds table
CREATE TABLE IF NOT EXISTS ambient_sounds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- city, nature, transport, etc.
    file_url VARCHAR(500) NOT NULL,
    duration INTEGER, -- in seconds
    volume_level DECIMAL(3, 2) DEFAULT 0.5,
    loop_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);
CREATE INDEX IF NOT EXISTS idx_cities_coordinates ON cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_cities_popularity ON cities(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_user ON user_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_radio_stations_country ON radio_stations(country_code);

-- Insert some test data
INSERT INTO countries (code, name, capital, region) VALUES
('US', 'United States', 'Washington D.C.', 'North America'),
('CA', 'Canada', 'Ottawa', 'North America'),
('GB', 'United Kingdom', 'London', 'Europe'),
('FR', 'France', 'Paris', 'Europe'),
('JP', 'Japan', 'Tokyo', 'Asia')
ON CONFLICT (code) DO NOTHING;

-- Insert some test cities
INSERT INTO cities (name, country_code, latitude, longitude, population, description) VALUES
('New York', 'US', 40.7128, -74.0060, 8419000, 'The Big Apple'),
('Los Angeles', 'US', 34.0522, -118.2437, 3980000, 'City of Angels'),
('Toronto', 'CA', 43.6532, -79.3832, 2930000, 'Canada''s largest city'),
('London', 'GB', 51.5074, -0.1278, 8982000, 'Capital of England'),
('Paris', 'FR', 48.8566, 2.3522, 2161000, 'City of Light'),
('Tokyo', 'JP', 35.6762, 139.6503, 13960000, 'Capital of Japan')
ON CONFLICT DO NOTHING;

-- Insert some test radio stations
INSERT INTO radio_stations (name, country_code, stream_url, genre, language) VALUES
('BBC Radio 1', 'GB', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', 'Pop', 'English'),
('France Inter', 'FR', 'https://direct.franceinter.fr/live/franceinter-midfi.mp3', 'Talk', 'French'),
('NPR News', 'US', 'https://npr-ice.streamguys1.com/live.mp3', 'News', 'English')
ON CONFLICT DO NOTHING;

-- Insert some test ambient sounds
INSERT INTO ambient_sounds (name, category, file_url, duration) VALUES
('City Traffic', 'city', 'https://example.com/sounds/city-traffic.mp3', 120),
('Ocean Waves', 'nature', 'https://example.com/sounds/ocean-waves.mp3', 180),
('Forest Birds', 'nature', 'https://example.com/sounds/forest-birds.mp3', 150),
('Café Ambience', 'city', 'https://example.com/sounds/cafe-ambience.mp3', 200)
ON CONFLICT DO NOTHING;
