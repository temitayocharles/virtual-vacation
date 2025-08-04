import { Router, Request, Response } from 'express'
import { getDB } from '../config/database'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

const router = Router()

// Get all cities with optional country filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { country, limit = 50, offset = 0 } = req.query
    const db = getDB()

    let query = `
      SELECT 
        c.id,
        c.name,
        c.country_code,
        co.name as country_name,
        c.latitude,
        c.longitude,
        c.population,
        c.timezone,
        c.elevation,
        c.description,
        c.image_url,
        c.street_view_available,
        c.popularity_score
      FROM cities c
      JOIN countries co ON c.country_code = co.code
    `

    const params: any[] = []
    
    if (country) {
      query += ' WHERE c.country_code = $1'
      params.push(country)
      query += ` ORDER BY c.popularity_score DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)
    } else {
      query += ` ORDER BY c.popularity_score DESC LIMIT $1 OFFSET $2`
      params.push(limit, offset)
    }

    const result = await db.query(query, params)

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      countryCode: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      timezone: row.timezone,
      elevation: row.elevation,
      description: row.description,
      imageUrl: row.image_url,
      streetViewAvailable: row.street_view_available,
      popularityScore: row.popularity_score,
      type: 'city'
    }))

    res.json(cities)
  } catch (error) {
    logger.error('Error fetching cities:', error)
    res.status(500).json({
      error: 'Failed to fetch cities'
    })
  }
})

// Get popular cities
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'cities:popular'
    const cachedCities = await cache.get(cacheKey)

    if (cachedCities) {
      return res.json(JSON.parse(cachedCities))
    }

    const db = getDB()
    const result = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.country_code,
        co.name as country_name,
        c.latitude,
        c.longitude,
        c.population,
        c.description,
        c.image_url,
        c.street_view_available,
        c.popularity_score
      FROM cities c
      JOIN countries co ON c.country_code = co.code
      ORDER BY c.popularity_score DESC
      LIMIT 20
    `)

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      countryCode: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      description: row.description,
      imageUrl: row.image_url,
      streetViewAvailable: row.street_view_available,
      popularityScore: row.popularity_score,
      type: 'city'
    }))

    // Cache for 1 hour
    await cache.set(cacheKey, JSON.stringify(cities), 3600)

    res.json(cities)
  } catch (error) {
    logger.error('Error fetching popular cities:', error)
    res.status(500).json({
      error: 'Failed to fetch popular cities'
    })
  }
})

// Search cities
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = 20 } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        error: 'Search query is required'
      })
    }

    const db = getDB()
    const searchTerm = `%${q.toLowerCase()}%`

    const result = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.country_code,
        co.name as country_name,
        c.latitude,
        c.longitude,
        c.population,
        c.description,
        c.image_url,
        c.street_view_available,
        c.popularity_score
      FROM cities c
      JOIN countries co ON c.country_code = co.code
      WHERE LOWER(c.name) LIKE $1 OR LOWER(co.name) LIKE $1
      ORDER BY c.popularity_score DESC
      LIMIT $2
    `, [searchTerm, limit])

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      countryCode: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      description: row.description,
      imageUrl: row.image_url,
      streetViewAvailable: row.street_view_available,
      popularityScore: row.popularity_score,
      type: 'city'
    }))

    res.json(cities)
  } catch (error) {
    logger.error('Error searching cities:', error)
    res.status(500).json({
      error: 'Failed to search cities'
    })
  }
})

// Get city by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const db = getDB()

    const result = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.country_code,
        co.name as country_name,
        c.latitude,
        c.longitude,
        c.population,
        c.timezone,
        c.elevation,
        c.description,
        c.image_url,
        c.street_view_available,
        c.popularity_score
      FROM cities c
      JOIN countries co ON c.country_code = co.code
      WHERE c.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'City not found'
      })
    }

    const row = result.rows[0]
    const city = {
      id: row.id,
      name: row.name,
      country: row.country_name,
      countryCode: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      timezone: row.timezone,
      elevation: row.elevation,
      description: row.description,
      imageUrl: row.image_url,
      streetViewAvailable: row.street_view_available,
      popularityScore: row.popularity_score,
      type: 'city'
    }

    res.json(city)
  } catch (error) {
    logger.error('Error fetching city:', error)
    res.status(500).json({
      error: 'Failed to fetch city'
    })
  }
})

// Get cities by country
router.get('/country/:countryCode', async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params
    const { limit = 50 } = req.query

    const cacheKey = `cities:country:${countryCode}`
    const cachedCities = await cache.get(cacheKey)

    if (cachedCities) {
      return res.json(JSON.parse(cachedCities))
    }

    const db = getDB()
    const result = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.country_code,
        co.name as country_name,
        c.latitude,
        c.longitude,
        c.population,
        c.description,
        c.image_url,
        c.street_view_available,
        c.popularity_score
      FROM cities c
      JOIN countries co ON c.country_code = co.code
      WHERE c.country_code = $1
      ORDER BY c.popularity_score DESC
      LIMIT $2
    `, [countryCode.toUpperCase(), limit])

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      countryCode: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      description: row.description,
      imageUrl: row.image_url,
      streetViewAvailable: row.street_view_available,
      popularityScore: row.popularity_score,
      type: 'city'
    }))

    // Cache for 30 minutes
    await cache.set(cacheKey, JSON.stringify(cities), 1800)

    res.json(cities)
  } catch (error) {
    logger.error('Error fetching cities by country:', error)
    res.status(500).json({
      error: 'Failed to fetch cities by country'
    })
  }
})

export default router
