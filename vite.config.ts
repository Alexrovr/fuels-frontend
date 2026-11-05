import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Веб-сервис (Go, ЛР3–ЛР4) работает на :3030, хранилище S3 (Minio) — на :9000.
// Браузер обращается только к dev-серверу :3000, а тот проксирует запросы дальше —
// для браузера это один origin, поэтому ограничение CORS не возникает.
const BACKEND = 'http://localhost:3030'
const MINIO = 'http://localhost:9000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // маршрут 1 — JSON API: /api/fuels, /api/users/login ...
      '/api': { target: BACKEND, changeOrigin: true },
      // медиа по умолчанию, которые бэкенд отдаёт со своего адреса
      '/resources': { target: BACKEND, changeOrigin: true },
      // маршрут 2 — S3: /minio/heat-fuel-media/metan.jpg → http://localhost:9000/heat-fuel-media/metan.jpg
      '/minio': {
        target: MINIO,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ''),
      },
    },
  },
})
