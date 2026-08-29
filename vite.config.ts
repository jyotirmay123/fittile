import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { manifest } from './src/pwa/manifest.ts'

// Set VITE_BASE_PATH=/fittile/ when publishing to a GitHub Pages project site.
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'og.png', 'offline.html'],
    manifest,
    workbox: {
      navigateFallback: `${base}index.html`,
      globPatterns: ['**/*.{js,css,html,png,woff2}'],
      runtimeCaching: [{
        urlPattern: /^https:\/\/world\.openfoodfacts\.org\//,
        handler: 'CacheFirst',
        options: { cacheName: 'food-lookups', expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 } },
      }],
    },
  })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    include: ['src/**/*.test.{ts,tsx}', 'supabase/**/*.test.ts'],
  },
})
