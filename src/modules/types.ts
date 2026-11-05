import type { SerializersFuelDetail, SerializersFuelListItem } from '../api/Api'

// Типы карточек берутся из кода, сгенерированного по Swagger (src/api/Api.ts).
// В Swagger все поля необязательные, но бэкенд всегда отдаёт их целиком,
// поэтому в приложении используются «полные» варианты.

// Карточка плитки — ответ GET /api/fuels
export type FuelListItem = Required<SerializersFuelListItem>

// Карточка ленты и черновик — ответ GET /api/fuels/feed[/:fuel_id], GET /api/fuels/draft.
// formed_at у черновика null, статус в mock записан строкой.
export type FuelDetail = Required<Omit<SerializersFuelDetail, 'formed_at' | 'fuel_status'>> & {
  formed_at: string | null
  fuel_status: string
}
