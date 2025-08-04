import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'

// Mock environment variables for testing
beforeAll(async () => {
  process.env['NODE_ENV'] = 'test'
  process.env['JWT_SECRET'] = 'test-jwt-secret-for-testing'
  process.env['SESSION_SECRET'] = 'test-session-secret-for-testing'  
  process.env['DATABASE_URL'] = 'postgresql://testuser:testpass@localhost:5432/virtual_vacation_test'
  process.env['REDIS_URL'] = 'redis://localhost:6379'
  process.env['GOOGLE_MAPS_API_KEY'] = 'test-google-maps-key'
  process.env['OPENWEATHER_API_KEY'] = 'test-openweather-key'
})

// Clean up after all tests
afterAll(async () => {
  // Clean up any persistent connections, databases, etc.
})

// Setup before each test
beforeEach(async () => {
  // Reset mocks, clear cache, etc.
})

// Cleanup after each test
afterEach(async () => {
  // Clean up test data, reset state, etc.
})

// Global test utilities
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
})

export const createMockResponse = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res)
  return res
}

export const createMockNext = () => jest.fn()
