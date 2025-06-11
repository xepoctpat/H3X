#!/usr/bin/env npx tsx
/**
 * H3X TypeScript Testing Infrastructure Setup
 * Comprehensive test configuration and utilities for TypeScript testing
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestConfig {
  framework: 'vitest' | 'jest';
  coverage: boolean;
  ui: boolean;
  typescript: boolean;
  watch: boolean;
}

class TypeScriptTestingSetup {
  private readonly projectRoot: string;
  private readonly testDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.testDir = path.join(this.projectRoot, 'tests');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔧',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async ensureTestDirectories(): Promise<void> {
    const dirs = [
      'tests/unit',
      'tests/integration',
      'tests/e2e',
      'tests/fixtures',
      'tests/mocks',
      'tests/utils',
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.projectRoot, dir);
      try {
        await fs.promises.mkdir(fullPath, { recursive: true });
        this.log(`Created test directory: ${dir}`, 'success');
      } catch (error: any) {
        if (error.code !== 'EEXIST') {
          this.log(`Failed to create ${dir}: ${error.message}`, 'error');
        }
      }
    }
  }

  async createTestUtilities(): Promise<void> {
    // Test utilities for H3X system
    const testUtilsContent = `
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
      setTimeout(() => reject(new Error(\`Test timeout after \${timeoutMs}ms\`)), timeoutMs)
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

  throw new Error(\`Condition not met within \${timeout}ms\`);
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
`.trim();

    const utilsPath = path.join(this.testDir, 'utils', 'test-utils.ts');
    fs.writeFileSync(utilsPath, testUtilsContent);
    this.log('Created test utilities', 'success');
  }

  async createTestSetupFile(): Promise<void> {
    const setupContent = `
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
    const pass = received && 
                  typeof received === 'object' &&
                  'status' in received &&
                  'timestamp' in received;
    
    if (pass) {
      return {
        message: () => \`expected \${received} not to be a valid H3X response\`,
        pass: true,
      };
    } else {
      return {
        message: () => \`expected \${received} to be a valid H3X response with status and timestamp\`,
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
`.trim();

    const setupPath = path.join(this.testDir, 'setup.ts');
    fs.writeFileSync(setupPath, setupContent);
    this.log('Created test setup file', 'success');
  }

  async createSampleTests(): Promise<void> {
    // Unit test example
    const unitTestContent = `
/**
 * Sample unit test for H3X system
 */

import { describe, it, expect, vi } from 'vitest';
import { createMockH3XSystem } from '../utils/test-utils';

describe('H3X System Unit Tests', () => {
  it('should create a valid H3X system mock', () => {
    const mockSystem = createMockH3XSystem();
    
    expect(mockSystem).toBeDefined();
    expect(mockSystem.log).toBeDefined();
    expect(mockSystem.createCFlup).toBeDefined();
    expect(mockSystem.listCFlups).toBeDefined();
  });

  it('should handle system status requests', async () => {
    const mockSystem = createMockH3XSystem();
    const status = await mockSystem.getStatus();
    
    expect(status).toBeValidH3XResponse();
    expect(status.status).toBe('ok');
  });

  it('should log messages correctly', () => {
    const mockSystem = createMockH3XSystem();
    
    mockSystem.log('Test message');
    
    expect(mockSystem.log).toHaveBeenCalledWith('Test message');
    expect(mockSystem.log).toHaveBeenCalledTimes(1);
  });
});
`.trim();

    const unitTestPath = path.join(this.testDir, 'unit', 'system.test.ts');
    fs.writeFileSync(unitTestPath, unitTestContent);

    // Integration test example
    const integrationTestContent = `
