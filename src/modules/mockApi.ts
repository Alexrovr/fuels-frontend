import { FUELS_MOCK } from './mock'
import type { FuelDetail, FuelListItem } from './types'

// Ответы «как у веб-сервиса», собранные из mock-коллекции. Используются в thunk,
// когда бэкенд недоступен, и только для гостя: у вошедшего пользователя
// вместо mock показывается ошибка (его действия mock выполнить не может).

const publishedMock = () => FUELS_MOCK.filter((fuel) => fuel.fuel_status === 'опубликован')

const toListItem = (fuel: FuelDetail): FuelListItem => ({
  fuel_id: fuel.fuel_id,
  fuel_name: fuel.fuel_name,
  heat_of_combustion_kj: fuel.heat_of_combustion_kj,
  ignition_temp_c: fuel.ignition_temp_c,
  image_url: fuel.image_url,
  likes_count: fuel.likes_count,
  is_mine: false, // у гостя своих карточек нет
})

// GET /api/fuels?min_heat= — тот же фильтр, что на бэкенде: heat_of_combustion_kj >= min_heat
export const mockFuelsList = (minHeat: number): FuelListItem[] =>
  publishedMock()
    .filter((fuel) => fuel.heat_of_combustion_kj >= minHeat)
    .map(toListItem)

// GET /api/fuels/feed[/:id][?next=true] — следующая по кругу; null = 404
export const mockFeedFuel = (id: number | undefined, next: boolean): FuelDetail | null => {
  const fuels = publishedMock()
  if (id === undefined) return fuels[0] ?? null

  const index = fuels.findIndex((fuel) => fuel.fuel_id === id)
  if (index === -1) return null
  return next ? fuels[(index + 1) % fuels.length] : fuels[index]
}
