import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SerializersUserShort } from '../api/Api'

// Состояние интерфейса после авторизации.
// По заданию вход и выход выполняются обычным axios (src/api/auth.ts) без thunk:
// страница сама вызывает запрос и вручную передаёт результат этими действиями.
//
// Начальное состояние — гость. После F5 Redux создаётся заново и снова гость,
// хотя JWT остаётся в localStorage (вкладка Application → Local Storage).
export interface UserState {
  isAuthenticated: boolean
  userId: number | null
  login: string
  fullName: string
  loading: boolean // идёт запрос входа или выхода
  error: string | null
}

const initialState: UserState = {
  isAuthenticated: false,
  userId: null,
  login: '',
  fullName: '',
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // отправлен POST /api/users/login или /logout
    authRequestStarted(state) {
      state.loading = true
      state.error = null
    },
    // вход выполнен: интерфейс пользователя (в меню — «Выход», доступно «Добавление»)
    loginSucceeded(state, action: PayloadAction<SerializersUserShort>) {
      state.isAuthenticated = true
      state.userId = action.payload.user_id ?? null
      state.login = action.payload.login ?? ''
      state.fullName = action.payload.full_name ?? ''
      state.loading = false
      state.error = null
    },
    authRequestFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    // выход: снова интерфейс гостя. На это же действие fuelsSlice сбрасывает фильтр.
    loggedOut() {
      return initialState
    },
  },
})

export const { authRequestStarted, loginSucceeded, authRequestFailed, loggedOut } = userSlice.actions
export default userSlice.reducer
