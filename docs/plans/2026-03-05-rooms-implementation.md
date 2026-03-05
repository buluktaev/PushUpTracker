# Rooms Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate PushUpTracker from Express + vanilla JS to Next.js 14 + Prisma + SQLite, adding room-based leaderboards with invite codes.

**Architecture:** Next.js App Router handles both frontend and API routes. Prisma ORM with SQLite as DB (Railway Volume at `/data/pushups.db`). Camera tracking (MediaPipe tasks-vision CDN) runs client-side in a `'use client'` component.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, SQLite (better-sqlite3 via Prisma), MediaPipe tasks-vision 0.10.9 (CDN)

---

## Task 1: Initialize Next.js project

**Files:**
- Modify: `package.json` (replace)
- Create: `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- Delete: `server.js`, `public/index.html`, `public/leaderboard.html`

**Step 1: Remove old files**

```bash
rm server.js public/index.html public/leaderboard.html
```

**Step 2: Initialize Next.js in current directory**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-git
```

When prompted about existing files, allow overwrite of `package.json`, `.gitignore`, `README.md`.

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at http://localhost:3000, default Next.js page visible.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 14 with TypeScript and Tailwind"
```

---

## Task 2: Setup Prisma + SQLite

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env`
- Modify: `package.json` (add prisma deps)

**Step 1: Install Prisma**

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

This creates `prisma/schema.prisma` and `.env`.

**Step 2: Replace schema with our models**

Replace contents of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Room {
  id           String        @id @default(cuid())
  name         String
  code         String        @unique
  createdAt    DateTime      @default(now())
  participants Participant[]
}

model Participant {
  id        String    @id @default(cuid())
  roomId    String
  name      String
  createdAt DateTime  @default(now())
  room      Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sessions  Session[]
}

