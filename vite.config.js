import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev server is exposed through an HTTPS proxy in this environment, so we
// bind to all interfaces, accept any host header, and point HMR at the proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: { clientPort: 443, protocol: 'wss' },
  },
})
