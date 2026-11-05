import './TopBar.css'
import type { FC } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import { useAppSelector } from '../../store/hooks'

// Подпись текущей страницы определяется по адресу
const pageLabel = (pathname: string) => {
  if (pathname.startsWith(ROUTES.FEED)) return ROUTE_LABELS.FEED
  if (pathname.startsWith(ROUTES.DRAFT)) return ROUTE_LABELS.DRAFT
  if (pathname.startsWith(ROUTES.LOGIN)) return ROUTE_LABELS.LOGIN
  return ROUTE_LABELS.GRID
}

// Логотип, название страницы и кто вошёл: логин пользователя из Redux или «гость»
export const TopBar: FC = () => {
  const { pathname } = useLocation()
  const { isAuthenticated, login } = useAppSelector((state) => state.user)

  return (
    <header className="topBar">
      <span className="topBarLogo">
        HEAT<span className="topBarLogoAccent">CALC</span>
      </span>
      <span className="topBarPage">
        {pageLabel(pathname)}
        <span className={`topBarUser ${isAuthenticated ? 'topBarUserIn' : ''}`}>
          {isAuthenticated ? login : 'гость'}
        </span>
      </span>
    </header>
  )
}
