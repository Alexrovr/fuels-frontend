import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import fuelsReducer from './fuelsSlice'
import feedReducer from './feedSlice'
import draftReducer from './draftSlice'

// Единое хранилище приложения. configureStore сам подключает middleware
// redux-thunk (асинхронные действия createAsyncThunk), проверки неизменяемости
// состояния в dev и расширение браузера Redux DevTools.
export const store = configureStore({
  reducer: {
    user: userReducer, // авторизация: гость / пользователь (заполняется вручную, без thunk)
    fuels: fuelsReducer, // плитка: фильтр по теплоте сгорания и список карточек
    feed: feedReducer, // лента: текущая карточка и лайк
    draft: draftReducer, // добавление: черновик пользователя
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
