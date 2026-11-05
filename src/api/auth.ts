import axios from 'axios'
import type { SerializersLoginResponse, SerializersMessageResponse } from './Api'

// Авторизация и деавторизация — по заданию только axios, без кодогенерации и thunk:
// страница сама вызывает эти функции и вручную передаёт результат в Redux (userSlice).
// Адрес относительный — запрос идёт через прокси Vite, как и остальные.

// Ключ, под которым JWT лежит в localStorage (видно во вкладке Application → Local Storage)
export const TOKEN_STORAGE_KEY = 'heat_fuels_jwt'

const authClient = axios.create({ baseURL: '/api/users', timeout: 5000 })

// POST /api/users/login → { access_token, token_type, expires_in, user }
export const loginRequest = async (login: string, password: string) => {
  const response = await authClient.post<SerializersLoginResponse>('/login', { login, password })
  return response.data
}

// POST /api/users/logout — бэкенд кладёт jti токена в чёрный список Redis
export const logoutRequest = async (token: string) => {
  const response = await authClient.post<SerializersMessageResponse>('/logout', null, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const saveToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage недоступен (приватный режим) — вход работает и без него до F5
  }
}

export const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // нечего удалять
  }
}
