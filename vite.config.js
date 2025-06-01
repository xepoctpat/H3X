import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.modular.html'),
        experimental: resolve(__dirname, 'src/hexperiments.html')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./scss/_h3x-variables.scss"; @import "./scss/_h3x-mixins.scss";`
      }
    }
  },
  server: {
    port: 8080,
    open: '/index.modular.html'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ts': resolve(__dirname, 'src/ts'),
      '@scss': resolve(__dirname, 'src/scss')
    }
  }
})