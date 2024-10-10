// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  optimizeDeps: {
    // Убедитесь, что Automerge не исключён из оптимизации
    include: ['@automerge/automerge']
  }
});
