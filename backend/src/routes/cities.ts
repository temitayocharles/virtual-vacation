import { Router, Request, Response } from 'express'
import Joi from 'joi'
import { getDB } from '../config/database'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

const router = Router()

// Input validation schemas
const citiesQuerySchema = Joi.object({
  country: Joi.string().length(2).uppercase().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).optional(),
  offset: Joi.number().integer().min(0).optional()
})

const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  limit: Joi.number().integer().min(1).max(50).default(20)
})

const cityIdSchema = Joi.object({
  id: Joi.string().uuid().required()
})

const countryCodeSchema = Joi.object({
  countryCode: Joi.string().length(2).uppercase().required(),
  limit: Joi.number().integer().min(1).max(100).default(50)
})

// Get all cities with optional country filter
router.get('/', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { error, value } = citiesQuerySchema.validate(req.query)
    if (error) {
      logger.warn('Cities query validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.details[0].message
      })
    }

    const { country, limit, page: queryPage, offset: queryOffset } = value

    // Convert page to offset if page is provided, otherwise use offset or default to 0
    const offset = queryPage ? (queryPage - 1) * limit : (queryOffset || 0)
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
    let countQuery = 'SELECT COUNT(*) as total FROM cities c'
    const countParams: any[] = []

    if (country) {
      query += ' WHERE c.country_code = $1'
      countQuery += ' WHERE c.country_code = $1'
      params.push(country)
      countParams.push(country)
      query += ` ORDER BY c.popularity_score DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)
    } else {
      query += ` ORDER BY c.popularity_score DESC LIMIT $1 OFFSET $2`
      params.push(limit, offset)
    }

    const [result, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ])

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      country_code: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      timezone: row.timezone,
      elevation: row.elevation,
      description: row.description,
      image_url: row.image_url,
      street_view_available: row.street_view_available,
      popularity_score: row.popularity_score,
      type: 'city'
    }))

    const total = Number.parseInt(countResult.rows[0].total, 10)
    const totalPages = Math.ceil(total / limit)
    const page = Math.floor(offset / limit) + 1

    res.json({
      success: true,
      data: cities,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    logger.error('Error fetching cities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities'
    })
  }
})

// Get popular cities
router.get('/popular', async (req: Request, res: Response) => {
  try {
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
      ORDER BY c.popularity_score DESC
      LIMIT 10
    `)

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      country_code: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      timezone: row.timezone,
      elevation: row.elevation,
      description: row.description,
      image_url: row.image_url,
      street_view_available: row.street_view_available,
      popularity_score: row.popularity_score,
      type: 'city'
    }))

    res.json({
      success: true,
      data: cities
    })
  } catch (error) {
    logger.error('Error fetching popular cities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular cities'
    })
  }
})

// Search cities
router.get('/search', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { error, value } = searchQuerySchema.validate(req.query)
    if (error) {
      logger.warn('City search validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.details[0].message
      })
    }

    const { q, limit } = value

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
      country_code: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      description: row.description,
      image_url: row.image_url,
      street_view_available: row.street_view_available,
      popularity_score: row.popularity_score,
      type: 'city'
    }))

    res.json({
      success: true,
      data: cities
    })
  } catch (error) {
    logger.error('Error searching cities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to search cities'
    })
  }
})

// Get city by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Validate route parameters
    const { error, value } = cityIdSchema.validate(req.params)
    if (error) {
      logger.warn('City ID validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid city ID format',
        details: error.details[0].message
      })
    }

    const { id } = value
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
        success: false,
        error: 'City not found'
      })
    }

    const row = result.rows[0]
    const city = {
      id: row.id,
      name: row.name,
      country: row.country_name,
      country_code: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      timezone: row.timezone,
      elevation: row.elevation,
      description: row.description,
      image_url: row.image_url,
      street_view_available: row.street_view_available,
      popularity_score: row.popularity_score,
      type: 'city'
    }

    res.json({
      success: true,
      data: city
    })
  } catch (error) {
    logger.error('Error fetching city:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city'
    })
  }
})

// Get cities by country
router.get('/country/:countryCode', async (req: Request, res: Response) => {
  try {
    // Validate route parameters
    const { error, value } = countryCodeSchema.validate(req.params)
    if (error) {
      logger.warn('Country code validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid country code format',
        details: error.details[0].message
      })
    }

    const { countryCode } = value
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
      WHERE c.country_code = $1
      ORDER BY c.popularity_score DESC
    `, [countryCode])

    const cities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      country: row.country_name,
      country_code: row.country_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      population: row.population,
      timezone: row.timezone,
      elevation: row.elevation,
      description: row.description,
      image_url: row.image_url,
      street_view_available: row.street_view_available,
      popularity_score: row.popularity_score,
      type: 'city'
    }))

    res.json({
      success: true,
      data: cities
    })
  } catch (error) {
    logger.error('Error fetching cities by country:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities by country'
    })
  }
})

export default router
