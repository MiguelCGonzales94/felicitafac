import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',  // IPv4 específico
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
            console.log('🔍 Target:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Request:', req.method, req.url, '→ 127.0.0.1:8000');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
