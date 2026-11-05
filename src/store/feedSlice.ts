import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api'
import { errorMessage, httpStatus, isServiceDown } from '../api/errors'
import { mockFeedFuel } from '../modules/mockApi'
import type { FuelDetail } from '../modules/types'
import { createAppAsyncThunk } from './hooks'
import { loggedOut, loginSucceeded } from './userSlice'

// Лента: одна карточка на весь экран и лайк текущего пользователя.
export interface FeedState {
  fuel: FuelDetail | null // null после загрузки — такой карточки нет (404)
  loaded: boolean
  fromMock: boolean
  loading: boolean
  liking: boolean // идёт запрос лайка
  error: string | null
  requestId: string | null
}

const initialState: FeedState = {
  fuel: null,
  loaded: false,
  fromMock: false,
  loading: false,
  liking: false,
  error: null,
  requestId: null,
}

interface FeedArgs {
  id?: number // нет — первая карточка ленты
  next?: boolean // true — следующая за id по кругу
}

// GET /api/fuels/feed — api.fuels.feedList,
// GET /api/fuels/feed/:fuel_id[?next=true] — api.fuels.feedDetail
export const getFeedFuel = createAppAsyncThunk(
  'feed/getFeedFuel',
  async ({ id, next = false }: FeedArgs, { getState, rejectWithValue }) => {
    try {
      const { data } =
        id === undefined
          ? await api.fuels.feedList()
          : await api.fuels.feedDetail(id, next ? { next: true } : {})
      return { fuel: data as FuelDetail, fromMock: false }
    } catch (error) {
      if (httpStatus(error) === 404) return { fuel: null, fromMock: false }
      if (isServiceDown(error) && !getState().user.isAuthenticated) {
        return { fuel: mockFeedFuel(id, next), fromMock: true }
      }
      return rejectWithValue(errorMessage(error, 'Не удалось загрузить карточку'))
    }
  },
)

// POST /api/fuels/:fuel_id/like {"like": 1 | 0} — api.fuels.likeCreate
export const likeFuel = createAppAsyncThunk(
  'feed/likeFuel',
  async ({ fuelId, like }: { fuelId: number; like: 0 | 1 }, { rejectWithValue }) => {
    try {
      const { data } = await api.fuels.likeCreate(fuelId, { like })
      return data
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось поставить лайк'))
    }
  },
)

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeedFuel.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(getFeedFuel.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.loaded = true
        state.fuel = action.payload.fuel
        state.fromMock = action.payload.fromMock
      })
      .addCase(getFeedFuel.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.loaded = true
        state.fuel = null
        state.error = action.payload ?? 'Не удалось загрузить карточку'
      })
      .addCase(likeFuel.pending, (state) => {
        state.liking = true
        state.error = null
      })
      .addCase(likeFuel.fulfilled, (state, action) => {
        state.liking = false
        if (state.fuel && state.fuel.fuel_id === action.payload.fuel_id) {
          state.fuel.is_liked = action.payload.is_liked ?? false
          state.fuel.likes_count = action.payload.likes_count ?? state.fuel.likes_count
        }
      })
      .addCase(likeFuel.rejected, (state, action) => {
        state.liking = false
        state.error = action.payload ?? 'Не удалось поставить лайк'
      })
      // вход и выход меняют is_liked — карточку нужно загрузить заново
      .addCase(loginSucceeded, () => initialState)
      .addCase(loggedOut, () => initialState)
  },
})

export default feedSlice.reducer
