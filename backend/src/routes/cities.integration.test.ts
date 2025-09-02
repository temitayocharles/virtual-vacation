import request from 'supertest'
import { createTestApp } from '../test/test-app'
import {
    setupTestDB,
    teardownTestDB,
    setupTestRedis,
    teardownTestRedis,
    clearTestData,
    getTestPool
} from '../test/integration-setup'
import { getDB } from '../config/database'

// Helper function to ensure countries exist
const ensureCountriesExist = async (countryCodes: string[] = ['US', 'CA', 'MX', 'UK']) => {
    const pool = getDB()
    const client = await pool.connect()

    try {
        for (const code of countryCodes) {
            // First try to insert, if it fails due to conflict, that's fine
            try {
                const countryData: Record<string, [string, string, string]> = {
                    'US': ['United States', 'Washington D.C.', 'North America'],
                    'CA': ['Canada', 'Ottawa', 'North America'],
                    'MX': ['Mexico', 'Mexico City', 'North America'],
                    'UK': ['United Kingdom', 'London', 'Europe']
                }

                const data = countryData[code]
                if (data) {
                    await client.query(`
                        INSERT INTO countries (code, name, capital, region)
                        VALUES ($1, $2, $3, $4)
                    `, [code, ...data])
                }
            } catch (error: any) {
                // Ignore duplicate key errors
                if (!error.message.includes('duplicate key') && !error.message.includes('already exists')) {
                    throw error
                }
            }
        }
    } finally {
        client.release()
    }
}

