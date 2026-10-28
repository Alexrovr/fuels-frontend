import './TopBar.css'
import type { FC } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'

// Подпись текущей страницы определяется по адресу
const pageLabel = (pathname: string) =>
  pathname.startsWith(ROUTES.FEED) ? ROUTE_LABELS.FEED : ROUTE_LABELS.GRID

export const TopBar: FC = () => {
  const { pathname } = useLocation()

  return (
    <header className="topBar">
      <span className="topBarLogo">
        HEAT<span className="topBarLogoAccent">CALC</span>
      </span>
      <span className="topBarPage">{pageLabel(pathname)}</span>
    </header>
  )
}
