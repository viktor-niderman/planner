// client/vite.config.js
import { defineConfig } from 'vite'
import { config } from 'dotenv'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import { VitePWA } from 'vite-plugin-pwa'

config()

export default defineConfig({
  plugins: [
    react(), wasm(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Notes',
        short_name: 'Notes',
        description: 'My own notes',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {},
    })],
  optimizeDeps: {
    include: ['@automerge/automerge'],
  },
  define: {
    'process.env': process.env,
  },
  build: {
    target: 'esnext',
  },
})
