// Кодогенерация клиента веб-сервиса из Swagger бэкенда (swaggo/swag).
// Запуск: npm run generate-api (бэкенд должен работать на :3030).
// Результат — src/api/Api.ts: типы ответов и методы на axios.
import { resolve } from 'node:path'
import { generateApi } from 'swagger-typescript-api'

await generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  url: process.env.SWAGGER_URL ?? 'http://localhost:3030/swagger/doc.json',
  httpClientType: 'axios', // HTTP-клиент генерируемого кода — axios
})
