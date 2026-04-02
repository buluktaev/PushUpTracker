import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { verifyPassword } from '@/lib/verify-password'

interface LeaderboardParticipant {
  id: string
  name: string
  totalValue: number
  sessionsCount: number
  bestSession: number
  streakDays: number
  activeToday: boolean
}

function calculateStreakDays(sessionDates: string[], today: string): number {
  const uniqueDates = Array.from(new Set(sessionDates.filter(Boolean))).sort()
  if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1] !== today) {
    return 0
  }

  let streak = 1
  for (let index = uniqueDates.length - 1; index > 0; index -= 1) {
    const current = new Date(`${uniqueDates[index]}T00:00:00Z`)
    const previous = new Date(`${uniqueDates[index - 1]}T00:00:00Z`)
    const diffDays = Math.round((current.getTime() - previous.getTime()) / 86400000)

    if (diffDays !== 1) {
      break
    }

    streak += 1
  }

  return streak
}

function isMissingColumnError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2022'
}

function augmentLeaderboardForDev(code: string, leaderboard: LeaderboardParticipant[]) {
  if (process.env.NODE_ENV === 'production' || code !== 'FR2LAG') {
    return leaderboard
  }

  const syntheticParticipants: LeaderboardParticipant[] = [
    { id: 'dev-p01', name: 'Мария', totalValue: 486, sessionsCount: 14, bestSession: 58, streakDays: 6, activeToday: true },
    { id: 'dev-p02', name: 'Дмитрий', totalValue: 472, sessionsCount: 13, bestSession: 54, streakDays: 5, activeToday: true },
    { id: 'dev-p03', name: 'Елена', totalValue: 459, sessionsCount: 12, bestSession: 50, streakDays: 0, activeToday: false },
    { id: 'dev-p04', name: 'Иван', totalValue: 444, sessionsCount: 11, bestSession: 49, streakDays: 0, activeToday: false },
    { id: 'dev-p05', name: 'София', totalValue: 431, sessionsCount: 11, bestSession: 47, streakDays: 4, activeToday: true },
    { id: 'dev-p06', name: 'Никита', totalValue: 418, sessionsCount: 10, bestSession: 45, streakDays: 0, activeToday: false },
    { id: 'dev-p07', name: 'Анна', totalValue: 402, sessionsCount: 10, bestSession: 44, streakDays: 0, activeToday: false },
    { id: 'dev-p08', name: 'Максим', totalValue: 389, sessionsCount: 9, bestSession: 43, streakDays: 3, activeToday: true },
    { id: 'dev-p09', name: 'Ольга', totalValue: 374, sessionsCount: 9, bestSession: 41, streakDays: 0, activeToday: false },
    { id: 'dev-p10', name: 'Павел', totalValue: 361, sessionsCount: 8, bestSession: 39, streakDays: 0, activeToday: false },
    { id: 'dev-p11', name: 'Тимур', totalValue: 348, sessionsCount: 8, bestSession: 37, streakDays: 2, activeToday: true },
    { id: 'dev-p12', name: 'Ксения', totalValue: 336, sessionsCount: 7, bestSession: 36, streakDays: 0, activeToday: false },
    { id: 'dev-p13', name: 'Артём', totalValue: 324, sessionsCount: 7, bestSession: 35, streakDays: 0, activeToday: false },
    { id: 'dev-p14', name: 'Полина', totalValue: 312, sessionsCount: 7, bestSession: 34, streakDays: 1, activeToday: true },
    { id: 'dev-p15', name: 'Роман', totalValue: 301, sessionsCount: 6, bestSession: 33, streakDays: 0, activeToday: false },
    { id: 'dev-p16', name: 'Виктория', totalValue: 289, sessionsCount: 6, bestSession: 32, streakDays: 0, activeToday: false },
    { id: 'dev-p17', name: 'Глеб', totalValue: 277, sessionsCount: 6, bestSession: 31, streakDays: 2, activeToday: true },
    { id: 'dev-p18', name: 'Алиса', totalValue: 266, sessionsCount: 5, bestSession: 30, streakDays: 0, activeToday: false },
    { id: 'dev-p19', name: 'Егор', totalValue: 254, sessionsCount: 5, bestSession: 29, streakDays: 0, activeToday: false },
    { id: 'dev-p20', name: 'Дарья', totalValue: 243, sessionsCount: 5, bestSession: 28, streakDays: 1, activeToday: true },
    { id: 'dev-p21', name: 'Михаил', totalValue: 231, sessionsCount: 4, bestSession: 27, streakDays: 0, activeToday: false },
    { id: 'dev-p22', name: 'Лилия', totalValue: 220, sessionsCount: 4, bestSession: 26, streakDays: 0, activeToday: false },
  ]

  const existingIds = new Set(leaderboard.map(participant => participant.id))
  return [...leaderboard, ...syntheticParticipants.filter(participant => !existingIds.has(participant.id))]
    .sort((a, b) => b.totalValue - a.totalValue)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let room:
      | {
          id: string
          name: string
          code: string
          discipline: string
          ownerId: string | null
          participants: Array<{
            id: string
            name: string
            sessions: Array<{ value: number; date: string }>
          }>
        }
      | null = null

    try {
      room = await prisma.room.findUnique({
        where: { code: code.toUpperCase() },
        select: {
          id: true,
          name: true,
          code: true,
          discipline: true,
          ownerId: true,
          participants: {
            select: {
              id: true,
              name: true,
              sessions: {
                select: {
                  value: true,
                  date: true,
                },
              },
            },
          },
        },
      })
    } catch (err) {
      if (!isMissingColumnError(err)) throw err
      const legacyRoom = await prisma.room.findUnique({
        where: { code: code.toUpperCase() },
        select: {
          id: true,
          name: true,
          code: true,
          participants: {
            select: {
              id: true,
              name: true,
              sessions: {
                select: {
                  value: true,
                  date: true,
                },
              },
            },
          },
        },
      })
      room = legacyRoom
        ? {
            ...legacyRoom,
            discipline: 'pushups',
            ownerId: null,
          }
        : null
    }

    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]

    const leaderboard = augmentLeaderboardForDev(
      room.code,
      room.participants
      .map(p => ({
        id: p.id,
        name: p.name,
        totalValue: p.sessions.reduce((s, x) => s + x.value, 0),
        sessionsCount: p.sessions.length,
        bestSession: p.sessions.length > 0 ? Math.max(...p.sessions.map(s => s.value)) : 0,
        streakDays: calculateStreakDays(p.sessions.map(s => s.date), today),
        activeToday: p.sessions.some(s => s.date === today),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
    )

    const stats = {
      totalValue: leaderboard.reduce((sum, participant) => sum + participant.totalValue, 0),
      participantsCount: leaderboard.length,
      sessionsCount: leaderboard.reduce((sum, participant) => sum + participant.sessionsCount, 0),
      activeToday: leaderboard.filter(p => p.activeToday).length,
    }

    return NextResponse.json({
      id: room.id,
      name: room.name,
      code: room.code,
      discipline: room.discipline,
      isOwner: room.ownerId === user?.id,
      leaderboard,
      stats,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

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

    const { name } = await request.json()
    if (name !== undefined) {
      if (!name?.trim()) return NextResponse.json({ error: 'Название обязательно' }, { status: 400 })
      if (name.trim().length > 64) return NextResponse.json({ error: 'Не более 64 символов' }, { status: 400 })
      const updated = await prisma.room.update({ where: { id: room.id }, data: { name: name.trim() } })
      return NextResponse.json({ name: updated.name })
    }

    return NextResponse.json({ error: 'Нечего обновлять' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    if (room.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { roomName, password } = await request.json()
    if (typeof roomName !== 'string' || roomName !== room.name) {
      return NextResponse.json({ error: 'Название комнаты не совпадает' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Пароль обязателен' }, { status: 400 })
    }
    if (!user.email) {
      return NextResponse.json({ error: 'Email не найден' }, { status: 400 })
    }

    const passwordValid = await verifyPassword(user.email, password)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 400 })
    }

    await prisma.room.delete({
      where: { id: room.id },
    })

    return NextResponse.json({ ok: true, deleted: room.code })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
