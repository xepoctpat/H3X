/**
 * H3X Test Utilities
 * Common testing utilities for H3X TypeScript projects
 */

import { vi } from 'vitest';

export interface MockH3XSystem {
  log: ReturnType<typeof vi.fn>;
  createCFlup: ReturnType<typeof vi.fn>;
  listCFlups: ReturnType<typeof vi.fn>;
  processData: ReturnType<typeof vi.fn>;
  getStatus: ReturnType<typeof vi.fn>;
}

export interface MockLocalStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

/**
 * Create a mock H3X system for testing
 */
export function createMockH3XSystem(): MockH3XSystem {
  return {
    log: vi.fn(),
    createCFlup: vi.fn(),
    listCFlups: vi.fn(),
    processData: vi.fn(),
    getStatus: vi.fn().mockResolvedValue({ status: 'ok', timestamp: new Date().toISOString() }),
  };
}

/**
 * Create a mock localStorage for testing
 */
export function createMockLocalStorage(): MockLocalStorage {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
  };
}

/**
 * Setup global mocks for browser environment
 */
export function setupBrowserMocks(): void {
  const mockH3X = createMockH3XSystem();
  const mockStorage = createMockLocalStorage();

  // Mock H3X system globals
  Object.defineProperty(globalThis, 'h3xModular', {
    value: mockH3X,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'h3xSystem', {
    value: mockH3X,
    writable: true,
    configurable: true,
  });

  // Mock localStorage
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });

  // Mock fetch
  globalThis.fetch = vi.fn();

  // Mock console methods
  globalThis.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };
}

/**
 * Setup Node.js environment mocks
 */
export function setupNodeMocks(): void {
  // Mock process.env
  process.env.NODE_ENV = 'test';
  process.env.H3X_TEST_MODE = 'true';
}

/**
 * Cleanup test environment
 */
export function cleanupTestEnvironment(): void {
  vi.clearAllMocks();
  vi.resetAllMocks();
}

/**
 * Create a test timeout wrapper
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Test timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

export default {
  createMockH3XSystem,
  createMockLocalStorage,
  setupBrowserMocks,
  setupNodeMocks,
  cleanupTestEnvironment,
  withTimeout,
  waitFor,
};