import { describe, test, expect } from '@jest/globals'

// Simple utility functions for backend
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const formatResponse = (data: any, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().toLowerCase()
}

describe('Backend Utilities', () => {
  test('validateEmail should work correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
  })

  test('generateId should create unique strings', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).toBeDefined()
    expect(id2).toBeDefined()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
    expect(id1.length).toBeGreaterThan(0)
  })

  test('formatResponse should create proper API response', () => {
    const testData = { id: 1, name: 'Test' }
    const response = formatResponse(testData, 'Test message')
    
    expect(response.success).toBe(true)
    expect(response.message).toBe('Test message')
    expect(response.data).toEqual(testData)
    expect(response.timestamp).toBeDefined()
    expect(typeof response.timestamp).toBe('string')
  })

  test('formatResponse should have default message', () => {
    const response = formatResponse({ test: true })
    expect(response.message).toBe('Success')
    expect(response.success).toBe(true)
  })

  test('sanitizeInput should clean user input', () => {
    expect(sanitizeInput('  Hello World  ')).toBe('hello world')
    expect(sanitizeInput('TEST')).toBe('test')
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput('   ')).toBe('')
  })
})

describe('Environment Configuration', () => {
  test('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.JWT_SECRET).toBeDefined()
    expect(process.env.SESSION_SECRET).toBeDefined()
  })

  test('should have database configuration', () => {
    expect(process.env.DATABASE_URL).toBeDefined()
    expect(process.env.REDIS_URL).toBeDefined()
  })
})
