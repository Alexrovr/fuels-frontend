import { Api } from './Api'

// Экземпляр клиента, сгенерированного из Swagger (npm run generate-api).
// baseURL относительный: запрос уходит на dev-сервер Vite (localhost:3000/api/...),
// а тот проксирует его на бэкенд :3030 — для браузера это один origin, CORS не нужен.
//
// securityData — JWT текущего пользователя. Его кладёт сюда страница входа
// (setSecurityData), а securityWorker добавляет к каждому методу с @Security BearerAuth
// заголовок Authorization. После F5 модуль загружается заново, securityData = null —
// запросы идут как от гостя, так же как Redux после перезагрузки в состоянии гостя.
export const api = new Api<string | null>({
  baseURL: '/api',
  timeout: 3000, // бэкенд не ответил за 3 с — считаем недоступным, гостю показываем mock
  securityWorker: (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
})
