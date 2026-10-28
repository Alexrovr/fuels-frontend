import type { SyntheticEvent } from 'react'

// Медиа по умолчанию лежат в public/ самого фронтенда и отдаются dev-сервером
// по корневому пути — бэкенд для них не нужен.
export const DEFAULT_IMAGE = '/DefaultImage.svg'
export const DEFAULT_VIDEO = '/DefaultVideo.mp4'

// Пустое поле услуги -> медиа по умолчанию
export const imageOrDefault = (url: string) => url || DEFAULT_IMAGE
export const videoOrDefault = (url: string) => url || DEFAULT_VIDEO

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
