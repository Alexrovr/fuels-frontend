import { isAxiosError } from 'axios'

// Веб-сервис недоступен: нет ответа вовсе (сеть, таймаут) или 5xx —
// бэкенд выключен, и прокси Vite сам отвечает 502/500.
// Ответы 4xx — настоящий результат веб-сервиса (404 — карточки нет, 401 — нужен вход).
export const isServiceDown = (error: unknown): boolean => {
  if (!isAxiosError(error)) return false
  return !error.response || error.response.status >= 500
}

export const httpStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined

// Текст ошибки для пользователя: бэкенд отвечает {"error": "..."}
export const errorMessage = (error: unknown, fallback = 'Не удалось выполнить запрос'): string => {
  if (isServiceDown(error)) return 'Веб-сервис недоступен — попробуйте позже'
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    if (data?.error) return data.error
  }
  return fallback
}
