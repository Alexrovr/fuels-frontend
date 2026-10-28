import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Веб-сервис (Go, ЛР3–ЛР4) работает на :3030. Запросы к нему идут через
// прокси dev-сервера, поэтому для браузера это один origin и CORS не нужен.
const BACKEND = 'http://localhost:3030'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // JSON API: /api/fuels, /api/fuels/feed/...
      '/api': { target: BACKEND, changeOrigin: true },
      // медиа по умолчанию, которые бэкенд отдаёт относительными путями
      '/resources': { target: BACKEND, changeOrigin: true },
    },
  },
})
