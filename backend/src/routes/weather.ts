import { Router, Request, Response } from 'express'
import axios, { AxiosError } from 'axios'
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

// Handle API errors and return appropriate responses
const handleWeatherError = (error: unknown, res: Response, context: string = 'weather'): void => {
  if (!axios.isAxiosError(error)) {
    logger.error(`Error fetching ${context} data:`, error)
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${context} data`
    })
    return
  }

  const axiosErr = error as AxiosError

  if (axiosErr.code === 'ECONNABORTED') {
    logger.error(`${context} API request timeout`)
    res.status(504).json({
      success: false,
      error: `${context} service timeout`
    })
  } else if (axiosErr.response?.status === 401) {
    logger.error('Invalid OpenWeather API key')
    res.status(500).json({
      success: false,
      error: 'Weather service authentication failed'
    })
  } else if (axiosErr.response?.status === 404) {
    logger.warn(`${context} data not found for coordinates`)
    res.status(404).json({
      success: false,
      error: `${context} data not available for this location`
    })
  } else {
    logger.error(`Error fetching ${context} data:`, error)
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${context} data`
    })
  }
}

// Validate external API response using optional chaining
const validateWeatherResponse = (data: any): boolean => {
  return (
    typeof data?.main?.temp === 'number' &&
    Array.isArray(data?.weather) &&
    data.weather.length > 0 &&
    !!data?.weather?.[0]?.description &&
    !!data?.weather?.[0]?.icon &&
    typeof data?.wind?.speed === 'number'
  )
}

// Helper to fetch and build weather data
const fetchWeatherData = async (lat: number, lon: number, apiKey: string): Promise<WeatherData> => {
  const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat, lon, appid: apiKey, units: 'metric' },
    timeout: 10000
  })

  if (!validateWeatherResponse(weatherResponse.data)) {
    throw new Error('Invalid weather API response structure')
  }

  const data = weatherResponse.data

  return {
    temperature: Math.round(data.main.temp),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    icon: data.weather[0].icon,
    feelsLike: Math.round(data.main.feels_like),
    pressure: data.main.pressure,
    visibility: data.visibility / 1000,
    uvIndex: 0
  }
}

// Get current weather for coordinates (root route for backward compatibility)
router.get('/', async (req: Request, res: Response) => {
  try {
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
      return res.json({ success: true, data: JSON.parse(cachedWeather) })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      logger.error('OpenWeather API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Weather service not configured'
      })
    }

    const weatherData = await fetchWeatherData(lat, lon, apiKey)
    await cache.set(cacheKey, JSON.stringify(weatherData), 600)

    res.json({ success: true, data: weatherData })
  } catch (error) {
    handleWeatherError(error, res, 'weather')
  }
})

// Get current weather for coordinates
router.get('/current', async (req: Request, res: Response) => {
  try {
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
      return res.json({ success: true, data: JSON.parse(cachedWeather) })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      logger.error('OpenWeather API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Weather service not configured'
      })
    }

    const weatherData = await fetchWeatherData(lat, lon, apiKey)
    await cache.set(cacheKey, JSON.stringify(weatherData), 600)

    res.json({ success: true, data: weatherData })
  } catch (error) {
    handleWeatherError(error, res, 'weather')
  }
})

// Helper to fetch forecast data
const fetchForecastData = async (lat: number, lon: number, apiKey: string) => {
  const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: { lat, lon, appid: apiKey, units: 'metric' },
    timeout: 10000
  })

  if (!forecastResponse.data?.list || !Array.isArray(forecastResponse.data.list)) {
    throw new Error('Invalid forecast API response structure')
  }

  return forecastResponse.data.list.slice(0, 5).map((item: any) => {
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
}

// Get weather forecast for coordinates
router.get('/forecast', async (req: Request, res: Response) => {
  try {
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
      return res.json({ success: true, data: JSON.parse(cachedForecast) })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      logger.error('OpenWeather API key not configured')
      return res.status(500).json({
        success: false,
        error: 'Weather service not configured'
      })
    }

    const forecastData = await fetchForecastData(lat, lon, apiKey)
    await cache.set(cacheKey, JSON.stringify(forecastData), 1800)

    res.json({ success: true, data: forecastData })
  } catch (error) {
    handleWeatherError(error, res, 'forecast')
  }
})

export default router