describe('Cities API Integration Tests', () => {
    let app: any

    beforeAll(async () => {
        await setupTestDB()
        await setupTestRedis()
        app = createTestApp()
    }, 30000)

    afterAll(async () => {
        await teardownTestRedis()
        await teardownTestDB()
    }, 10000)

    describe('GET /api/cities', () => {
        it('should return empty array when no cities exist', async () => {
            // Clear data before test
            await clearTestData()

            const response = await request(app)
                .get('/api/cities')
                .expect(200)

            expect(response.body).toEqual({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0
                }
            })
        })

        it('should return cities with pagination', async () => {
            // Clear data and set up test data
            await clearTestData()

            const pool = getDB()
            const client = await pool.connect()

            try {
                await client.query('BEGIN')

                // Insert countries first
                await client.query(`
          INSERT INTO countries (code, name, capital, region)
          VALUES
            ('US', 'United States', 'Washington D.C.', 'North America'),
            ('CA', 'Canada', 'Ottawa', 'North America'),
            ('MX', 'Mexico', 'Mexico City', 'North America')
        `)

                // Insert test cities
                await client.query(`
          INSERT INTO cities (id, name, country_code, latitude, longitude, population)
          VALUES
            (gen_random_uuid(), 'Test New York', 'US', 40.7128, -74.0060, 8419000),
            (gen_random_uuid(), 'Test Los Angeles', 'US', 34.0522, -118.2437, 3980000),
            (gen_random_uuid(), 'Test Chicago', 'US', 41.8781, -87.6298, 2716000)
        `)

                await client.query('COMMIT')
            } catch (error) {
                await client.query('ROLLBACK')
                throw error
            } finally {
                client.release()
            }

            // Add delay to ensure data is committed
            await new Promise(resolve => setTimeout(resolve, 200))

            const response = await request(app)
                .get('/api/cities?limit=2&page=1')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveLength(2)
            expect(response.body.pagination.total).toBe(3)
            expect(response.body.pagination.totalPages).toBe(2)
        })

        it('should filter cities by country', async () => {
            // Clear data and set up test data
            await clearTestData()

            const pool = getDB()
            const client = await pool.connect()

            try {
                await client.query('BEGIN')

                // Insert countries
                await client.query(`
          INSERT INTO countries (code, name, capital, region)
          VALUES
            ('US', 'United States', 'Washington D.C.', 'North America'),
            ('CA', 'Canada', 'Ottawa', 'North America')
        `)

                // Insert test cities with unique names for this test
                await client.query(`
          INSERT INTO cities (id, name, country_code, latitude, longitude)
          VALUES
            (gen_random_uuid(), 'Filter New York', 'US', 40.7128, -74.0060),
            (gen_random_uuid(), 'Filter Toronto', 'CA', 43.6532, -79.3832),
            (gen_random_uuid(), 'Filter Vancouver', 'CA', 49.2827, -123.1207)
        `)

                await client.query('COMMIT')
            } catch (error) {
                await client.query('ROLLBACK')
                throw error
            } finally {
                client.release()
            }

            // Add delay to ensure data is committed
            await new Promise(resolve => setTimeout(resolve, 200))

            const response = await request(app)
                .get('/api/cities?country=CA')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveLength(2)
            expect(response.body.data.every((city: any) => city.country_code === 'CA')).toBe(true)
        })

        it('should handle invalid query parameters', async () => {
            // Clear data before test
            await clearTestData()

            const response = await request(app)
                .get('/api/cities?limit=invalid&page=notanumber')
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toContain('Invalid query parameters')
        })
    })

    describe('GET /api/cities/search', () => {
        it('should search cities by name', async () => {
            // Clear data and set up test data
            await clearTestData()

            const pool = getDB()
            const client = await pool.connect()

            try {
                await client.query(`
          INSERT INTO countries (code, name, capital, region)
          VALUES ('US', 'United States', 'Washington D.C.', 'North America')
        `)

                await client.query(`
          INSERT INTO cities (id, name, country_code, latitude, longitude)
          VALUES
            (gen_random_uuid(), 'Search New York City', 'US', 40.7128, -74.0060),
            (gen_random_uuid(), 'Search Los Angeles', 'US', 34.0522, -118.2437),
            (gen_random_uuid(), 'Search Chicago', 'US', 41.8781, -87.6298)
        `)
            } finally {
                client.release()
            }

            // Add delay to ensure data is committed
            await new Promise(resolve => setTimeout(resolve, 100))

            const response = await request(app)
                .get('/api/cities/search?q=search+new+york')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveLength(1)
            expect(response.body.data[0].name).toBe('Search New York City')
        })

        it('should return empty array for no matches', async () => {
            // Clear data and set up test data
            await clearTestData()

            // Ensure countries exist first
            await ensureCountriesExist(['US'])

            const pool = getDB()
            const client = await pool.connect()

            try {
                await client.query(`
          INSERT INTO cities (id, name, country_code, latitude, longitude)
          VALUES
            (gen_random_uuid(), 'New York City', 'US', 40.7128, -74.0060),
            (gen_random_uuid(), 'Los Angeles', 'US', 34.0522, -118.2437)
        `)
            } finally {
                client.release()
            }

            const response = await request(app)
                .get('/api/cities/search?q=nonexistent')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveLength(0)
        })

        it('should handle empty search query', async () => {
            // Clear data before test
            await clearTestData()

            const response = await request(app)
                .get('/api/cities/search?q=')
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toContain('Invalid search parameters')
        })
    })

    describe('GET /api/cities/:id', () => {
        it('should return city by ID', async () => {
            // Clear data and set up test data
            await clearTestData()

            const pool = getDB()
            const client = await pool.connect()
            let testCityId: string

            try {
                await client.query(`
          INSERT INTO countries (code, name, capital, region)
          VALUES ('US', 'United States', 'Washington D.C.', 'North America')
        `)

                const result = await client.query(`
          INSERT INTO cities (name, country_code, latitude, longitude, population)
          VALUES ('Test City by ID', 'US', 40.7128, -74.0060, 8419000)
          RETURNING id
        `)
                testCityId = result.rows[0].id
            } finally {
                client.release()
            }

            // Add delay to ensure data is committed
            await new Promise(resolve => setTimeout(resolve, 100))

            const response = await request(app)
                .get(`/api/cities/${testCityId}`)
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.id).toBe(testCityId)
            expect(response.body.data.name).toBe('Test City by ID')
            expect(response.body.data.country_code).toBe('US')
        })

        it('should return 404 for non-existent city', async () => {
            // Clear data before test
            await clearTestData()

            const fakeId = '550e8400-e29b-41d4-a716-446655440000'
            const response = await request(app)
                .get(`/api/cities/${fakeId}`)
                .expect(404)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toBe('City not found')
        })

        it('should handle invalid UUID format', async () => {
            // Clear data before test
            await clearTestData()

            const response = await request(app)
                .get('/api/cities/invalid-uuid')
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toContain('Invalid city ID format')
        })
    })

    describe('GET /api/cities/country/:countryCode', () => {
        it('should return cities by country code', async () => {
            // Clear data and set up test data
            await clearTestData()

            const pool = getDB()
            const client = await pool.connect()

            try {
                await client.query(`
          INSERT INTO countries (code, name, capital, region)
          VALUES
            ('US', 'United States', 'Washington D.C.', 'North America'),
            ('CA', 'Canada', 'Ottawa', 'North America')
        `)

                await client.query(`
          INSERT INTO cities (id, name, country_code, latitude, longitude)
          VALUES
            (gen_random_uuid(), 'Country New York', 'US', 40.7128, -74.0060),
            (gen_random_uuid(), 'Country Los Angeles', 'US', 34.0522, -118.2437),
            (gen_random_uuid(), 'Country Toronto', 'CA', 43.6532, -79.3832)
        `)
            } finally {
                client.release()
            }

            // Add delay to ensure data is committed
            await new Promise(resolve => setTimeout(resolve, 100))

            const response = await request(app)
                .get('/api/cities/country/US')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveLength(2)
            expect(response.body.data.every((city: any) => city.country_code === 'US')).toBe(true)
        })

        it('should return empty array for country with no cities', async () => {
            // Clear data and set up test data
            await clearTestData()

            // Ensure countries exist first (including UK which we'll query for)
            await ensureCountriesExist(['US', 'UK'])

            const pool = getDB()
            const client = await pool.connect()

            try {
                await client.query(`
          INSERT INTO cities (id, name, country_code, latitude, longitude)
          VALUES (gen_random_uuid(), 'New York', 'US', 40.7128, -74.0060)
        `)
            } finally {
                client.release()
            }

            const response = await request(app)
                .get('/api/cities/country/UK')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveLength(0)
        })

        it('should handle invalid country code format', async () => {
            // Clear data before test
            await clearTestData()

            const response = await request(app)
                .get('/api/cities/country/INVALID')
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toContain('Invalid country code format')
        })
    })
})