model Session {
  id            String      @id @default(cuid())
  participantId String
  count         Int
  duration      Float
  date          String
  createdAt     DateTime    @default(now())
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
}
```

**Step 3: Set DATABASE_URL in .env**

`.env` should contain:
```
DATABASE_URL="file:./dev.db"
```

**Step 4: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: creates `prisma/migrations/` folder and `dev.db` file.

**Step 5: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 6: Add .env to .gitignore, add dev.db**

Make sure `.gitignore` contains:
```
.env
*.db
*.db-shm
*.db-wal
```

**Step 7: Commit**

```bash
git add prisma/ lib/prisma.ts .gitignore
git commit -m "feat: add Prisma schema with Room, Participant, Session models"
```

---

## Task 3: API — POST /api/rooms (создать комнату)

**Files:**
- Create: `app/api/rooms/route.ts`

**Step 1: Create the route file**

```typescript
// app/api/rooms/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Название комнаты обязательно' }, { status: 400 })
    }

    let code: string
    let attempts = 0
    do {
      code = generateCode()
      attempts++
      if (attempts > 10) throw new Error('Cannot generate unique code')
    } while (await prisma.room.findUnique({ where: { code } }))

    const room = await prisma.room.create({
      data: { name: name.trim(), code }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**Step 2: Test with curl**

```bash
curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Офис А"}' | jq .
```

Expected:
```json
{ "id": "...", "name": "Офис А", "code": "ABC123", "createdAt": "..." }
```

**Step 3: Test validation**

```bash
curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

Expected: `{ "error": "Название комнаты обязательно" }` with status 400.

**Step 4: Commit**

```bash
git add app/api/rooms/route.ts
git commit -m "feat: POST /api/rooms — create room with invite code"
```

---

## Task 4: API — POST /api/rooms/[code]/join (войти в комнату)

**Files:**
- Create: `app/api/rooms/[code]/join/route.ts`

**Step 1: Create the route**

```typescript
// app/api/rooms/[code]/join/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 })
    }

    const room = await prisma.room.findUnique({
      where: { code: params.code.toUpperCase() }
    })
    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    const participant = await prisma.participant.create({
      data: { name: name.trim(), roomId: room.id }
    })

    return NextResponse.json({ ...participant, roomName: room.name }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**Step 2: Test — join existing room**

First get the code from Task 3, then:

```bash
curl -s -X POST http://localhost:3000/api/rooms/ABC123/join \
  -H "Content-Type: application/json" \
  -d '{"name": "Санан"}' | jq .
```

Expected: `{ "id": "...", "name": "Санан", "roomId": "...", "roomName": "Офис А", ... }`

**Step 3: Test — wrong code**

```bash
curl -s -X POST http://localhost:3000/api/rooms/XXXXXX/join \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}' | jq .
```

Expected: `{ "error": "Комната не найдена" }` with status 404.

**Step 4: Commit**

```bash
git add app/api/rooms/
git commit -m "feat: POST /api/rooms/[code]/join — join room by invite code"
```

---

## Task 5: API — GET /api/rooms/[code] (лидерборд + статистика)

**Files:**
- Create: `app/api/rooms/[code]/route.ts`

**Step 1: Create the route**

```typescript
// app/api/rooms/[code]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { code: params.code.toUpperCase() },
      include: {
        participants: {
          include: { sessions: true }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]

    const leaderboard = room.participants
      .map(p => ({
        id: p.id,
        name: p.name,
        totalPushups: p.sessions.reduce((s, x) => s + x.count, 0),
        sessionsCount: p.sessions.length,
        bestSession: p.sessions.length > 0 ? Math.max(...p.sessions.map(s => s.count)) : 0,
        activeToday: p.sessions.some(s => s.date === today),
      }))
      .sort((a, b) => b.totalPushups - a.totalPushups)

    const allSessions = room.participants.flatMap(p => p.sessions)
    const stats = {
      totalPushups: allSessions.reduce((s, x) => s + x.count, 0),
      participantsCount: room.participants.length,
      sessionsCount: allSessions.length,
      activeToday: leaderboard.filter(p => p.activeToday).length,
    }

    return NextResponse.json({
      id: room.id,
      name: room.name,
      code: room.code,
      leaderboard,
      stats,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**Step 2: Test**

```bash
curl -s http://localhost:3000/api/rooms/ABC123 | jq .
```

Expected:
```json
{
  "id": "...",
  "name": "Офис А",
  "code": "ABC123",
  "leaderboard": [{ "id": "...", "name": "Санан", "totalPushups": 0, ... }],
  "stats": { "totalPushups": 0, "participantsCount": 1, "sessionsCount": 0, "activeToday": 0 }
}
```

**Step 3: Commit**

```bash
git add app/api/rooms/[code]/route.ts
git commit -m "feat: GET /api/rooms/[code] — leaderboard and room stats"
```

---

## Task 6: API — POST /api/sessions (записать сессию)

**Files:**
- Create: `app/api/sessions/route.ts`

**Step 1: Create the route**

```typescript
// app/api/sessions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { participantId, count, duration } = await request.json()

    if (!participantId || !count || count <= 0) {
      return NextResponse.json(
        { error: 'participantId и count обязательны' },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    })
    if (!participant) {
      return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    }

    const date = new Date().toISOString().split('T')[0]
    const session = await prisma.session.create({
      data: { participantId, count, duration: duration ?? 0, date }
    })

    return NextResponse.json(session, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**Step 2: Test**

Use the `participantId` from Task 4:

```bash
curl -s -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"participantId": "PARTICIPANT_ID", "count": 25, "duration": 45.5}' | jq .
```

Expected: `{ "id": "...", "participantId": "...", "count": 25, "duration": 45.5, "date": "2026-03-05" }`

**Step 3: Verify leaderboard updates**

```bash
curl -s http://localhost:3000/api/rooms/ABC123 | jq '.leaderboard'
```

Expected: Санан shows `"totalPushups": 25`.

**Step 4: Commit**

```bash
git add app/api/sessions/route.ts
git commit -m "feat: POST /api/sessions — record pushup session"
```

---

## Task 7: Landing page UI (`/`)

**Files:**
- Modify: `app/page.tsx`
- Create: `app/globals.css` (update dark theme vars)

**Step 1: Update globals.css with dark theme**

Add to `app/globals.css` (keep existing Tailwind directives, add below):

```css
:root {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface2: #222;
  --border: #2a2a2a;
  --text: #f0f0f0;
  --muted: #666;
  --accent: #ff6b35;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

**Step 2: Replace app/page.tsx**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already in a room, offer to go back
  useEffect(() => {
    const saved = localStorage.getItem('pushup_identity')
    if (saved) {
      const { roomCode } = JSON.parse(saved)
      if (roomCode) router.prefetch(`/room/${roomCode}`)
    }
  }, [router])

  async function handleCreate() {
    if (!roomName.trim()) return setError('Введите название комнаты')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Creator needs to join too
      router.push(`/room/${data.code}?created=1&name=${encodeURIComponent(roomName)}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return setError('Введите код комнаты')
    if (!joinName.trim()) return setError('Введите ваше имя')
    setLoading(true)
    setError('')
    try {
      const code = joinCode.trim().toUpperCase()
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: joinName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('pushup_identity', JSON.stringify({
        roomCode: code,
        participantId: data.id,
        name: data.name,
      }))
      router.push(`/room/${code}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>PushUp Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Соревнуйся с командой</p>
        </div>

        {mode === 'menu' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 rounded-xl font-semibold text-black"
              style={{ background: 'var(--accent)' }}
            >
              Создать комнату
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 rounded-xl font-semibold border"
              style={{ background: 'transparent', color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              Войти в комнату
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Название комнаты
            </label>
            <input
              type="text"
              placeholder="Команда Альфа"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Создаём...' : 'Создать'}
            </button>
            <button
              onClick={() => { setMode('menu'); setError('') }}
              className="text-sm text-center"
              style={{ color: 'var(--muted)' }}
            >
              ← Назад
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Код комнаты
            </label>
            <input
              type="text"
              placeholder="ABC123"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none tracking-widest font-mono"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              autoFocus
            />
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Ваше имя
            </label>
            <input
              type="text"
              placeholder="Санан"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
            <button
              onClick={() => { setMode('menu'); setError('') }}
              className="text-sm text-center"
              style={{ color: 'var(--muted)' }}
            >
              ← Назад
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
```

**Step 3: Manual test**

Open http://localhost:3000 — verify:
- Landing shows two buttons
- "Создать комнату" shows input, clicking "Создать" calls API and navigates
- "Войти в комнату" shows two inputs, clicking "Войти" calls join API and navigates

**Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: landing page with create/join room flows"
```

---

## Task 8: Room page — лидерборд + статистика комнаты

**Files:**
- Create: `app/room/[code]/page.tsx`

**Step 1: Handle creator flow (join on first load)**

The creator lands at `/room/ABC123?created=1&name=TeamName`. They need to call `/join` too to get their `participantId`.

**Step 2: Create room page**

```typescript
// app/room/[code]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const CameraWorkout = dynamic(() => import('@/components/CameraWorkout'), { ssr: false })

interface Participant {
  id: string
  name: string
  totalPushups: number
  sessionsCount: number
  bestSession: number
  activeToday: boolean
}

interface RoomStats {
  totalPushups: number
  participantsCount: number
  sessionsCount: number
  activeToday: number
}

interface RoomData {
  name: string
  code: string
  leaderboard: Participant[]
  stats: RoomStats
}

interface Identity {
  roomCode: string
  participantId: string
  name: string
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [identity, setIdentity] = useState<Identity | null>(null)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'leaderboard' | 'workout'>('leaderboard')
  const [copied, setCopied] = useState(false)

  // Setup identity (join if needed)
  useEffect(() => {
    async function init() {
      const saved = localStorage.getItem('pushup_identity')
      if (saved) {
        const parsed: Identity = JSON.parse(saved)
        if (parsed.roomCode === code) {
          setIdentity(parsed)
          return
        }
      }

      // Creator flow: ?created=1&name=...
      const isCreator = searchParams.get('created') === '1'
      const nameParam = searchParams.get('name') || ''

      if (isCreator && nameParam) {
        const joinName = prompt(`Ваше имя в комнате:`) || nameParam
        const res = await fetch(`/api/rooms/${code}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: joinName }),
        })
        if (res.ok) {
          const data = await res.json()
          const id: Identity = { roomCode: code, participantId: data.id, name: data.name }
          localStorage.setItem('pushup_identity', JSON.stringify(id))
          setIdentity(id)
        } else {
          router.push('/')
        }
      } else {
        // No identity for this room — send back to landing
        router.push('/')
      }
    }
    init()
  }, [code, searchParams, router])

  const loadRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`)
      if (!res.ok) throw new Error('Комната не найдена')
      const data = await res.json()
      setRoom(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (identity) loadRoom()
  }, [identity, loadRoom])

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function leaveRoom() {
    localStorage.removeItem('pushup_identity')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{ color: 'var(--muted)' }}>Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="font-bold text-base">{room?.name}</h1>
          <button onClick={copyCode} className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {copied ? '✓ Скопировано' : `Код: ${code}`}
          </button>
        </div>
        <button onClick={leaveRoom} className="text-xs px-3 py-1.5 rounded-lg border" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
          Выйти
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['leaderboard', 'workout'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--muted)',
            }}
          >
            {t === 'leaderboard' ? '🏆 Лидерборд' : '💪 Тренировка'}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 max-w-2xl w-full mx-auto">
        {tab === 'leaderboard' && room && (
          <>
            {/* Room stats */}
            <div className="rounded-xl p-4 mb-4 flex gap-4 flex-wrap text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span>Всего: <strong>{room.stats.totalPushups.toLocaleString()}</strong> отжиманий</span>
              <span style={{ color: 'var(--muted)' }}>·</span>
              <span style={{ color: 'var(--muted)' }}>Участников: {room.stats.participantsCount}</span>
              <span style={{ color: 'var(--muted)' }}>·</span>
              <span style={{ color: 'var(--muted)' }}>Сессий: {room.stats.sessionsCount}</span>
              <span style={{ color: 'var(--muted)' }}>·</span>
              <span style={{ color: 'var(--muted)' }}>Активны сегодня: {room.stats.activeToday}</span>
            </div>

            {/* Leaderboard */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {room.leaderboard.length === 0 ? (
                <div className="p-8 text-center" style={{ color: 'var(--muted)' }}>
                  Пока никого нет. Начните тренировку!
                </div>
              ) : (
                room.leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
                    style={{
                      borderColor: 'var(--border)',
                      background: p.id === identity?.participantId ? 'rgba(255,107,53,0.08)' : undefined,
                    }}
                  >
                    <span className="w-6 text-center font-bold" style={{ color: i < 3 ? ['#f59e0b','#94a3b8','#b45309'][i] : 'var(--muted)' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {p.name}
                        {p.id === identity?.participantId && <span className="ml-2 text-xs" style={{ color: 'var(--accent)' }}>вы</span>}
                        {p.activeToday && <span className="ml-2 text-xs" style={{ color: '#22c55e' }}>●</span>}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {p.sessionsCount} сессий · лучшая: {p.bestSession}
                      </div>
                    </div>
                    <span className="font-bold tabular-nums">{p.totalPushups}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={loadRoom}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Обновить
            </button>
          </>
        )}

        {tab === 'workout' && identity && (
          <CameraWorkout
            participantId={identity.participantId}
            onSessionSaved={loadRoom}
          />
        )}
      </main>
    </div>
  )
}
```

**Step 3: Manual test**

- Navigate to `/room/ABC123` with valid localStorage identity → leaderboard visible
- "Обновить" button calls loadRoom
- "Код: ABC123" click copies to clipboard
- "Выйти" clears localStorage and goes to `/`

**Step 4: Commit**

```bash
git add app/room/
git commit -m "feat: room page with leaderboard and stats"
```

---

## Task 9: Camera component (MediaPipe)

**Files:**
- Create: `components/CameraWorkout.tsx`

This component ports the MediaPipe logic from `public/index.html`. It loads `@mediapipe/tasks-vision` from CDN at runtime (browser only), then runs pose detection to count push-ups.

**Step 1: Create the component**

```typescript
// components/CameraWorkout.tsx
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  participantId: string
  onSessionSaved: () => void
}

// Types for MediaPipe tasks-vision (loaded from CDN)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = any

export default function CameraWorkout({ participantId, onSessionSaved }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const landmarkerRef = useRef<AnyObject>(null)
  const drawingRef = useRef<AnyObject>(null)
  const lastVideoTimeRef = useRef(-1)
  const posePhaseRef = useRef<'up' | 'down'>('up')
  const sessionStartRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [mpLoaded, setMpLoaded] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState<{ text: string; color: string }>({ text: 'Камера выкл.', color: '#666' })
  const [saving, setSaving] = useState(false)

  // Load MediaPipe from CDN (browser only)
  const loadMP = useCallback(async () => {
    if (landmarkerRef.current) return
    try {
      const vision: AnyObject = await import(
        /* @ts-expect-error CDN url */
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/vision_bundle.mjs'
      )
      const { PoseLandmarker, FilesetResolver, DrawingUtils } = vision

      const resolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
      )
      landmarkerRef.current = await PoseLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
      if (canvasRef.current) {
        drawingRef.current = new DrawingUtils(canvasRef.current.getContext('2d'))
      }
      setMpLoaded(true)
    } catch (e) {
      console.warn('MediaPipe load failed:', e)
      setStatus({ text: 'Ошибка загрузки MediaPipe', color: '#ef4444' })
    }
  }, [])

  // Angle between 3 landmarks
  function angleBetween(a: AnyObject, b: AnyObject, c: AnyObject): number {
    const ab = { x: b.x - a.x, y: b.y - a.y }
    const cb = { x: b.x - c.x, y: b.y - c.y }
    const dot = ab.x * cb.x + ab.y * cb.y
    const cross = ab.x * cb.y - ab.y * cb.x
    return Math.abs((Math.atan2(cross, dot) * 180) / Math.PI)
  }

  const processResult = useCallback((result: AnyObject) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!result.landmarks?.length) {
      setStatus({ text: 'Поза не найдена', color: '#f59e0b' })
      return
    }

    const lm = result.landmarks[0]
    if (drawingRef.current && result.worldLandmarks?.length) {
      const { PoseLandmarker } = window as AnyObject
      if (PoseLandmarker?.POSE_CONNECTIONS) {
        drawingRef.current.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS)
      }
      drawingRef.current.drawLandmarks(lm)
    }

    // Left elbow angle: shoulder(11) - elbow(13) - wrist(15)
    const angle = angleBetween(lm[11], lm[13], lm[15])

    setStatus({ text: `Угол локтя: ${Math.round(angle)}°`, color: '#22c55e' })

    if (angle < 90 && posePhaseRef.current === 'up') {
      posePhaseRef.current = 'down'
    } else if (angle > 150 && posePhaseRef.current === 'down') {
      posePhaseRef.current = 'up'
      countRef.current += 1
      setCount(countRef.current)
    }
  }, [])

  const runFrame = useCallback((ts: number) => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current
    if (!video || !landmarker || !cameraOn) return

    const canvas = canvasRef.current
    if (canvas && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime
      const result = landmarker.detectForVideo(video, ts)
      processResult(result)
    }

    rafRef.current = requestAnimationFrame(runFrame)
  }, [cameraOn, processResult])

  useEffect(() => {
    if (cameraOn && mpLoaded) {
      rafRef.current = requestAnimationFrame(runFrame)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cameraOn, mpLoaded, runFrame])

  async function startCamera() {
    try {
      setStatus({ text: 'Инициализация...', color: '#f59e0b' })
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
      setCameraOn(true)
      setStatus({ text: 'Поза не найдена', color: '#f59e0b' })
      await loadMP()
    } catch {
      setStatus({ text: 'Нет доступа к камере', color: '#ef4444' })
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    setStatus({ text: 'Камера выкл.', color: '#666' })
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }

  function startSession() {
    countRef.current = 0
    setCount(0)
    setElapsed(0)
    sessionStartRef.current = Date.now()
    setSessionActive(true)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000))
    }, 1000)
  }

  async function finishSession() {
    if (timerRef.current) clearInterval(timerRef.current)
    setSessionActive(false)
    const finalCount = countRef.current
    const duration = Math.floor((Date.now() - (sessionStartRef.current ?? Date.now())) / 1000)

    if (finalCount === 0) return

    setSaving(true)
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, count: finalCount, duration }),
      })
      onSessionSaved()
    } finally {
      setSaving(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => () => {
    stopCamera()
    if (timerRef.current) clearInterval(timerRef.current)
  }, []) // eslint-disable-line

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col gap-4">
      {/* Camera */}
      <div className="relative rounded-xl overflow-hidden border-2" style={{ background: '#000', aspectRatio: '4/3', borderColor: cameraOn ? status.color : '#2a2a2a' }}>
        <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: '#fff' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: status.color }} />
          {status.text}
        </div>

        {/* Counter */}
        {cameraOn && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="font-black text-white" style={{ fontSize: 80, lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
              {count}
            </div>
            {sessionActive && (
              <div className="text-white/80 text-lg">{fmt(elapsed)}</div>
            )}
          </div>
        )}

        {/* Camera toggle */}
        <button
          onClick={cameraOn ? stopCamera : startCamera}
          className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: '#fff', border: 'none' }}
        >
          {cameraOn ? '📷 Выкл.' : '📷 Вкл.'}
        </button>

        {/* No camera placeholder */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: '#666' }}>
            <span className="text-4xl">📷</span>
            <span className="text-sm">Включите камеру</span>
          </div>
        )}
      </div>

      {/* Session controls */}
      {cameraOn && (
        <>
          {!sessionActive ? (
            <button
              onClick={startSession}
              className="w-full py-3 rounded-xl font-semibold text-black"
              style={{ background: '#22c55e' }}
            >
              Начать сессию
            </button>
          ) : (
            <button
              onClick={finishSession}
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40"
              style={{ background: '#ef4444' }}
            >
              {saving ? 'Сохраняем...' : `Завершить (${count} отжиманий)`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
```

**Step 2: Manual test**

1. Open room page → switch to "Тренировка" tab
2. Click "Вкл. камеру" — grant camera permission
3. After MediaPipe loads, status badge shows angle
4. Do push-ups → counter increments
5. "Начать сессию" → "Завершить" → result saved → leaderboard updates

**Step 3: Commit**

```bash
git add components/CameraWorkout.tsx
git commit -m "feat: CameraWorkout component with MediaPipe pose detection"
```

---

## Task 10: Update Dockerfile for Next.js

**Files:**
- Modify: `Dockerfile`
- Modify: `railway.toml`

**Step 1: Rewrite Dockerfile**

```dockerfile
FROM node:20-slim

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

ENV DATABASE_URL=file:/data/pushups.db
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

**Step 2: Update railway.toml**

```toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "sh -c 'npx prisma migrate deploy && npm start'"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 5

[[mounts]]
mountPath = "/data"
```

**Step 3: Commit**

```bash
git add Dockerfile railway.toml
git commit -m "chore: update Dockerfile and railway.toml for Next.js"
```

---

## Task 11: Final cleanup

**Files:**
- Delete: `server/` folder (already deleted), old `public/` HTML files (already deleted)
- Verify: `.gitignore` has `*.db`, `node_modules/`, `.env`

**Step 1: Check nothing unwanted is tracked**

```bash
git status
```

No stray files should be staged.

**Step 2: Smoke test full flow locally**

```bash
npm run build && npm start
```

Then manually:
1. Open http://localhost:3000
2. Create a room → get redirected with invite code
3. Open incognito → join room with code + name
4. Both see leaderboard
5. Use camera → save session → leaderboard updates

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete rooms feature — Next.js + Prisma migration done"
```

---

## Deployment Verification (Railway)

After pushing to `main`:

1. Railway picks up `Dockerfile` automatically (builder = "dockerfile")
2. Check Railway build logs for `prisma generate` and `next build` success
3. Check deploy logs for `prisma migrate deploy` success
4. Open production URL → verify landing page loads
5. Create a room, join from another browser, save a session
6. Verify Railway Volume at `/data` persists `pushups.db` between redeploys

---

## Future: Migrate to PostgreSQL

```bash
# 1. Update prisma/schema.prisma
#    provider = "postgresql"

# 2. Update DATABASE_URL in Railway env vars
#    DATABASE_URL=postgresql://user:pass@host:5432/db

# 3. Run migration
npx prisma migrate deploy

# No other code changes needed
```
