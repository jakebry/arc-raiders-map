import { defineConfig } from 'vite';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

// Dev-time proxy so the browser calls same-origin `/api/...`
// Vite forwards to the real API and sets proper origin headers.
export default defineConfig({
  server: {
    proxy: {
      '/api/arc-raiders/events-schedule': {
        target: 'https://metaforge.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

