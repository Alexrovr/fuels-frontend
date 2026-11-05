import './AppLayout.css'
import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './components/TopBar/TopBar'
import { TabBar } from './components/TabBar/TabBar'
import { LoadingOverlay } from './components/LoadingOverlay/LoadingOverlay'
import { selectIsBusy, useAppSelector } from './store/hooks'

// Макет под вертикальный экран телефона: на компьютере — колонка 420px по центру.
// Страница (Outlet) прокручивается внутри, панели сверху и снизу остаются на месте.
// Пока выполняется любой запрос (thunk или вход/выход), поверх всего — анимация,
// которая перехватывает нажатия: кнопки страницы и меню недоступны.
export const AppLayout: FC = () => {
  const busy = useAppSelector(selectIsBusy)

  return (
    <div className="appShell">
      <TopBar />
      <main className="appContent">
        <Outlet />
      </main>
      <TabBar />
      <LoadingOverlay show={busy} />
    </div>
  )
}
