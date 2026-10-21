import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api -> the Express backend (same machine).
// Production builds use VITE_API_URL from src/api/client.js instead.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow the sandbox preview host (and any host) in dev. Safe for a local demo.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
