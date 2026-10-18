import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api -> the Express backend (same machine).
// This keeps browser-facing requests relative so the preview works.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow the sandbox preview host (and any host) in dev. Safe for a local demo.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
