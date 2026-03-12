# Phase 2: Groups v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Зависимость:** Phase 1 (Auth) должна быть завершена перед началом.

**Goal:** Добавить права владельца (кик, переименование), публичные/приватные комнаты, дисциплины, логотипы и страницу каталога публичных групп.

**Architecture:** `Room` модель расширяется полями `isPublic`, `discipline`, `logoUrl`. Новые API endpoints проверяют `ownerId === userId` перед изменениями. Логотипы хранятся в Supabase Storage (бакет `room-logos`). Страница `/rooms` показывает публичный каталог.

**Tech Stack:** Next.js 14, Prisma 7, Supabase Storage (`@supabase/supabase-js`), Tailwind CSS, Material Symbols

---

## Chunk 1: Схема данных

### Task 1: Расширить Room модель

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] Добавить поля в `Room`:
```prisma
model Room {
  id           String        @id @default(cuid())
  name         String
  code         String        @unique
  ownerId      String?       // уже добавлено в Phase 1
  isPublic     Boolean       @default(false)
  discipline   String        @default("pushups")
  logoUrl      String?
  createdAt    DateTime      @default(now())
  participants Participant[]
}
```

- [ ] Создать и накатить миграцию:
```bash
npx prisma migrate dev --name add_room_groups_v2
```

- [ ] Commit:
```bash
git add prisma/
git commit -m "feat: add isPublic, discipline, logoUrl to Room model"
```

---

## Chunk 2: API Routes — права владельца

### Task 2: PATCH /api/rooms/[code] — переименование и изменение публичности

**Files:**
- Create: `app/api/rooms/[code]/route.ts` (добавить PATCH к существующему файлу)

- [ ] Добавить PATCH handler в `app/api/rooms/[code]/route.ts`:
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } })
    if (!room) return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    if (room.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const data: { name?: string; isPublic?: boolean; discipline?: string } = {}

    if (body.name !== undefined) {
      if (!body.name.trim()) return NextResponse.json({ error: 'Название не может быть пустым' }, { status: 400 })
      if (body.name.trim().length > 64) return NextResponse.json({ error: 'Название не более 64 символов' }, { status: 400 })
      data.name = body.name.trim()
    }
    if (body.isPublic !== undefined) data.isPublic = Boolean(body.isPublic)
    if (body.discipline !== undefined) {
      const allowed = ['pushups', 'squats', 'pullups', 'situps']
      if (!allowed.includes(body.discipline)) return NextResponse.json({ error: 'Неверная дисциплина' }, { status: 400 })
      data.discipline = body.discipline
    }

    const updated = await prisma.room.update({ where: { code: code.toUpperCase() }, data })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

### Task 3: DELETE /api/rooms/[code]/participants/[id] — кик участника

**Files:**
- Create: `app/api/rooms/[code]/participants/[id]/route.ts`

- [ ] Создать директорию:
```bash
mkdir -p "app/api/rooms/[code]/participants/[id]"
```

- [ ] Создать `route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  try {
    const { code, id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } })
    if (!room) return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    if (room.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Нельзя выгнать самого себя (владельца)
    const target = await prisma.participant.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    if (target.userId === user.id) return NextResponse.json({ error: 'Нельзя выгнать себя' }, { status: 400 })

    // Cascade удалит Session записи автоматически
    await prisma.participant.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

### Task 4: POST /api/rooms/[code]/logo — загрузка логотипа

**Files:**
- Create: `app/api/rooms/[code]/logo/route.ts`

- [ ] Создать директорию:
```bash
mkdir -p "app/api/rooms/[code]/logo"
```

- [ ] В Supabase Dashboard создать Storage bucket `room-logos`:
  - Public: Yes (публичный read)
  - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`
  - Max file size: 1MB

- [ ] Создать `route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient as createSupabaseServer } from '@/lib/supabase-server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } })
    if (!room) return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    if (room.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get('logo') as File | null
    if (!file) return NextResponse.json({ error: 'Файл обязателен' }, { status: 400 })
    if (file.size > 1024 * 1024) return NextResponse.json({ error: 'Файл не более 1MB' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Только изображения (jpg, png, webp, gif)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${code.toUpperCase()}.${ext}`

    // Используем service role key для записи в Storage
    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: uploadError } = await adminClient.storage
      .from('room-logos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = adminClient.storage
      .from('room-logos')
      .getPublicUrl(path)

    const updated = await prisma.room.update({
      where: { code: code.toUpperCase() },
      data: { logoUrl: publicUrl },
    })

    return NextResponse.json({ logoUrl: updated.logoUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

- [ ] Добавить `SUPABASE_SERVICE_ROLE_KEY` в `.env` (из Supabase Dashboard → Settings → API → service_role key)

- [ ] Commit:
```bash
git add app/api/rooms/
git commit -m "feat: add owner actions — rename, kick, logo upload"
```

---

## Chunk 3: GET /api/rooms — каталог публичных комнат

### Task 5: Добавить GET /api/rooms

**Files:**
- Modify: `app/api/rooms/route.ts`

- [ ] Добавить GET handler:
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const discipline = searchParams.get('discipline')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = 20

    const where: { isPublic: boolean; discipline?: string } = { isPublic: true }
    if (discipline && discipline !== 'all') where.discipline = discipline

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: { _count: { select: { participants: true } } },
        orderBy: { participants: { _count: 'desc' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.room.count({ where }),
    ])

    return NextResponse.json({ rooms, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## Chunk 4: UI — панель настроек владельца в комнате

### Task 6: Компонент RoomSettings

**Files:**
- Create: `components/RoomSettings.tsx`

- [ ] Создать `components/RoomSettings.tsx` — панель для владельца:
  - Поле переименования комнаты (input + кнопка сохранить)
  - Переключатель публичная / приватная
  - Загрузка логотипа (file input, только изображения, до 1MB)
  - Список участников с кнопкой `person_remove` (кик)
  - Кнопка закрыть панель

  Триггер: иконка `settings` в хедере комнаты, видна только владельцу (`room.ownerId === currentUserId`).

  Пропсы:
  ```typescript
  interface Props {
    roomCode: string
    roomName: string
    isPublic: boolean
    discipline: string
    participants: Array<{ id: string; name: string; userId: string | null }>
    currentUserId: string
    onClose: () => void
    onUpdate: (updates: { name?: string; isPublic?: boolean }) => void
  }
  ```

---

### Task 7: Страница /rooms — каталог публичных групп

**Files:**
- Create: `app/rooms/page.tsx`

- [ ] Создать `app/rooms/page.tsx`:
  - Фильтр по дисциплине: `[все] [pushups] [squats] [pullups] [situps]`
  - Карточки комнат: логотип (или placeholder), название, дисциплина, кол-во участников, кнопка `join_room()`
  - При клике join → использовать существующий join flow

---

### Task 8: Обновить room/[code]/page.tsx — передать ownerId во фронтенд

**Files:**
- Modify: `app/room/[code]/page.tsx`

- [ ] При загрузке комнаты (`GET /api/rooms/[code]`) включить `ownerId` в ответ:
  - Обновить `GET /api/rooms/[code]/route.ts` чтобы возвращал `ownerId` вместе с данными
  - Сравнивать с `currentUserId` из Supabase сессии
  - Показывать иконку `settings` только если `ownerId === currentUserId`

- [ ] Commit:
```bash
git add components/RoomSettings.tsx app/rooms/ app/room/ app/api/rooms/
git commit -m "feat: complete Phase 2 — groups v2 with owner controls and public catalog"
```
