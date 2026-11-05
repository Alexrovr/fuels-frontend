import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from './Routes'
import { FeedPage } from './pages/FeedPage'
import { GridPage } from './pages/GridPage'
import { DraftPage } from './pages/DraftPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Общая оболочка «телефона»: верхняя панель, страница, нижняя таб-панель */}
        <Route element={<AppLayout />}>
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path={ROUTES.DRAFT} element={<DraftPage />} />
          <Route path={ROUTES.GRID} element={<GridPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          {/* корень и неизвестные адреса ведут на плитку, как "/" в SSR-версии */}
          <Route path="*" element={<Navigate to={ROUTES.GRID} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
