// Minimal test setup without problematic imports
beforeAll(() => {
  process.env['NODE_ENV'] = 'test'  
  process.env['JWT_SECRET'] = 'test-jwt-secret'
  process.env['SESSION_SECRET'] = 'test-session-secret'
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
