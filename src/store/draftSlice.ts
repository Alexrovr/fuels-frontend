import { createSlice, isPending, isRejected } from '@reduxjs/toolkit'
import { api } from '../api'
import type { SerializersPublishFuelRequest } from '../api/Api'
import { errorMessage, httpStatus } from '../api/errors'
import type { FuelDetail } from '../modules/types'
import { createAppAsyncThunk } from './hooks'
import { loggedOut } from './userSlice'

// Добавление вида топлива в два шага, как на SSR-странице /fuel_draft:
// 1) «Далее» — черновик с названием, изображением и видео;
// 2) «Опубликовать» — описание и два поля по теме, черновик → опубликован.
export interface DraftState {
  draft: FuelDetail | null // черновик текущего пользователя
  loaded: boolean // черновик уже запрашивали (null после загрузки — черновика нет)
  loading: boolean
  error: string | null
}

const initialState: DraftState = {
  draft: null,
  loaded: false,
  loading: false,
  error: null,
}

// GET /api/fuels/draft — api.fuels.draftList; 404 — черновика нет
export const getFuelDraft = createAppAsyncThunk(
  'draft/getFuelDraft',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.fuels.draftList()
      return data as FuelDetail
    } catch (error) {
      if (httpStatus(error) === 404) return null
      return rejectWithValue(errorMessage(error, 'Не удалось загрузить черновик'))
    }
  },
)

export interface CreateFuelArgs {
  fuel_name: string
  image: File
  video: File
}

// POST /api/fuels (multipart/form-data) — api.fuels.fuelsCreate; файлы уходят в Minio
export const createFuelDraft = createAppAsyncThunk(
  'draft/createFuelDraft',
  async (args: CreateFuelArgs, { rejectWithValue }) => {
    try {
      // видео до 30 МБ — общий таймаут 3 с для загрузки файлов мал
      const { data } = await api.fuels.fuelsCreate(args, { timeout: 120000 })
      return data as FuelDetail
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось создать черновик'))
    }
  },
)

// PUT /api/fuels/:fuel_id/publish — api.fuels.publishUpdate
export const publishFuelDraft = createAppAsyncThunk(
  'draft/publishFuelDraft',
  async (
    { fuelId, body }: { fuelId: number; body: SerializersPublishFuelRequest },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.fuels.publishUpdate(fuelId, body)
      return data as FuelDetail
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось опубликовать вид топлива'))
    }
  },
)

// DELETE /api/fuels/:fuel_id — api.fuels.fuelsDelete; удаление черновика
export const deleteFuelDraft = createAppAsyncThunk(
  'draft/deleteFuelDraft',
  async (fuelId: number, { rejectWithValue }) => {
    try {
      await api.fuels.fuelsDelete(fuelId)
      return fuelId
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Не удалось удалить черновик'))
    }
  },
)

const draftThunks = [getFuelDraft, createFuelDraft, publishFuelDraft, deleteFuelDraft] as const

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFuelDraft.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.draft = action.payload
      })
      .addCase(createFuelDraft.fulfilled, (state, action) => {
        state.loading = false
        state.draft = action.payload
      })
      // после публикации и удаления черновика у пользователя его больше нет
      .addCase(publishFuelDraft.fulfilled, (state) => {
        state.loading = false
        state.draft = null
      })
      .addCase(deleteFuelDraft.fulfilled, (state) => {
        state.loading = false
        state.draft = null
      })
      .addCase(loggedOut, () => initialState)
      // общие pending / rejected для всех четырёх thunk черновика
      .addMatcher(isPending(...draftThunks), (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(isRejected(...draftThunks), (state, action) => {
        state.loading = false
        state.loaded = true
        state.error = (action.payload as string | undefined) ?? 'Не удалось выполнить запрос'
      })
  },
})

export default draftSlice.reducer
