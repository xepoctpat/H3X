import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock H3X system globals
Object.defineProperty(window, 'h3xModular', {
  value: {
    log: vi.fn(),
    createCFlup: vi.fn(),
    listCFlups: vi.fn(),
    switchTab: vi.fn(),
    toggleMode: vi.fn()
  },
  writable: true
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
})

// Mock fetch
global.fetch = vi.fn()

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}