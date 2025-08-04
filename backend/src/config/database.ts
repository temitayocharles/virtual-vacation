import { Pool } from 'pg'
import { logger } from '../utils/logger'

let pool: Pool

export const connectDB = async (): Promise<void> => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Test the connection
    const client = await pool.connect()
    logger.info('✅ Database connected successfully')
    client.release()

    // Create tables if they don't exist
    await createTables()
  } catch (error) {
    logger.error('❌ Database connection failed:', error)
    throw error
  }
}

export const getDB = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB first.')
  }
  return pool
}

const createTables = async (): Promise<void> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Countries table
    await client.query(`
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
      )
    `)

    // Cities table
    await client.query(`
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
      )
    `)

    // User favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        city_id UUID REFERENCES cities(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // User visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_visits (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        city_id UUID REFERENCES cities(id),
        visit_duration INTEGER, -- in seconds
        transport_mode VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Radio stations table
    await client.query(`
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
      )
    `)

    // Ambient sounds table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ambient_sounds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL, -- city, nature, transport, etc.
        file_url VARCHAR(500) NOT NULL,
        duration INTEGER, -- in seconds
        volume_level DECIMAL(3, 2) DEFAULT 0.5,
        loop_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);
      CREATE INDEX IF NOT EXISTS idx_cities_coordinates ON cities(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_cities_popularity ON cities(popularity_score DESC);
      CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_visits_user ON user_visits(user_id);
      CREATE INDEX IF NOT EXISTS idx_radio_stations_country ON radio_stations(country_code);
    `)

    await client.query('COMMIT')
    logger.info('✅ Database tables created successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('❌ Failed to create tables:', error)
    throw error
  } finally {
    client.release()
  }
}

export const closeDB = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    logger.info('Database connection closed')
  }
}
