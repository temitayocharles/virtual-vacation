import { Router, Request, Response } from 'express'
import axios from 'axios'
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

// Get current weather for coordinates
router.get('/current', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      })
    }

    const cacheKey = `weather:current:${lat}:${lon}`
    const cachedWeather = await cache.get(cacheKey)

    if (cachedWeather) {
      return res.json(JSON.parse(cachedWeather))
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return res.status(500).json({
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
        }
      }
    )

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

    res.json(weatherData)
  } catch (error) {
    logger.error('Error fetching weather data:', error)
    res.status(500).json({
      error: 'Failed to fetch weather data'
    })
  }
})

// Get weather forecast for coordinates
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      })
    }

    const cacheKey = `weather:forecast:${lat}:${lon}`
    const cachedForecast = await cache.get(cacheKey)

    if (cachedForecast) {
      return res.json(JSON.parse(cachedForecast))
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return res.status(500).json({
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
        }
      }
    )

    const forecastData = forecastResponse.data.list.slice(0, 5).map((item: any) => ({
      time: item.dt_txt,
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed
    }))

    // Cache for 30 minutes
    await cache.set(cacheKey, JSON.stringify(forecastData), 1800)

    res.json(forecastData)
  } catch (error) {
    logger.error('Error fetching weather forecast:', error)
    res.status(500).json({
      error: 'Failed to fetch weather forecast'
    })
  }
})

export default router
