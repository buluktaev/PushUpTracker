# PushUp Tracker

Командный трекер отжиманий с комнатами, лидербордом и автосчётом через камеру.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![Railway](https://img.shields.io/badge/deploy-Railway-7B2FBE)

## Что это

Создай комнату → поделись кодом с командой → каждый заходит через браузер и отжимается. MediaPipe Pose считает отжимания автоматически через камеру. Общий лидерборд обновляется после каждой сессии.

## Стек

- **Next.js 14** (App Router) + TypeScript
- **Prisma 7** + SQLite (`better-sqlite3`)
- **MediaPipe Tasks Vision** — автосчёт через камеру
- **Geist Mono** — шрифт интерфейса
- **Railway** — деплой

## Локальный запуск

```bash
npm install
npm run dev
```

Открой `http://localhost:3000`.

> `npm run dev` автоматически запускает `prisma migrate deploy` перед стартом.

## Структура

```
app/
  page.tsx               # Лендинг: создать / войти в комнату
  room/[code]/page.tsx   # Комната: лидерборд + тренировка
  api/
    rooms/               # CRUD комнат и участников
    sessions/            # Запись тренировочных сессий
components/
  CameraWorkout.tsx      # MediaPipe Pose + автосчёт
  ThemeToggle.tsx        # Переключатель светлой/тёмной темы
  Icon.tsx               # Обёртка Material Symbols
prisma/
  schema.prisma          # Схема: Room, Participant, Session
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/rooms` | Создать комнату |
| `GET` | `/api/rooms/:code` | Данные комнаты + лидерборд |
| `POST` | `/api/rooms/:code/join` | Войти в комнату |
| `POST` | `/api/sessions` | Сохранить тренировочную сессию |

## Деплой на Railway

1. Подключи репозиторий в Railway
2. Добавь **Volume** с Mount Path `/data`
3. Установи переменную окружения:
   ```
   DATABASE_URL=file:/data/pushups.db
   ```
4. Railway соберёт образ через `Dockerfile` в корне репо

## Детекция отжиманий

MediaPipe Pose Lite определяет ориентацию автоматически:

- **Лицом к камере** — gap между запястьями и плечами (down < 0.08, up > 0.18)
- **Боком к камере** — средний угол локтей (down < 90°, up > 150°)

Требуется видимость ключевых точек `> 0.5`.
