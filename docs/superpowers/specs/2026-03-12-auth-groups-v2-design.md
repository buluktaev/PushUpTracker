# PushUpTracker v2 — Auth + Groups v2 Design Spec

**Date:** 2026-03-12
**Status:** Approved by user
**Stack:** Next.js 14, Supabase Auth (`@supabase/ssr`), Prisma 7, PostgreSQL (Supabase), Supabase Storage

---

## Overview

Добавить обязательную авторизацию (email + пароль), расширить комнаты до «групп» с правами владельца, публичностью, дисциплинами и логотипами. Добавить страницу профиля и улучшить flow приглашений.

---

## Phase 1: Auth

### Цель
Обязательный вход/регистрация для всех пользователей. Миграция существующих данных без потери результатов.

### Схема данных
```prisma
model Profile {
  id        String   @id  // = Supabase auth user UUID
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}

// Participant — добавить поле:
userId    String?  // nullable для существующих записей
```

### Новые страницы
- `/login` — форма email + пароль
- `/register` — форма email + пароль + имя

### Middleware (`middleware.ts`)
- `/room/[code]`, `/profile` → требует сессии → редирект `/login`
- `/login`, `/register` → если залогинен → редирект `/`

### Supabase клиенты
- `lib/supabase-server.ts` — для API routes / Server Components
- `lib/supabase-client.ts` — для Client Components

### Claim endpoint
`POST /api/auth/claim` — принимает `participantIds[]` из localStorage, проставляет `userId` на все найденные `Participant` записи. Вызывается автоматически после первого входа.

### Изменение лендинга
- Не залогинен → редирект на `/login`
- Залогинен → существующий UI (список комнат / create / join)

---

## Phase 2: Groups v2

### Цель
Публичные/приватные комнаты, дисциплины, логотипы, права владельца.

### Схема данных
```prisma
// Room — добавить поля:
ownerId    String   // userId из Supabase Auth
isPublic   Boolean  @default(false)
discipline String   // "pushups" | "squats" | "pullups" | "situps"
logoUrl    String?
```

### Дисциплины (фиксированный список)
`pushups`, `squats`, `pullups`, `situps` — расширяется по мере добавления MediaPipe-трекеров.

### API изменения
| Endpoint | Метод | Описание | Авторизация |
|----------|-------|----------|-------------|
| `/api/rooms` | `POST` | Создать комнату (+ ownerId, discipline, isPublic) | userId из сессии |
| `/api/rooms` | `GET` | Список публичных комнат (?discipline=) | любой |
| `/api/rooms/[code]` | `PATCH` | Переименовать / изменить публичность | ownerId === userId |
| `/api/rooms/[code]/participants/[id]` | `DELETE` | Кик участника | ownerId === userId |
| `/api/rooms/[code]/logo` | `POST` | Загрузить логотип | ownerId === userId |

### Страница `/rooms`
Публичный каталог групп с фильтром по дисциплине. Пагинация. Карточки с логотипом, названием, дисциплиной, количеством участников.

### UI в комнате для владельца
Иконка `settings` в хедере → панель:
- Поле переименования комнаты
- Переключатель публичная/приватная
- Выбор дисциплины
- Загрузка логотипа (max 1MB, только изображения)
- Список участников с кнопкой кика

### Логотип — Supabase Storage
Бакет `room-logos`, публичный read. Файл: `{roomCode}.{ext}`.

---

## Phase 3: Profile

### Цель
Страница профиля со списком всех комнат пользователя.

### Страница `/profile`
- Имя пользователя (редактируемое)
- Список всех комнат где `Participant.userId === currentUser.id`
  - Карточка: название, дисциплина, количество участников, логотип
  - Переход в комнату по клику
- Кнопка «выйти из аккаунта»

### API
`GET /api/profile` — профиль + все Participant записи с join на Room.
`PATCH /api/profile` — обновить имя.

---

## Phase 4: UI / Invite

### Цель
Упростить приглашение в группы.

### Копирование полной ссылки
Кнопка `content_copy` копирует полный URL:
`https://pushuptracker-oq2o.onrender.com/room/[code]?join=1`

### Автозаполнение кода
При переходе по invite-ссылке (`?join=1&code=XXXXXX`) лендинг автоматически открывает форму join с предзаполненным кодом.

---

## Migration Strategy

1. Все существующие `Room` записи получают `ownerId = null` (nullable временно при миграции), `isPublic = false`, `discipline = "pushups"` (дефолт)
2. Все существующие `Participant` записи имеют `userId = null` — остаются рабочими
3. При первом входе пользователя: claim endpoint привязывает localStorage participantIds к userId
4. После миграции: `Room.ownerId` становится required для новых записей

---

## Implementation Order

```
Phase 1 (Auth) → Phase 2 + Phase 3 + Phase 4 (параллельно, зависят от Phase 1)
```

Phase 2 самая большая — рекомендуется делать первой после Phase 1.
