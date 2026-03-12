# Phase 3: Profile Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Зависимость:** Phase 1 (Auth) должна быть завершена перед началом.

**Goal:** Страница профиля со списком всех комнат пользователя и возможностью изменить имя.

**Architecture:** Серверный компонент `/profile` читает сессию и загружает данные из API. `GET /api/profile` возвращает профиль + все комнаты где есть `Participant` с `userId === currentUser.id`.

**Tech Stack:** Next.js 14 App Router, Prisma 7, Supabase Auth, Tailwind CSS, Material Symbols

---

## Chunk 1: API

### Task 1: PATCH /api/profile — обновление имени

**Files:**
- Modify: `app/api/profile/route.ts`

- [ ] Добавить PATCH handler (GET и POST уже созданы в Phase 1):
```typescript
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Имя не может быть пустым' }, { status: 400 })
    if (name.trim().length > 64) return NextResponse.json({ error: 'Имя не более 64 символов' }, { status: 400 })

    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: { name: name.trim() },
    })

    return NextResponse.json(profile)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

### Task 2: GET /api/profile — вернуть комнаты пользователя

**Files:**
- Modify: `app/api/profile/route.ts`

- [ ] Обновить GET handler чтобы включал список комнат:
```typescript
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Все комнаты где пользователь — участник
    const participants = await prisma.participant.findMany({
      where: { userId: user.id },
      include: {
        room: {
          include: { _count: { select: { participants: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const rooms = participants.map(p => ({
      participantId: p.id,
      participantName: p.name,
      room: p.room,
      isOwner: p.room.ownerId === user.id,
    }))

    return NextResponse.json({ ...profile, rooms })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

- [ ] Commit:
```bash
git add app/api/profile/
git commit -m "feat: add profile PATCH and rooms list to GET /api/profile"
```

---

## Chunk 2: Страница профиля

### Task 3: Создать /profile/page.tsx

**Files:**
- Create: `app/profile/page.tsx`

- [ ] Создать `app/profile/page.tsx`:
  - Загрузить данные через `fetch('/api/profile')` на клиенте (Client Component)
  - Отобразить: имя (с кнопкой редактирования), email
  - Список комнат: карточки с `logoUrl` (или icon placeholder `fitness_center`), название, дисциплина, `N чел.`, метка `[owner]` если владелец
  - Клик по карточке → переход в `/room/[code]`
  - Кнопка `logout()` → `supabase.auth.signOut()` → редирект на `/login`

  Структура карточки комнаты:
  ```
  ┌──────────────────────────────────────┐
  │ [logo] Команда Альфа         [owner] │
  │        pushups · 5 чел.              │
  └──────────────────────────────────────┘
  ```

  Дизайн-система: Geist Mono, CSS vars (`--bg`, `--surface`, `--text`, `--muted`, `--border`), `border-radius: 0`, акцент `#ff6b35`, иконки Material Symbols.

- [ ] Проверить вручную:
  1. Войти → перейти на `/profile`
  2. Убедиться что отображаются все комнаты пользователя
  3. Кликнуть на комнату → перейти в неё
  4. Изменить имя → убедиться что сохраняется
  5. Нажать `logout()` → попасть на `/login`, попытка открыть `/profile` → редирект на `/login`

- [ ] Commit:
```bash
git add app/profile/
git commit -m "feat: add profile page with rooms list and logout"
```

---

### Task 4: Добавить ссылку на профиль в хедер комнаты

**Files:**
- Modify: `app/room/[code]/page.tsx`

- [ ] В хедере комнаты рядом с `ThemeToggle` добавить иконку `account_circle` — ссылка на `/profile`.
  Размер `w-8 h-8`, цвет `var(--muted)`.

- [ ] Commit:
```bash
git add app/room/
git commit -m "feat: add profile link to room header"
```
