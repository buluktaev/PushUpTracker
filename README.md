# PushUp Tracker

**Командный трекер отжиманий с автосчётом через камеру.**

Создай комнату, пригласи команду по коду, тренируйся — камера считает отжимания автоматически через MediaPipe Pose. Лидерборд обновляется в реальном времени.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![Render](https://img.shields.io/badge/deploy-Render-46E3B7)

## Возможности

- **Автосчёт через камеру** — MediaPipe Pose определяет отжимания без датчиков
- **Комнаты с инвайт-кодами** — создай комнату, поделись кодом с командой
- **Лидерборд** — рейтинг участников по количеству отжиманий
- **Авторизация** — регистрация и вход через email (Supabase Auth)
- **PWA** — устанавливается на телефон как приложение
- **Тёмная тема** — переключается одной кнопкой

## Быстрый старт

```bash
git clone https://github.com/buluktaev/PushUpTracker.git
cd PushUpTracker
cp .env.example .env   # заполни DATABASE_URL и Supabase ключи
npm install
npm run dev
```

Открой `http://localhost:3000`.

> `npm run dev` автоматически запускает `prisma migrate deploy` перед стартом.

### Переменные окружения

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_API_KEY=change-me
```

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| БД | PostgreSQL (Yandex Cloud), Prisma 7 |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Детекция | MediaPipe Tasks Vision (Pose Landmarker) |
| Шрифт | Geist Mono |
| Иконки | Material Symbols Outlined |
| Деплой | Render (Docker) |

## Структура проекта

```
app/
  page.tsx                 # Главная: список комнат + создать/войти
  login/page.tsx           # Вход
  register/page.tsx        # Регистрация
  verify-email/page.tsx    # Ожидание подтверждения email
  auth/confirm/page.tsx    # Callback подтверждения
  room/[code]/page.tsx     # Комната: тренировка + лидерборд
  api/
    rooms/                 # CRUD комнат и участников
    sessions/              # Запись тренировок
    profile/               # Профиль пользователя
    auth/                  # Claim + resend email
components/
  CameraWorkout.tsx        # MediaPipe Pose + автосчёт + countdown
  ThemeToggle.tsx          # Светлая/тёмная тема
  Icon.tsx                 # Material Symbols обёртка
lib/
  prisma.ts                # Prisma client (pg.Pool + SSL)
  supabase-client.ts       # Supabase Auth (браузер)
  supabase-server.ts       # Supabase Auth (сервер)
middleware.ts              # Защита маршрутов
prisma/
  schema.prisma            # Profile, Room, Participant, Session
```

## Как работает детекция

MediaPipe Pose анализирует видеопоток с камеры и отслеживает углы локтей:

- **Вниз** — угол локтя < 100&deg;
- **Вверх** — угол локтя > 140&deg;
- **Anti-cheat** — проверка горизонтального положения тела через world landmarks

Скелет подсвечивается зелёным при правильной позе.

## Деплой

Проект деплоится на Render через Docker. Конфигурация в `render.yaml`.

1. Подключи репозиторий в Render
2. Установи env-переменные: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Render автоматически соберёт Docker-образ и запустит приложение

Health check: `GET /api/health`

## Лицензия

MIT
