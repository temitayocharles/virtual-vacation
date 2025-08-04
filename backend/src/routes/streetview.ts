import { Router, Request, Response } from 'express'
import axios from 'axios'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

const router = Router()

// Check Street View availability for coordinates
router.get('/check', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      })
    }

    const cacheKey = `streetview:check:${lat}:${lon}`
    const cachedResult = await cache.get(cacheKey)

    if (cachedResult) {
      return res.json(JSON.parse(cachedResult))
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return res.status(500).json({
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
        }
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

    res.json(result)
  } catch (error) {
    logger.error('Error checking Street View availability:', error)
    res.status(500).json({
      error: 'Failed to check Street View availability'
    })
  }
})

// Get Street View metadata
router.get('/metadata', async (req: Request, res: Response) => {
  try {
    const { lat, lon, pano } = req.query

    if ((!lat || !lon) && !pano) {
      return res.status(400).json({
        error: 'Latitude and longitude, or panorama ID is required'
      })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        error: 'Street View service not configured'
      })
    }

    const params: any = {
      key: apiKey
    }

    if (pano) {
      params.pano = pano
    } else {
      params.location = `${lat},${lon}`
    }

    const metadataResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/streetview/metadata',
      { params }
    )

    if (metadataResponse.data.status !== 'OK') {
      return res.status(404).json({
        error: 'Street View not available for this location'
      })
    }

    res.json(metadataResponse.data)
  } catch (error) {
    logger.error('Error fetching Street View metadata:', error)
    res.status(500).json({
      error: 'Failed to fetch Street View metadata'
    })
  }
})

// Generate Street View image URL
router.get('/image-url', async (req: Request, res: Response) => {
  try {
    const { lat, lon, heading = 0, pitch = 0, fov = 90, size = '640x640' } = req.query

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        error: 'Street View service not configured'
      })
    }

    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?location=${lat},${lon}&heading=${heading}&pitch=${pitch}&fov=${fov}&size=${size}&key=${apiKey}`

    res.json({ imageUrl })
  } catch (error) {
    logger.error('Error generating Street View image URL:', error)
    res.status(500).json({
      error: 'Failed to generate Street View image URL'
    })
  }
})

export default router
