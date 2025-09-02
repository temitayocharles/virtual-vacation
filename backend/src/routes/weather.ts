import { Router, Request, Response } from 'express'
import axios from 'axios'
import Joi from 'joi'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

const router = Router()

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
  feelsLike: number
  pressure: number
  visibility: number
  uvIndex: number
}

// Input validation schema
const weatherQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required'
  }),
  lon: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required'
  })
})

// Validate external API response
const validateWeatherResponse = (data: any): boolean => {
  return (
    data &&
    data.main &&
    typeof data.main.temp === 'number' &&
    data.weather &&
    Array.isArray(data.weather) &&
    data.weather.length > 0 &&
    data.weather[0].description &&
    data.weather[0].icon &&
    data.wind &&
    typeof data.wind.speed === 'number'
  )
}

// Get current weather for coordinates (root route for backward compatibility)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Validate input parameters
    const { error, value } = weatherQuerySchema.validate(req.query)
    if (error) {
      logger.warn('Weather API validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided',
        details: error.details[0].message
      })
    }

    const { lat, lon } = value

    const cacheKey = `weather:current:${lat}:${lon}`
    const cachedWeather = await cache.get(cacheKey)

    if (cachedWeather) {
      return res.json({
        success: true,
        data: JSON.parse(cachedWeather)
      })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      logger.error('OpenWeather API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Weather service not configured'
      })
    }

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'metric'
        },
        timeout: 10000 // 10 second timeout
      }
    )

    // Validate external API response
    if (!validateWeatherResponse(weatherResponse.data)) {
      logger.error('Invalid weather API response structure')
      return res.status(502).json({
        success: false,
        error: 'Weather service returned invalid data'
      })
    }

    const weatherData: WeatherData = {
      temperature: Math.round(weatherResponse.data.main.temp),
      description: weatherResponse.data.weather[0].description,
      humidity: weatherResponse.data.main.humidity,
      windSpeed: weatherResponse.data.wind.speed,
      icon: weatherResponse.data.weather[0].icon,
      feelsLike: Math.round(weatherResponse.data.main.feels_like),
      pressure: weatherResponse.data.main.pressure,
      visibility: weatherResponse.data.visibility / 1000, // Convert to km
      uvIndex: 0 // Would need separate UV API call
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, JSON.stringify(weatherData), 600)

    res.json({
      success: true,
      data: weatherData
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Weather API request timeout')
        return res.status(504).json({
          success: false,
          error: 'Weather service timeout'
        })
      }
      if (error.response?.status === 401) {
        logger.error('Invalid OpenWeather API key')
        return res.status(500).json({
          success: false,
          error: 'Weather service authentication failed'
        })
      }
      if (error.response?.status === 404) {
        logger.warn('Weather data not found for coordinates')
        return res.status(404).json({
          success: false,
          error: 'Weather data not available for this location'
        })
      }
    }

    logger.error('Error fetching weather data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    })
  }
})

// Get current weather for coordinates
router.get('/current', async (req: Request, res: Response) => {
  try {
    // Validate input parameters
    const { error, value } = weatherQuerySchema.validate(req.query)
    if (error) {
      logger.warn('Weather API validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided',
        details: error.details[0].message
      })
    }

    const { lat, lon } = value

    const cacheKey = `weather:current:${lat}:${lon}`
    const cachedWeather = await cache.get(cacheKey)

    if (cachedWeather) {
      return res.json({
        success: true,
        data: JSON.parse(cachedWeather)
      })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      logger.error('OpenWeather API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Weather service not configured'
      })
    }

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'metric'
        },
        timeout: 10000 // 10 second timeout
      }
    )

    // Validate external API response
    if (!validateWeatherResponse(weatherResponse.data)) {
      logger.error('Invalid weather API response structure')
      return res.status(502).json({
        success: false,
        error: 'Weather service returned invalid data'
      })
    }

    const weatherData: WeatherData = {
      temperature: Math.round(weatherResponse.data.main.temp),
      description: weatherResponse.data.weather[0].description,
      humidity: weatherResponse.data.main.humidity,
      windSpeed: weatherResponse.data.wind.speed,
      icon: weatherResponse.data.weather[0].icon,
      feelsLike: Math.round(weatherResponse.data.main.feels_like),
      pressure: weatherResponse.data.main.pressure,
      visibility: weatherResponse.data.visibility / 1000, // Convert to km
      uvIndex: 0 // Would need separate UV API call
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, JSON.stringify(weatherData), 600)

    res.json({
      success: true,
      data: weatherData
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Weather API request timeout')
        return res.status(504).json({
          success: false,
          error: 'Weather service timeout'
        })
      }
      if (error.response?.status === 401) {
        logger.error('Invalid OpenWeather API key')
        return res.status(500).json({
          success: false,
          error: 'Weather service authentication failed'
        })
      }
      if (error.response?.status === 404) {
        logger.warn('Weather data not found for coordinates')
        return res.status(404).json({
          success: false,
          error: 'Weather data not available for this location'
        })
      }
    }

    logger.error('Error fetching weather data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    })
  }
})

// Get weather forecast for coordinates
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    // Validate input parameters
    const { error, value } = weatherQuerySchema.validate(req.query)
    if (error) {
      logger.warn('Weather forecast API validation failed:', error.details[0].message)
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided',
        details: error.details[0].message
      })
    }

    const { lat, lon } = value

    const cacheKey = `weather:forecast:${lat}:${lon}`
    const cachedForecast = await cache.get(cacheKey)

    if (cachedForecast) {
      return res.json({
        success: true,
        data: JSON.parse(cachedForecast)
      })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      logger.error('OpenWeather API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Weather service not configured'
      })
    }

    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'metric'
        },
        timeout: 10000 // 10 second timeout
      }
    )

    // Validate forecast response
    if (!forecastResponse.data?.list || !Array.isArray(forecastResponse.data.list)) {
      logger.error('Invalid forecast API response structure')
      return res.status(502).json({
        success: false,
        error: 'Weather forecast service returned invalid data'
      })
    }

    const forecastData = forecastResponse.data.list.slice(0, 5).map((item: any) => {
      if (!item?.main?.temp || !item?.weather?.[0]?.description) {
        throw new Error('Invalid forecast item structure')
      }

      return {
        time: item.dt_txt,
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      }
    })

    // Cache for 30 minutes
    await cache.set(cacheKey, JSON.stringify(forecastData), 1800)

    res.json({
      success: true,
      data: forecastData
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Weather forecast API request timeout')
        return res.status(504).json({
          success: false,
          error: 'Weather forecast service timeout'
        })
      }
      if (error.response?.status === 401) {
        logger.error('Invalid OpenWeather API key')
        return res.status(500).json({
          success: false,
          error: 'Weather service authentication failed'
        })
      }
      if (error.response?.status === 404) {
        logger.warn('Weather forecast data not found for coordinates')
        return res.status(404).json({
          success: false,
          error: 'Weather forecast data not available for this location'
        })
      }
    }

    logger.error('Error fetching weather forecast:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather forecast'
    })
  }
})

export default router
