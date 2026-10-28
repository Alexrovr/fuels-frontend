export const ROUTES = {
  FEED: '/feed',
  DRAFT: '/draft',
  GRID: '/grid',
  LOGIN: '/login',
}
export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  FEED: 'Лента',
  DRAFT: 'Добавление',
  GRID: 'Плитка',
  LOGIN: 'Вход',
}
