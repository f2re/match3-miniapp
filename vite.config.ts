import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    https: true // Required for Telegram Mini App testing
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          game: ['phaser'],
          telegram: ['@telegram-apps/sdk']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@game': '/src/game',
      '@components': '/src/components',
      '@services': '/src/services',
      '@types': '/src/types'
    }
  }
})