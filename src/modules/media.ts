import type { SyntheticEvent } from 'react'

// Медиа по умолчанию лежат в public/ самого фронтенда и отдаются dev-сервером
// по корневому пути — бэкенд для них не нужен.
export const DEFAULT_IMAGE = '/DefaultImage.svg'
export const DEFAULT_VIDEO = '/DefaultVideo.mp4'

// Второй маршрут прокси (vite.config.ts): /minio/* → http://localhost:9000/* — S3 (Minio).
export const MINIO_PROXY_PREFIX = '/minio'
const MINIO_ORIGIN = 'http://localhost:9000'
const BACKEND_ORIGIN = 'http://localhost:3030'

// Бэкенд хранит полные url объектов Minio (http://localhost:9000/heat-fuel-media/metan.jpg)
// и отдаёт свои медиа по умолчанию с адресом сервера (http://localhost:3030/resources/...).
// Браузер получает их через прокси dev-сервера, с того же origin, что и страница:
//   http://localhost:9000/heat-fuel-media/metan.jpg → /minio/heat-fuel-media/metan.jpg
//   http://localhost:3030/resources/media/...       → /resources/media/...
export const toProxyUrl = (url: string): string => {
  if (url.startsWith(MINIO_ORIGIN)) return MINIO_PROXY_PREFIX + url.slice(MINIO_ORIGIN.length)
  if (url.startsWith(BACKEND_ORIGIN)) return url.slice(BACKEND_ORIGIN.length)
  return url // mock (/mock/...) и уже относительные адреса
}

// Пустое поле услуги -> медиа по умолчанию
export const imageOrDefault = (url: string) => (url ? toProxyUrl(url) : DEFAULT_IMAGE)
export const videoOrDefault = (url: string) => (url ? toProxyUrl(url) : DEFAULT_VIDEO)

// Поле заполнено, но файл не загрузился (Minio выключен, объект удалён) —
// тоже показываем медиа по умолчанию. Проверка на текущий src не даёт
// зациклиться, если сломан и сам файл по умолчанию.
export const fallbackToDefaultImage = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget
  if (!image.src.endsWith(DEFAULT_IMAGE)) image.src = DEFAULT_IMAGE
}

export const fallbackToDefaultVideo = (event: SyntheticEvent<HTMLVideoElement>) => {
  const video = event.currentTarget
  if (!video.src.endsWith(DEFAULT_VIDEO)) {
    video.poster = DEFAULT_IMAGE
    video.src = DEFAULT_VIDEO
  }
}