/**
 * Sample integration test for H3X system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupBrowserMocks, waitFor } from '../utils/test-utils';

describe('H3X System Integration Tests', () => {
  beforeEach(() => {
    setupBrowserMocks();
  });

  it('should integrate with localStorage', async () => {
    const testKey = 'h3x-test-data';
    const testValue = JSON.stringify({ test: true });
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    
    expect(retrieved).toBe(testValue);
    expect(JSON.parse(retrieved!)).toEqual({ test: true });
  });

  it('should handle async operations', async () => {
    let completed = false;
    
    setTimeout(() => {
      completed = true;
    }, 100);

    await waitFor(() => completed, { timeout: 1000 });
    
    expect(completed).toBe(true);
  });
});
`.trim();

    const integrationTestPath = path.join(
      this.testDir,
      'integration',
      'system-integration.test.ts',
    );
    fs.writeFileSync(integrationTestPath, integrationTestContent);

    this.log('Created sample test files', 'success');
  }

  async updateVitestConfig(): Promise<void> {
    const vitestConfigPath = path.join(this.projectRoot, 'vitest.config.ts');

    if (!fs.existsSync(vitestConfigPath)) {
      this.log('vitest.config.ts not found, creating...', 'warning');

      const vitestConfig = `
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}',
      'scripts/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '**/*.d.ts',
      '**/*.config.*'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.*',
        'tests/**',
        '**/*.test.*',
        '**/*.spec.*',
        'scripts/build-system.ts',
        'scripts/legacy-cleanup.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html'
    },

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/tests': path.resolve(__dirname, './tests'),
      '@/scripts': path.resolve(__dirname, './scripts'),
    }
  },

  // Environment variables for tests
  define: {
    __DEV__: true,
    __TEST__: true,
    __API_URL__: JSON.stringify('http://localhost:3001'),
    __WS_URL__: JSON.stringify('ws://localhost:3001')
  }
});
`.trim();

      fs.writeFileSync(vitestConfigPath, vitestConfig);
      this.log('Created vitest.config.ts', 'success');
    } else {
      this.log('vitest.config.ts already exists', 'info');
    }
  }

  async installTestDependencies(): Promise<void> {
    this.log('Installing test dependencies...', 'info');

    const dependencies = [
      '@testing-library/dom@latest',
      '@testing-library/jest-dom@latest',
      '@testing-library/user-event@latest',
      '@vitest/coverage-v8@latest',
      '@vitest/ui@latest',
      'jsdom@latest',
      'vitest@latest',
    ];

    try {
      const command = `npm install --save-dev ${dependencies.join(' ')}`;
      await execAsync(command);
      this.log('Test dependencies installed successfully', 'success');
    } catch (error: any) {
      this.log(`Failed to install dependencies: ${error.message}`, 'error');
      throw error;
    }
  }

  async run(): Promise<void> {
    this.log('Setting up TypeScript testing infrastructure...', 'info');

    try {
      await this.ensureTestDirectories();
      await this.createTestUtilities();
      await this.createTestSetupFile();
      await this.createSampleTests();
      await this.updateVitestConfig();

      this.log('TypeScript testing infrastructure setup completed', 'success');
      this.displayUsageInstructions();
    } catch (error: any) {
      this.log(`Setup failed: ${error.message}`, 'error');
      throw error;
    }
  }

  private displayUsageInstructions(): void {
    console.log('\\n🎉 TypeScript Testing Setup Complete!\\n');

    console.log('📋 Available test commands:');
    const commands = [
      { cmd: 'npm run test', desc: 'Run all tests' },
      { cmd: 'npm run test:watch', desc: 'Run tests in watch mode' },
      { cmd: 'npm run test:ui', desc: 'Open Vitest UI' },
      { cmd: 'npm run test:coverage', desc: 'Run tests with coverage' },
      { cmd: 'npm run test:ts', desc: 'Run TypeScript-specific tests' },
    ];

    commands.forEach(({ cmd, desc }) => {
      console.log(`  ${cmd.padEnd(35)} - ${desc}`);
    });

    console.log('\\n📁 Test structure:');
    console.log('  tests/unit/          - Unit tests');
    console.log('  tests/integration/   - Integration tests');
    console.log('  tests/e2e/          - End-to-end tests');
    console.log('  tests/utils/         - Test utilities');
    console.log('  tests/setup.ts       - Global test setup');

    console.log('\\n🚀 Quick start:');
    console.log('  npm run test:watch   # Start development testing');
    console.log('  npm run test:ui      # Open visual test interface');
  }
}

// CLI Interface
async function main(): Promise<void> {
  const setup = new TypeScriptTestingSetup();
  await setup.run();
}

// Check if script is run directly
const isMainModule = process.argv[1] && process.argv[1].includes('setup-typescript-testing');

if (isMainModule) {
  console.log('🚀 Starting H3X TypeScript Testing Infrastructure Setup...');
  main().catch((error) => {
    console.error('❌ Test setup failed:', error);
    process.exit(1);
  });
}

export default TypeScriptTestingSetup;
