import { describe, it, expect } from 'vitest'

// Simple utility functions for testing
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats USD currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00')
    })
  })

  describe('slugify', () => {
    it('converts text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Virtual Vacation!')).toBe('virtual-vacation')
    })

    it('handles special characters', () => {
      expect(slugify('Test@123')).toBe('test123')
      expect(slugify('Multi   Spaces')).toBe('multi-spaces')
    })
  })
})
