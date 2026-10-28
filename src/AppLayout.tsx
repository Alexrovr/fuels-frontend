import './AppLayout.css'
import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './components/TopBar/TopBar'
import { TabBar } from './components/TabBar/TabBar'

// Макет под вертикальный экран телефона: на компьютере — колонка 420px по центру.
// Страница (Outlet) прокручивается внутри, панели сверху и снизу остаются на месте.
export const AppLayout: FC = () => (
  <div className="appShell">
    <TopBar />
    <main className="appContent">
      <Outlet />
    </main>
    <TabBar />
  </div>
)
