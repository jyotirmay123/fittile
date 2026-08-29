import type { ManifestOptions } from 'vite-plugin-pwa'

// Matches the Vite base so the app stays installable from a project subpath.
const base = process.env.VITE_BASE_PATH ?? '/'

export const manifest: Partial<ManifestOptions> = {
  name: 'Fitile — Train, Recover, Fuel',
  short_name: 'Fitile',
  description: 'Adaptive workouts, muscle recovery, nutrition and activity tracking with user-owned data.',
  start_url: base,
  scope: base,
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#f2f3ed',
  theme_color: '#2d6b4c',
  categories: ['health', 'fitness', 'lifestyle'],
  icons: [
    { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}
