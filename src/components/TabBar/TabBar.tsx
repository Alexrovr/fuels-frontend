import './TabBar.css'
import type { FC } from 'react'
import { Nav } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import { api } from '../../api'
import { logoutRequest, readToken, removeToken } from '../../api/auth'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { authRequestStarted, loggedOut } from '../../store/userSlice'

// Нижняя навигационная панель из 4 пунктов.
// Гость: Лента, Добавление (недоступно), Плитка, Вход.
// Пользователь: Лента, Добавление, Плитка, Выход.
// NavLink сам ставит класс active, когда адрес совпадает (/feed и /feed/:id).
export const TabBar: FC = () => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Выход: POST /api/users/logout обычным axios (без thunk), затем состояние
  // вручную передаётся в Redux. loggedOut сбрасывает и пользователя, и фильтр плитки.
  // Если бэкенд недоступен, интерфейс всё равно возвращается к гостю.
  const handleLogout = async () => {
    const token = readToken()
    dispatch(authRequestStarted())
    try {
      if (token) await logoutRequest(token)
    } catch {
      // токен истечёт сам; локально выходим в любом случае
    }
    removeToken()
    api.setSecurityData(null)
    dispatch(loggedOut())
    navigate(ROUTES.GRID)
  }

  return (
    <Nav as="nav" className="tabBar">
      <Nav.Link as={NavLink} to={ROUTES.FEED} className="tabBarItem">
        <span className="tabBarIcon">&#9654;</span>
        <span className="tabBarLabel">{ROUTE_LABELS.FEED}</span>
      </Nav.Link>

      {isAuthenticated ? (
        <Nav.Link as={NavLink} to={ROUTES.DRAFT} className="tabBarItem">
          <span className="tabBarIcon">&#43;</span>
          <span className="tabBarLabel">{ROUTE_LABELS.DRAFT}</span>
        </Nav.Link>
      ) : (
        <Nav.Link disabled className="tabBarItem" title="Доступно после входа">
          <span className="tabBarIcon">&#43;</span>
          <span className="tabBarLabel">{ROUTE_LABELS.DRAFT}</span>
        </Nav.Link>
      )}

      <Nav.Link as={NavLink} to={ROUTES.GRID} className="tabBarItem">
        <span className="tabBarIcon">&#9638;</span>
        <span className="tabBarLabel">{ROUTE_LABELS.GRID}</span>
      </Nav.Link>

      {isAuthenticated ? (
        <Nav.Link as="button" type="button" className="tabBarItem tabBarButton" onClick={handleLogout}>
          <span className="tabBarIcon">&#10006;</span>
          <span className="tabBarLabel">Выход</span>
        </Nav.Link>
      ) : (
        <Nav.Link as={NavLink} to={ROUTES.LOGIN} className="tabBarItem">
          <span className="tabBarIcon">&#10140;</span>
          <span className="tabBarLabel">{ROUTE_LABELS.LOGIN}</span>
        </Nav.Link>
      )}
    </Nav>
  )
}
