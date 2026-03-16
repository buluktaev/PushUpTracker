# PushUp Tracker

Командный трекер отжиманий с комнатами, лидербордом, авторизацией через Supabase и автосчётом через камеру.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![Render](https://img.shields.io/badge/deploy-Render-46E3B7)

## Что это

Пользователь регистрируется или логинится → создаёт комнату или входит по коду → команда тренируется в браузере → лидерборд обновляется после каждой сессии. MediaPipe Pose считает отжимания автоматически через камеру.

## Стек

- **Next.js 14** (App Router) + TypeScript
- **Prisma 7** + PostgreSQL
- **Supabase Auth** — регистрация, логин, browser/server sessions
- **MediaPipe Tasks Vision** — автосчёт через камеру
- **Geist Mono** — шрифт интерфейса
- **Render** — deploy/runtime

## Локальный запуск

```bash
npm install
npm run dev
```

Открой `http://localhost:3000`.

> `npm run dev` автоматически запускает `prisma migrate deploy` перед стартом.

### Обязательные env

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_API_KEY=change-me
```

## Структура

```
app/
  page.tsx               # Home: комнаты пользователя + создать / войти
  login/page.tsx         # Логин
  register/page.tsx      # Регистрация
  verify-email/page.tsx  # Экран ожидания подтверждения
  auth/confirm/page.tsx  # Confirm email callback
  room/[code]/page.tsx   # Комната: workout / leaderboard / profile
  api/
    profile/             # Профиль текущего пользователя
    rooms/               # CRUD комнат, membership, room data
    sessions/            # Запись тренировочных сессий
components/
  CameraWorkout.tsx      # MediaPipe Pose + автосчёт
  ThemeToggle.tsx        # Переключатель светлой/тёмной темы
  Icon.tsx               # Обёртка Material Symbols
prisma/
  schema.prisma          # Схема: Profile, Room, Participant, Session
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/profile` | Профиль текущего пользователя |
| `GET` | `/api/rooms` | Комнаты текущего пользователя |
| `POST` | `/api/rooms` | Создать комнату |
| `GET` | `/api/rooms/:code` | Данные комнаты + лидерборд |
| `POST` | `/api/rooms/:code/join` | Войти в комнату |
| `DELETE` | `/api/rooms/:code/membership` | Покинуть комнату как участник |
| `DELETE` | `/api/rooms/:code` | Удалить комнату как владелец |
| `POST` | `/api/sessions` | Сохранить тренировочную сессию |

## Deploy на Render

1. Подключи репозиторий в Render.
2. Используй `render.yaml` для production и `render.staging.yaml` для staging.
3. Установи production env:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - optional `ADMIN_API_KEY`
4. Для auth используй тот же production Supabase project, который указан в `NEXT_PUBLIC_SUPABASE_*`.
5. Перед выкладкой в production прогоняй staging smoke из `docs/test-plan.md`.

## Детекция отжиманий

MediaPipe Pose определяет ориентацию автоматически. Runtime, `wasm` и модель отдаются с first-party путей:

- `/mediapipe/wasm/...`
- `/mediapipe/models/pose_landmarker_full.task`

Это сделано специально, чтобы Chrome и Safari одинаково работали на staging и в production.

Основная логика детекции:

- **Лицом к камере** — gap между запястьями и плечами (down < 0.08, up > 0.18)
- **Боком к камере** — средний угол локтей (down < 90°, up > 150°)

Требуется видимость ключевых точек `> 0.5`.
