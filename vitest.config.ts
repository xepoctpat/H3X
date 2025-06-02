import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
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
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.*',
        'src/tests/**',
        'src/**/*.test.*',
        'src/**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
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

  // Path resolution (same as Vite)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/ts/types'),
      '@/components': path.resolve(__dirname, './src/ts/components'),
      '@/utils': path.resolve(__dirname, './src/ts/utils'),
      '@/services': path.resolve(__dirname, './src/ts/services'),
      '@/visualization': path.resolve(__dirname, './src/ts/visualization'),
      '@/backend': path.resolve(__dirname, './src/backend'),
      '@/frontend': path.resolve(__dirname, './src/frontend'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/tests': path.resolve(__dirname, './src/tests')
    }
  },

  // Environment variables for tests
  define: {
    __DEV__: true,
    __API_URL__: JSON.stringify('http://localhost:3001'),
    __WS_URL__: JSON.stringify('ws://localhost:3001')
  }
});
