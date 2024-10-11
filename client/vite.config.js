// client/vite.config.js
import { defineConfig } from 'vite';
import { config } from 'dotenv';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  optimizeDeps: {
    // Убедитесь, что Automerge не исключён из оптимизации
    include: ['@automerge/automerge']
  },
  define: {
    'process.env': process.env
  },
  build: {
    target: 'esnext'
  }
});
