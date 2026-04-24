import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      'all',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      'thalia-platinous-lucile.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ngrok-api': {
        target: 'http://localhost:4040',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ngrok-api/, '/api'),
      }
    }
  }
})
