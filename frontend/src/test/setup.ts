import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Mock environment variables
beforeAll(() => {
  // Mock environment variables
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-google-maps-key')
  vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-openweather-key')
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-mapbox-token')
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock HTMLCanvasElement.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn()

  // Mock window.scrollTo
  window.scrollTo = vi.fn()

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
  global.cancelAnimationFrame = vi.fn()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
