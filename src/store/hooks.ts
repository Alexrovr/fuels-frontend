import { createAsyncThunk } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

// Типизированные хуки: компоненты получают RootState и dispatch, понимающий thunk
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// createAsyncThunk с заранее заданными типами: getState() возвращает RootState,
// rejectWithValue принимает текст ошибки для пользователя
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
}>()

// Идёт хотя бы один запрос — на экране анимация, кнопки заблокированы (LoadingOverlay)
export const selectIsBusy = (state: RootState) =>
  state.user.loading ||
  state.fuels.loading ||
  state.fuels.deletingId !== null ||
  state.feed.loading ||
  state.feed.liking ||
  state.draft.loading
