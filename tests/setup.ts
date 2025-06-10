/**
 * Global test setup for H3X TypeScript tests
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { setupBrowserMocks, setupNodeMocks } from './utils/test-utils';

// Setup environment based on test type
if (typeof window !== 'undefined') {
  // Browser environment tests
  setupBrowserMocks();
} else {
  // Node.js environment tests
  setupNodeMocks();
}

// Global test configuration
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
  },
}));

// Extend expect with custom matchers
expect.extend({
  toBeValidH3XResponse(received) {
    const pass =
      received && typeof received === 'object' && 'status' in received && 'timestamp' in received;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid H3X response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid H3X response with status and timestamp`,
        pass: false,
      };
    }
  },
});

// Global test hooks
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
