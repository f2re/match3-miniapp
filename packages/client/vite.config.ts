import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Match-3 Mini App',
        short_name: 'Match3',
        description: 'A fun Match-3 game for Telegram',
        theme_color: '#121212',
        background_color: '#ffffff',
        display: 'standalone',
        icon: 'src/assets/icon.png'
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    https: false // Change to true if you need HTTPS for Telegram Mini App testing
  },
  preview: {
    port: 4173
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@game': '/src/game',
      '@hooks': '/src/hooks',
      '@services': '/src/services',
      '@types': '/src/types',
      '@assets': '/src/assets'
    }
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
  }
})