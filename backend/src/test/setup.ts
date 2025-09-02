// Minimal test setup without problematic imports
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

beforeAll(() => {
  process.env['NODE_ENV'] = 'test'
  process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-jwt-secret'
  process.env['SESSION_SECRET'] = process.env['SESSION_SECRET'] || 'test-session-secret'
})

beforeEach(() => {
  // Reset any mocks if needed
})

afterEach(() => {
  // Cleanup after each test
})

afterAll(() => {
  // Final cleanup
})
