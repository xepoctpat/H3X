import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2022',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        modular: path.resolve(__dirname, 'index.modular.html'),
        hexperiments: path.resolve(__dirname, 'hexperiments.html')
      },
      output: {
        manualChunks: {
          'vendor': ['three'],
          'h3x-core': [
            './src/ts/h3x-modular.ts',
            './src/ts/types/h3x.d.ts'
          ],
          'visualization': [
            './src/ts/visualization/three-renderer.ts',
            './src/ts/visualization/canvas-renderer.ts'
          ]
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },

  // Path resolution
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
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '.css']
  },

  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss"; @import "./src/styles/mixins.scss";`
      }
    },
    devSourcemap: true
  },

  // Plugin configuration
  plugins: [],

  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __API_URL__: JSON.stringify(process.env.API_URL || 'http://localhost:3001'),
    __WS_URL__: JSON.stringify(process.env.WS_URL || 'ws://localhost:3001')
  },

  // Optimization
  optimizeDeps: {
    include: ['three'],
    exclude: []
  }
});
