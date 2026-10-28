import { FUELS_MOCK } from './mock'

// Карточка плитки — ответ GET /api/fuels (serializers.FuelListItem на бэкенде)
export interface FuelListItem {
  fuel_id: number
  fuel_name: string
  heat_of_combustion_kj: number
  ignition_temp_c: number
  image_url: string
  likes_count: number
  is_mine: boolean
}

// Карточка ленты — ответ GET /api/fuels/feed[/:fuel_id] (serializers.FuelDetail)
export interface FuelDetail {
  fuel_id: number
  fuel_name: string
  combustion_note: string
  fuel_status: string
  heat_of_combustion_kj: number
  ignition_temp_c: number
  image_url: string
  video_url: string
  created_at: string
  formed_at: string | null
  creator_login: string
  likes_count: number
  is_liked: boolean
}

// Результат загрузки: данные и признак, что они взяты из mock-коллекции,
// а не получены от веб-сервиса.
export interface Loaded<T> {
  data: T
  fromMock: boolean
}

const API_PREFIX = '/api/fuels'
const REQUEST_TIMEOUT_MS = 3000

// Веб-сервис ответил, но запрос неуспешный (например, 404 — карточки нет).
// Такой ответ — настоящий результат, mock вместо него не подставляется.
class ApiError extends Error {
  status: number

  constructor(status: number) {
    super(`HTTP ${status}`)
    this.status = status
  }
}

// GET-запрос к веб-сервису. Сетевая ошибка, таймаут или 5xx (бэкенд не запущен,
// прокси Vite отвечает 500) означают «веб-сервис недоступен» — тогда вызывающий
// берёт данные из mock.
const getJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  if (!response.ok) {
    throw new ApiError(response.status)
  }
  return response.json()
}

const isServiceDown = (error: unknown) => !(error instanceof ApiError) || error.status >= 500

const publishedMock = () => FUELS_MOCK.filter((fuel) => fuel.fuel_status === 'опубликован')

const toListItem = (fuel: FuelDetail): FuelListItem => ({
  fuel_id: fuel.fuel_id,
  fuel_name: fuel.fuel_name,
  heat_of_combustion_kj: fuel.heat_of_combustion_kj,
  ignition_temp_c: fuel.ignition_temp_c,
  image_url: fuel.image_url,
  likes_count: fuel.likes_count,
  is_mine: false,
})

// Плитка: опубликованные виды топлива с теплотой сгорания не менее minHeat.
// Фильтр по mock повторяет условие бэкенда: heat_of_combustion_kj >= min_heat.
export const getFuels = async (minHeat: number): Promise<Loaded<FuelListItem[]>> => {
  const query = minHeat > 0 ? `?min_heat=${minHeat}` : ''
  try {
    return { data: await getJSON<FuelListItem[]>(`${API_PREFIX}${query}`), fromMock: false }
  } catch (error) {
    if (!isServiceDown(error)) throw error
    const data = publishedMock()
      .filter((fuel) => fuel.heat_of_combustion_kj >= minHeat)
      .map(toListItem)
    return { data, fromMock: true }
  }
}

// Лента: без id — первая карточка, с id — эта карточка,
// с next=true — следующая за ней по кругу (как GET /api/fuels/feed/:id?next=true).
// data = null, если такой карточки нет (404).
export const getFeedFuel = async (
  id?: number | string,
  next = false,
): Promise<Loaded<FuelDetail | null>> => {
  let url = `${API_PREFIX}/feed`
  if (id !== undefined) url += `/${id}`
  if (next) url += '?next=true'

  try {
    return { data: await getJSON<FuelDetail>(url), fromMock: false }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { data: null, fromMock: false }
    }
    if (!isServiceDown(error)) throw error
    return { data: findInMock(id, next), fromMock: true }
  }
}

const findInMock = (id: number | string | undefined, next: boolean): FuelDetail | null => {
  const fuels = publishedMock()
  if (id === undefined) return fuels[0] ?? null

  const index = fuels.findIndex((fuel) => String(fuel.fuel_id) === String(id))
  if (index === -1) return null
  return next ? fuels[(index + 1) % fuels.length] : fuels[index]
}
