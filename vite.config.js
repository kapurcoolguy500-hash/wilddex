import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During dev, the Vite frontend (5173) proxies API calls to the Express
// backend (8787) so the browser only ever talks to one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on the local network so a phone can reach it
    proxy: {
      '/identify': 'http://localhost:8787',
      '/api': 'http://localhost:8787',
    },
  },
})
