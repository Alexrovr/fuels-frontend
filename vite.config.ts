import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = mode === 'pages' ? '/fuels-frontend/' : '/'
  // TLS завершается в Node.js; API и S3 доступны браузеру через один HTTPS origin.
  // В режиме HTTPS отсутствие сертификатов — ошибка, отката на HTTP нет.
  const https = mode === 'local-https' ? {
    key: readFileSync(env.TLS_KEY || 'certs/localhost-key.pem'),
    cert: readFileSync(env.TLS_CERT || 'certs/localhost.pem'),
  } : undefined
  const proxy = {
    '/api': { target: env.BACKEND_URL || 'http://localhost:3030', changeOrigin: true },
    '/resources': { target: env.BACKEND_URL || 'http://localhost:3030', changeOrigin: true },
    '/minio': {
      target: env.MINIO_URL || 'http://localhost:9000', changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/minio/, ''),
    },
  }
  return {
    base,
    plugins: [react(), VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        id: base, name: 'HEATCALC — справочник топлива', short_name: 'HEATCALC',
        description: 'Виды топлива, теплота сгорания и видео горения',
        lang: 'ru', start_url: `${base}#/grid`, scope: base,
        display: 'standalone', background_color: '#ffffff', theme_color: '#FD2B06',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // API, JWT и пользовательские ответы не кешируются.
        cacheId: mode === 'pages' ? 'heatcalc-pages' : 'heatcalc-local',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/minio(?:\/|$)/, /^\/resources(?:\/|$)/],
        // Видео необязательны для offline: постеры и описания доступны из precache/mock.
      },
    })],
    server: { host: '0.0.0.0', port: 3000, strictPort: true, https, proxy },
    preview: { host: '0.0.0.0', port: 3000, strictPort: true, https, proxy },
  }
})
