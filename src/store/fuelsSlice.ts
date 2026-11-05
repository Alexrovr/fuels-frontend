import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../api'
import { errorMessage, isServiceDown } from '../api/errors'
import { mockFuelsList } from '../modules/mockApi'
import type { FuelListItem } from '../modules/types'
import { createAppAsyncThunk } from './hooks'
import { loggedOut, loginSucceeded } from './userSlice'

// Плитка: фильтр по нижней границе теплоты сгорания и карточки под него.
export interface FuelsState {
  minHeat: number // применённый фильтр, кДж/м³ (0 — без фильтра); уходит в запрос ?min_heat=
  list: FuelListItem[]
  fromMock: boolean // веб-сервис недоступен — показаны mock-данные (только у гостя)
  loading: boolean
  deletingId: number | null // карточка, для которой выполняется удаление
  error: string | null
  requestId: string | null // последний запрос списка: ответ более старого запроса отбрасывается
}

const initialState: FuelsState = {
  minHeat: 0,
  list: [],
  fromMock: false,
  loading: false,
  deletingId: null,
  error: null,
  requestId: null,
}

// GET /api/fuels?min_heat= — сгенерированный метод api.fuels.fuelsList.
// Фильтр берётся из этого же слайса. Бэкенд недоступен: гостю — mock, пользователю — ошибка.
export const getFuelsList = createAppAsyncThunk(
  'fuels/getFuelsList',
  async (_, { getState, rejectWithValue }) => {
    const { fuels, user } = getState()
    try {
      const { data } = await api.fuels.fuelsList(fuels.minHeat > 0 ? { min_heat: fuels.minHeat } : {})
      return { list: data as FuelListItem[], fromMock: false }
    } catch (error) {
      if (isServiceDown(error) && !user.isAuthenticated) {
        return { list: mockFuelsList(fuels.minHeat), fromMock: true }
      }
      return rejectWithValue(errorMessage(error, 'Не удалось загрузить виды топлива'))
    }
  },
)

// DELETE /api/fuels/:fuel_id — api.fuels.fuelsDelete; удалить можно только свою карточку (is_mine)
export const deleteFuel = createAppAsyncThunk(
  'fuels/deleteFuel',
  async (fuelId: number, { rejectWithValue }) => {
    try {
      await api.fuels.fuelsDelete(fuelId)
      return fuelId
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось удалить вид топлива'))
    }
  },
)

const fuelsSlice = createSlice({
  name: 'fuels',
  initialState,
  reducers: {
    // кнопка «Найти»: новое значение фильтра; GridPage увидит его и загрузит карточки
    setMinHeat(state, action: PayloadAction<number>) {
      state.minHeat = action.payload
    },
    resetFilter(state) {
      state.minHeat = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFuelsList.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(getFuelsList.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.list = action.payload.list
        state.fromMock = action.payload.fromMock
      })
      .addCase(getFuelsList.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.list = []
        state.fromMock = false
        state.error = action.payload ?? 'Не удалось загрузить виды топлива'
      })
      .addCase(deleteFuel.pending, (state, action) => {
        state.deletingId = action.meta.arg
        state.error = null
      })
      .addCase(deleteFuel.fulfilled, (state, action) => {
        state.deletingId = null
        state.list = state.list.filter((fuel) => fuel.fuel_id !== action.payload)
      })
      .addCase(deleteFuel.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload ?? 'Не удалось удалить вид топлива'
      })
      // при входе список перезагружается — появятся отметки is_mine
      .addCase(loginSucceeded, (state) => {
        state.list = []
      })
      // при выходе сбрасывается фильтр пользователя
      .addCase(loggedOut, () => initialState)
  },
})

export const { setMinHeat, resetFilter } = fuelsSlice.actions
export default fuelsSlice.reducer
