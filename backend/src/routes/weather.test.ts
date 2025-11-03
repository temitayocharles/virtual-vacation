import request from 'supertest'
import express from 'express'
import weatherRouter from '../routes/weather'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

// Mock external dependencies
jest.mock('../config/redis', () => ({
    cache: {
        get: jest.fn(),
        set: jest.fn()
    }
}))

jest.mock('../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}))

// Mock axios
jest.mock('axios')
import axios, { AxiosError } from 'axios'

const mockedAxios = axios as jest.Mocked<typeof axios>

    // Mock isAxiosError to return true for AxiosError instances
    ; (axios as any).isAxiosError = (error: any) => {
        return error instanceof AxiosError || error.isAxiosError === true
    }

describe('Weather API Routes', () => {
    let app: express.Application

    beforeEach(() => {
        app = express()
        app.use(express.json())
        app.use('/api/weather', weatherRouter)
        jest.clearAllMocks()
    })

    describe('GET /api/weather/current', () => {
        const validWeatherResponse = {
            data: {
                main: {
                    temp: 25.5,
                    humidity: 65,
                    feels_like: 27.2,
                    pressure: 1013
                },
                weather: [{
                    description: 'clear sky',
                    icon: '01d'
                }],
                wind: {
                    speed: 3.5
                },
                visibility: 10000
            }
        }

        it('should return weather data for valid coordinates', async () => {
            mockedAxios.get.mockResolvedValueOnce(validWeatherResponse)
                ; (cache.get as jest.Mock).mockResolvedValue(null)
                ; (cache.set as jest.Mock).mockResolvedValue('OK')

            process.env.OPENWEATHER_API_KEY = 'test-api-key'

            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('temperature', 26)
            expect(response.body.data).toHaveProperty('description', 'clear sky')
        })

        it('should return 400 for invalid coordinates', async () => {
            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 91, lon: -74.0060 })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error', 'Invalid coordinates provided')
        })

        it('should return 500 when API key is not configured', async () => {
            const originalApiKey = process.env.OPENWEATHER_API_KEY
            delete process.env.OPENWEATHER_API_KEY
                ; (cache.get as jest.Mock).mockResolvedValue(null)

            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(500)
            expect(response.body).toHaveProperty('error', 'Weather service not configured')

            process.env.OPENWEATHER_API_KEY = originalApiKey
        })

        it('should handle API timeout', async () => {
            const mockError = new AxiosError('Timeout', 'ECONNABORTED')
            mockError.code = 'ECONNABORTED'
            mockedAxios.get.mockRejectedValueOnce(mockError)
                ; (cache.get as jest.Mock).mockResolvedValue(null)

            process.env.OPENWEATHER_API_KEY = 'test-api-key'

            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(504)
            expect(response.body).toHaveProperty('error', 'Weather service timeout')
        })

        it('should handle API authentication failure', async () => {
            const mockError = new AxiosError('Unauthorized', '401')
            mockError.response = { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config: {} as any }
            mockedAxios.get.mockRejectedValueOnce(mockError)
                ; (cache.get as jest.Mock).mockResolvedValue(null)

            process.env.OPENWEATHER_API_KEY = 'invalid-key'

            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(500)
            expect(response.body).toHaveProperty('error', 'Weather service authentication failed')
        })

        it('should handle API data not found', async () => {
            const mockError = new AxiosError('Not Found', '404')
            mockError.response = { status: 404, data: {}, statusText: 'Not Found', headers: {}, config: {} as any }
            mockedAxios.get.mockRejectedValueOnce(mockError)
                ; (cache.get as jest.Mock).mockResolvedValue(null)

            process.env.OPENWEATHER_API_KEY = 'test-api-key'

            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty('error', 'Weather data not available for this location')
        })

        it('should handle invalid API response structure', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {} // Invalid structure
            })
                ; (cache.get as jest.Mock).mockResolvedValue(null)

            process.env.OPENWEATHER_API_KEY = 'test-api-key'

            const response = await request(app)
                .get('/api/weather/current')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(502)
            expect(response.body).toHaveProperty('error', 'Weather service returned invalid data')
        })
    })

    describe('GET /api/weather/forecast', () => {
        const validForecastResponse = {
            data: {
                list: [
                    {
                        dt_txt: '2024-01-01 12:00:00',
                        main: { temp: 25.5, humidity: 65 },
                        weather: [{ description: 'clear sky', icon: '01d' }],
                        wind: { speed: 3.5 }
                    }
                ]
            }
        }

        it('should return forecast data for valid coordinates', async () => {
            mockedAxios.get.mockResolvedValueOnce(validForecastResponse)
                ; (cache.get as jest.Mock).mockResolvedValue(null)
                ; (cache.set as jest.Mock).mockResolvedValue('OK')

            process.env.OPENWEATHER_API_KEY = 'test-api-key'

            const response = await request(app)
                .get('/api/weather/forecast')
                .query({ lat: 40.7128, lon: -74.0060 })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(Array.isArray(response.body.data)).toBe(true)
        })

        it('should validate coordinates for forecast endpoint', async () => {
            const response = await request(app)
                .get('/api/weather/forecast')
                .query({ lat: 91, lon: -74.0060 })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error', 'Invalid coordinates provided')
        })
    })
})
