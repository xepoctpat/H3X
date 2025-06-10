import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}',
      'scripts/**/*.{test,spec}.{js,ts}',
    ],
    exclude: ['node_modules', 'dist', '**/*.d.ts', '**/*.config.*'],

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
        'scripts/legacy-cleanup.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html',
    },

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/tests': path.resolve(__dirname, './tests'),
      '@/scripts': path.resolve(__dirname, './scripts'),
    },
  },

  // Environment variables for tests
  define: {
    __DEV__: true,
    __TEST__: true,
    __API_URL__: JSON.stringify('http://localhost:3001'),
    __WS_URL__: JSON.stringify('ws://localhost:3001'),
  },
});
