## Лабораторная работа №6

SPA на React для **гостя и пользователя**. Услуга курса — вид топлива (метан, пропан-бутан, ацетилен, водород…).

Четыре страницы — **лента**, **добавление**, **плитка**, **вход**. Данные берутся из веб-сервиса ЛР3–ЛР4 (`/api/fuels…`) — репозиторий
[fuels-backend](https://github.com/Alexrovr/fuels-backend);
если он не запущен, гостю карточки показываются из коллекции mock-объектов.

Что добавлено в ЛР6 по сравнению с ЛР5:

- менеджер состояний **Redux Toolkit**: фильтр плитки, состояние пользователя, лента, черновик;
- **кодогенерация** клиента веб-сервиса из Swagger (`swagger-typescript-api`, HTTP-клиент **axios**) и вызов
  сгенерированных методов из **thunk** (`createAsyncThunk`, middleware `redux-thunk`);
- **авторизация**: страница входа, переключение интерфейса гостя / пользователя кнопкой **Вход** / **Выход**;
  вход и выход — обычным axios, состояние передаётся в Redux вручную (без кодогенерации и thunk);
- страница **добавления** услуги, кнопки **удаления** (плитка, черновик) и **лайка** (лента);
- **анимация загрузки**, блокирующая кнопки на время запроса;
- **второй маршрут прокси** — для S3 (Minio).

## 1. Стек

| | |
|---|---|
| Язык | TypeScript |
| Библиотека интерфейса | React 19 (только функциональные компоненты и хуки) |
| Сборщик и dev-сервер | Vite 8 (`@vitejs/plugin-react`) |
| Роутинг | `react-router-dom` 7 (`BrowserRouter`, вложенные `Route`, `Outlet`, `Navigate`) |
| Менеджер состояний | `@reduxjs/toolkit` 2 (`configureStore`, `createSlice`, `createAsyncThunk`) + `react-redux` 9 |
| HTTP-клиент | `axios` 1 |
| Кодогенерация API | `swagger-typescript-api` 13 (`--axios`), источник — Swagger бэкенда `http://localhost:3030/swagger/doc.json` |
| Компоненты | `react-bootstrap` + `bootstrap` 5 (`Card`, `Button`, `Form`, `Form.Range`, `Nav`, `Row`/`Col`, `Spinner`, `Badge`, `Alert`) |

## 2. Запуск

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # проверка типов (tsc -b) и сборка в dist/
npm run lint           # oxlint
npm run generate-api   # пересоздать src/api/Api.ts из Swagger (бэкенд должен работать)
```

Для работы с реальными данными рядом поднять бэкенд (папка `fuels-backend`):
`docker compose up -d` (Postgres, Minio, Redis) и `go run ./cmd/app` (порт 3030).
Без бэкенда приложение тоже работает — гостю на mock-данных.

Стартовые пользователи бэкенда: `ivanov`, `petrova`, `smirnov` (пароль — в README бэкенда).
У `petrova` есть черновик и своя опубликованная карточка «Ацетилен» — удобно показывать добавление и удаление.

### 2.1. Прокси и CORS

Браузер обращается только к dev-серверу `localhost:3000`, а тот проксирует запросы дальше (`vite.config.ts`).
Для браузера и страница, и API, и изображения находятся на одном origin, поэтому ограничение CORS не возникает
и на бэкенде его настраивать не нужно.

| Путь во фронтенде | Куда уходит |
|---|---|
| `/api/*` | `http://localhost:3030/api/*` — JSON API (маршрут 1) |
| `/minio/*` | `http://localhost:9000/*` — S3 Minio, бакет `heat-fuel-media` (маршрут 2, префикс `/minio` отрезается) |
| `/resources/*` | `http://localhost:3030/resources/*` — медиа по умолчанию, которые бэкенд отдаёт со своего адреса |

Бэкенд хранит полные url объектов (`http://localhost:9000/heat-fuel-media/metan.jpg`). Перед выводом
`toProxyUrl` (`src/modules/media.ts`) переписывает их на прокси: `/minio/heat-fuel-media/metan.jpg`.
Во вкладке Network поэтому видно, что и AJAX-запросы, и изображения идут на `localhost:3000`.

### 2.2. Кодогенерация

`scripts/generate-api.mjs` вызывает `generateApi` из `swagger-typescript-api` с `httpClientType: 'axios'`
и пишет `src/api/Api.ts` — интерфейсы ответов (`SerializersFuelListItem`, `SerializersFuelDetail`, …)
и класс `Api` с методами на axios. Адрес Swagger можно переопределить переменной `SWAGGER_URL`.

| Метод веб-сервиса | Сгенерированный метод | Thunk |
|---|---|---|
| `GET /api/fuels?min_heat=` | `api.fuels.fuelsList` | `fuels/getFuelsList` |
| `DELETE /api/fuels/:id` | `api.fuels.fuelsDelete` | `fuels/deleteFuel`, `draft/deleteFuelDraft` |
| `GET /api/fuels/feed`, `/feed/:id?next=true` | `api.fuels.feedList`, `api.fuels.feedDetail` | `feed/getFeedFuel` |
| `POST /api/fuels/:id/like` | `api.fuels.likeCreate` | `feed/likeFuel` |
| `GET /api/fuels/draft` | `api.fuels.draftList` | `draft/getFuelDraft` |
| `POST /api/fuels` (form-data) | `api.fuels.fuelsCreate` | `draft/createFuelDraft` |
| `PUT /api/fuels/:id/publish` | `api.fuels.publishUpdate` | `draft/publishFuelDraft` |
| `POST /api/users/login`, `/logout` | **не используются** — вход и выход через обычный axios (`src/api/auth.ts`) | — |

Экземпляр клиента — `src/api/index.ts`: `baseURL: '/api'` (через прокси), таймаут 3 с и `securityWorker`,
который добавляет `Authorization: Bearer <JWT>` ко всем методам со схемой безопасности `BearerAuth`.

### 2.3. Когда используются mock-данные

Thunk плитки и ленты сначала вызывают сгенерированный метод. Если сети нет, запрос не уложился в таймаут
или пришёл ответ 5xx (бэкенд выключен — прокси Vite отвечает `500`/`502`), **гостю** данные берутся из
`src/modules/mock.ts` (функции `mockFuelsList`, `mockFeedFuel` повторяют фильтр и «Следующий» бэкенда),
а на странице появляется пометка **mock — веб-сервис недоступен**. У **пользователя** вместо mock показывается
ошибка: его действия (лайк, удаление, добавление) mock выполнить не может. Ответ 404 — настоящий ответ
веб-сервиса, mock вместо него не подставляется.

Mock работает **без БД и без S3**: фото и видео mock-карточек лежат в `public/mock/`.

## 3. Redux Toolkit

`src/store/index.ts` — `configureStore` с четырьмя слайсами. Middleware `redux-thunk` подключается
`configureStore` по умолчанию; там же включается поддержка расширения Redux DevTools.

| Слайс | Состояние | Действия |
|---|---|---|
| `user` | `isAuthenticated`, `userId`, `login`, `fullName`, `loading`, `error` | обычные (без thunk): `authRequestStarted`, `loginSucceeded`, `authRequestFailed`, `loggedOut` |
| `fuels` | `minHeat` — **фильтр плитки**, `list`, `fromMock`, `loading`, `deletingId`, `error`, `requestId` | `setMinHeat`, `resetFilter`; thunk `getFuelsList`, `deleteFuel`; на `loggedOut` — сброс фильтра |
| `feed` | `fuel`, `loaded`, `fromMock`, `loading`, `liking`, `error`, `requestId` | thunk `getFeedFuel`, `likeFuel`; на `loginSucceeded`/`loggedOut` — сброс (меняется `is_liked`) |
| `draft` | `draft`, `loaded`, `loading`, `error` | thunk `getFuelDraft`, `createFuelDraft`, `publishFuelDraft`, `deleteFuelDraft`; на `loggedOut` — сброс |

`src/store/hooks.ts`: типизированные `useAppDispatch`, `useAppSelector`, `createAppAsyncThunk`
(у thunk `getState()` типа `RootState`, `rejectWithValue` — текст ошибки) и селектор `selectIsBusy`.

`requestId` в `fuels` и `feed` — ид последнего запроса (`action.meta.requestId`): ответ более старого
запроса (например, второй запрос `StrictMode` или быстрое переключение карточек) не перезаписывает состояние.

### 3.1. Авторизация, F5 и localStorage

1. Страница входа отправляет `POST /api/users/login` обычным axios (`loginRequest`).
2. JWT сохраняется в `localStorage` под ключом **`heat_fuels_jwt`** и передаётся сгенерированному клиенту
   (`api.setSecurityData(token)`); пользователь — в Redux действием `loginSucceeded`.
3. Меню переключается на интерфейс пользователя: доступно «Добавление», вместо «Вход» — **«Выход»**,
   в шапке — логин.
4. **F5**: приложение загружается заново, Redux создаётся с начальным состоянием — **гость**, клиент API
   снова без токена. Во вкладке **Application → Local Storage** JWT при этом остаётся — его можно
   скопировать в Postman/Insomnia (`Authorization: Bearer <токен>`) и получить плитку с `is_mine`.
5. «Выход»: `POST /api/users/logout` (токен — в чёрный список Redis), токен удаляется из `localStorage`,
   `loggedOut` возвращает гостя и **сбрасывает фильтр** плитки.

## 4. Страницы

Макет — вертикальный экран телефона: на компьютере приложение показывается колонкой 420 px по центру.
Сверху у всех страниц панель с логотипом **HEATCALC**, названием страницы и логином (или «гость»),
снизу — навигационная панель. Пока идёт любой запрос, поверх приложения — **анимация загрузки**
(`LoadingOverlay`): полупрозрачный слой со спиннером перехватывает нажатия, кнопки заблокированы.

### 4.1. Нижняя навигационная панель

| Пункт | Гость | Пользователь |
|---|---|---|
| ▶ Лента | `/feed` | `/feed` |
| + Добавление | недоступен (серый) | `/draft` |
| ▦ Плитка | `/grid` | `/grid` |
| ➜ Вход / ✖ Выход | **Вход** — `/login` | **Выход** — кнопка выхода |

### 4.2. Плитка — `/grid`

Запрос: `GET /api/fuels?min_heat=<фильтр из Redux>` (без фильтра — `GET /api/fuels`).

| Элемент | Описание |
|---|---|
| Слайдер **«Теплота сгорания не менее, кДж/м³»** | 0 – 110 000 с шагом 1 000; положение до нажатия «Найти» — локальное состояние |
| Кнопка **Найти** | `setMinHeat` — фильтр в Redux, карточки загружаются заново; фильтр сохраняется при переходах между страницами и сбрасывается при выходе |
| Карточки в два столбца | изображение (из Minio через `/minio`), название, теплота сгорания, лайки; нажатие — переход в ленту |
| Кнопка **Удалить** | только у своих карточек пользователя (`is_mine`); подтверждение, затем `DELETE /api/fuels/:id` |

### 4.3. Лента — `/feed`, `/feed/:id`

| Элемент | Описание |
|---|---|
| Видео на весь экран, название, описание (Больше / Меньше), два поля по теме | как в ЛР5 |
| **Лайк** | гостю — только число; пользователю — кнопка ♡ / ❤: `POST /api/fuels/:id/like` с `like: 1` или `0` |
| **Следующий** | `GET /api/fuels/feed/:id?next=true`, адрес меняется на `/feed/<ид>` |

### 4.4. Добавление — `/draft` (только пользователю, гостя перенаправляет на вход)

| Шаг | Элементы | Запрос |
|---|---|---|
| 1 — черновика нет | название, изображение, видео, **Далее** | `POST /api/fuels` (form-data, файлы — в Minio) |
| 2 — черновик есть | изображение черновика, описание, теплота сгорания, температура воспламенения, **Опубликовать**, **Удалить черновик** | `PUT /api/fuels/:id/publish` → переход в ленту на новую карточку; `DELETE /api/fuels/:id` |

### 4.5. Вход — `/login`

Логин, пароль, **Войти**. Ошибка бэкенда («Неверный логин или пароль») показывается над формой.
Вошедшего пользователя страница перенаправляет на плитку.

## 5. Изображение и видео по умолчанию

`public/DefaultImage.svg`, `public/DefaultVideo.mp4` (`src/modules/media.ts`): пустой url → файл по умолчанию,
файл не загрузился → `onError` меняет `src` на файл по умолчанию.

## 6. Структура

```
fuels-frontend/
  vite.config.ts             порт 3000, прокси /api, /resources → :3030 и /minio → :9000
  scripts/generate-api.mjs   кодогенерация src/api/Api.ts из Swagger
  public/                    DefaultImage.svg, DefaultVideo.mp4, mock/ — медиа mock-карточек
  src/
    main.tsx                 createRoot, StrictMode, <Provider store>
    App.tsx                  маршруты /feed, /feed/:id, /draft, /grid, /login внутри AppLayout
    AppLayout.tsx            TopBar + <Outlet/> + TabBar + LoadingOverlay
    Routes.ts                адреса и подписи страниц
    api/
      Api.ts                 СГЕНЕРИРОВАНО swagger-typescript-api (axios) — руками не править
      index.ts               экземпляр Api: baseURL /api, таймаут, securityWorker (JWT)
      auth.ts                вход/выход обычным axios, JWT в localStorage
      errors.ts              isServiceDown, httpStatus, errorMessage
    store/
      index.ts               configureStore, RootState, AppDispatch
      hooks.ts               useAppDispatch, useAppSelector, createAppAsyncThunk, selectIsBusy
      userSlice.ts           пользователь (без thunk)
      fuelsSlice.ts          фильтр и плитка, удаление
      feedSlice.ts           лента, лайк
      draftSlice.ts          черновик: получение, создание, публикация, удаление
    modules/
      types.ts               FuelListItem, FuelDetail на основе сгенерированных типов
      mock.ts, mockApi.ts    mock-коллекция и ответы «как у веб-сервиса»
      media.ts               медиа по умолчанию и toProxyUrl
    components/              TopBar, TabBar, HeatFilter, FuelCard, SourceNote, LoadingOverlay
    pages/                   GridPage, FeedPage, DraftPage, LoginPage
```

В режиме разработки `StrictMode` монтирует компоненты дважды, поэтому во вкладке Network запрос
при открытии страницы виден два раза; в production-сборке (`npm run build`) — один.
