# PushUp Tracker

Командный фитнес-трекер с комнатами, дисциплинами, рейтингом участников и фиксацией тренировок.

Приложение позволяет создать комнату, пригласить участников по коду, выбирать дисциплины, фиксировать тренировки и смотреть общий прогресс команды.

## Что умеет

- регистрация и вход по email
- восстановление пароля через email
- создание и вход в комнаты по коду
- фиксация тренировок по дисциплинам
- рейтинг участников внутри комнаты
- профиль участника и настройки комнаты
- работа с упражнениями и прогрессом внутри комнаты
- PWA-режим для мобильного использования

## Стек

- Next.js 14 + App Router
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Supabase Auth
- MediaPipe Pose
- Render

## Быстрый старт

```bash
git clone https://github.com/buluktaev/PushUpTracker.git
cd PushUpTracker
cp .env.example .env
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Минимально нужны:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_API_KEY=change-me
APP_PUBLIC_URL=https://your-public-app.example.com
NEXT_PUBLIC_ENABLE_REVIEW_ROUTES=false
```

## Основные команды

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preprod:static
npm run smoke:health
npm run smoke:browser
```

## Деплой

Проект деплоится на Render через Docker. Конфигурация находится в [render.yaml](render.yaml).

Перед production rollout стоит проверить:

- `APP_PUBLIC_URL`
- Supabase redirect URLs
- `GET /api/health`

## Healthcheck

```bash
curl -I https://your-app-host/api/health
```

Сервис должен отвечать `200 OK`.
