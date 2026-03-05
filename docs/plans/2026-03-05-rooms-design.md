# Дизайн: Комнаты с лидербордом

## Контекст

Сейчас PushUpTracker — единый глобальный лидерборд для всех. Хотим добавить комнаты, чтобы разные команды могли иметь свой изолированный лидерборд с инвайт-кодом.

## Стек

| Слой | Технология |
|------|-----------|
| Фронтенд + API | Next.js 14 (App Router) |
| ORM | Prisma |
| База данных | SQLite (миграция на PostgreSQL позже через смену DATABASE_URL) |
| Деплой | Railway (уже настроен) |
| Камера | MediaPipe (портируем из существующего index.html) |

## Флоу пользователя

**Создатель:**
1. Открывает `/` — видит кнопки "Создать комнату" и "Войти в комнату"
2. Вводит название комнаты → `POST /api/rooms`
3. Получает 6-символьный код → редирект на `/room/ABC123`

**Участник:**
1. Открывает `/` → нажимает "Войти в комнату"
2. Вводит код + ник → `POST /api/rooms/ABC123/join`
3. Редирект на `/room/ABC123`

**Идентификация:** без регистрации. После входа в комнату сохраняем в `localStorage`:
```json
{ "roomCode": "ABC123", "participantId": "uuid", "name": "Санан" }
```

## Страницы

```
/              — лендинг: "Создать комнату" / "Войти в комнату"
/room/[code]   — страница комнаты: лидерборд + тренировка с камерой
```

## Страница комнаты `/room/[code]`

**Лидерборд** — основная зона, список участников с количеством отжиманий.

**Статистика комнаты** — компактный блок:
```
Всего отжиманий командой: 1 240
Участников: 8  •  Сессий: 34  •  Активны сегодня: 3
```

**Обновление данных:** при загрузке страницы (нет реал-тайма). Пользователь обновляет вручную или заходит заново.

**Тренировка:** камера MediaPipe для авто-счёта отжиманий. Результат сессии записывается в текущую комнату.

## Модель данных (Prisma + SQLite)

```prisma
model Room {
  id          String        @id @default(cuid())
  name        String
  code        String        @unique
  createdAt   DateTime      @default(now())
  participants Participant[]
}

model Participant {
  id        String    @id @default(cuid())
  roomId    String
  name      String
  createdAt DateTime  @default(now())
  room      Room      @relation(fields: [roomId], references: [id])
  sessions  Session[]
}

model Session {
  id            String      @id @default(cuid())
  participantId String
  count         Int
  duration      Float
  date          String
  createdAt     DateTime    @default(now())
  participant   Participant @relation(fields: [participantId], references: [id])
}
```

## API Routes

```
POST /api/rooms              — создать комнату { name } → { id, name, code }
GET  /api/rooms/[code]       — инфо + лидерборд + статистика комнаты
POST /api/rooms/[code]/join  — войти { name } → { participantId, name }
POST /api/sessions           — записать сессию { participantId, count, duration }
```

Старые эндпоинты (`/api/players`, `/api/leaderboard`, `/api/stats`) удаляются.

## Структура проекта

```
/app
  page.tsx                          — лендинг
  /room/[code]/page.tsx             — страница комнаты
  /api/rooms/route.ts               — POST создать комнату
  /api/rooms/[code]/route.ts        — GET инфо + лидерборд
  /api/rooms/[code]/join/route.ts   — POST войти в комнату
  /api/sessions/route.ts            — POST записать сессию
/prisma
  schema.prisma
```

## Что убирается

- `server.js` — заменяется Next.js API Routes
- `public/index.html`, `public/leaderboard.html` — заменяются Next.js страницами
- `express`, `cors`, `better-sqlite3` — заменяются Prisma + Next.js

## Миграция на PostgreSQL в будущем

1. Поменять `provider = "sqlite"` на `provider = "postgresql"` в schema.prisma
2. Обновить `DATABASE_URL` в Railway на Postgres URL
3. Запустить `prisma migrate deploy`
4. Код API не меняется
