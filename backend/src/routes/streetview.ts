import { Router, Request, Response } from 'express'
import axios from 'axios'
import Joi from 'joi'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

const router = Router()

// Input validation schemas
const coordinatesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required()
})

const metadataSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).optional(),
  lon: Joi.number().min(-180).max(180).optional(),
  pano: Joi.string().optional()
}).or('lat', 'pano')

const imageUrlSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
  heading: Joi.number().min(0).max(360).default(0),
  pitch: Joi.number().min(-90).max(90).default(0),
  fov: Joi.number().min(10).max(120).default(90),
  size: Joi.string().pattern(/^\d+x\d+$/).default('640x640')
})

// Check Street View availability for coordinates
router.get('/check', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { error, value } = coordinatesSchema.validate(req.query)
    if (error) {
      logger.warn('Street View check validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided',
        details: error.details[0].message
      })
    }

    const { lat, lon } = value

    const cacheKey = `streetview:check:${lat}:${lon}`
    const cachedResult = await cache.get(cacheKey)

    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult)
      })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      logger.error('Google Maps API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Street View service not configured'
      })
    }

    // Check Street View metadata
    const metadataResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/streetview/metadata',
      {
        params: {
          location: `${lat},${lon}`,
          key: apiKey,
          radius: 50
        },
        timeout: 10000
      }
    )

    const available = metadataResponse.data.status === 'OK'
    const result = {
      available,
      location: available ? metadataResponse.data.location : null,
      date: available ? metadataResponse.data.date : null,
      copyright: available ? metadataResponse.data.copyright : null
    }

    // Cache for 24 hours
    await cache.set(cacheKey, JSON.stringify(result), 86400)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Street View check timeout')
        return res.status(504).json({
          success: false,
          error: 'Street View service timeout'
        })
      }
      if (error.response?.status === 400) {
        logger.warn('Invalid Street View request')
        return res.status(400).json({
          success: false,
          error: 'Invalid location for Street View'
        })
      }
    }

    logger.error('Error checking Street View availability:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check Street View availability'
    })
  }
})

// Get Street View metadata
router.get('/metadata', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { error, value } = metadataSchema.validate(req.query)
    if (error) {
      logger.warn('Street View metadata validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters provided',
        details: error.details[0].message
      })
    }

    const { lat, lon, pano } = value

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      logger.error('Google Maps API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Street View service not configured'
      })
    }

    const params: any = {
      key: apiKey
    }

    if (pano) {
      params.pano = pano
    } else if (lat && lon) {
      params.location = `${lat},${lon}`
    }

    const metadataResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/streetview/metadata',
      {
        params,
        timeout: 10000
      }
    )

    if (metadataResponse.data.status !== 'OK') {
      return res.status(404).json({
        success: false,
        error: 'Street View not available for this location'
      })
    }

    res.json({
      success: true,
      data: metadataResponse.data
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Street View metadata timeout')
        return res.status(504).json({
          success: false,
          error: 'Street View service timeout'
        })
      }
      if (error.response?.status === 400) {
        logger.warn('Invalid Street View metadata request')
        return res.status(400).json({
          success: false,
          error: 'Invalid location for Street View'
        })
      }
    }

    logger.error('Error fetching Street View metadata:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Street View metadata'
    })
  }
})

// Generate Street View image URL
router.get('/image-url', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { error, value } = imageUrlSchema.validate(req.query)
    if (error) {
      logger.warn('Street View image URL validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters provided',
        details: error.details[0].message
      })
    }

    const { lat, lon, heading, pitch, fov, size } = value

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      logger.error('Google Maps API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Street View service not configured'
      })
    }

    // Use URL encoding for security
    const params = new URLSearchParams({
      location: `${lat},${lon}`,
      heading: heading.toString(),
      pitch: pitch.toString(),
      fov: fov.toString(),
      size: size,
      key: apiKey
    })

    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`

    res.json({
      success: true,
      data: { imageUrl }
    })
  } catch (error) {
    logger.error('Error generating Street View image URL:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate Street View image URL'
    })
  }
})

export default router
