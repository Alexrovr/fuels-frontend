import './TabBar.css'
import type { FC } from 'react'
import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'

// Нижняя навигационная панель из 4 пунктов. Гостю доступны только Лента и Плитка:
// Добавление и Вход появятся вместе с авторизацией, сейчас они disabled.
// NavLink сам ставит класс active, когда адрес совпадает (/feed и /feed/:id).
export const TabBar: FC = () => (
  <Nav as="nav" className="tabBar">
    <Nav.Link as={NavLink} to={ROUTES.FEED} className="tabBarItem">
      <span className="tabBarIcon">&#9654;</span>
      <span className="tabBarLabel">{ROUTE_LABELS.FEED}</span>
    </Nav.Link>
    <Nav.Link disabled className="tabBarItem" title="Недоступно гостю">
      <span className="tabBarIcon">&#43;</span>
      <span className="tabBarLabel">{ROUTE_LABELS.DRAFT}</span>
    </Nav.Link>
    <Nav.Link as={NavLink} to={ROUTES.GRID} className="tabBarItem">
      <span className="tabBarIcon">&#9638;</span>
      <span className="tabBarLabel">{ROUTE_LABELS.GRID}</span>
    </Nav.Link>
    <Nav.Link disabled className="tabBarItem" title="Недоступно гостю">
      <span className="tabBarIcon">&#10140;</span>
      <span className="tabBarLabel">{ROUTE_LABELS.LOGIN}</span>
    </Nav.Link>
  </Nav>
)
