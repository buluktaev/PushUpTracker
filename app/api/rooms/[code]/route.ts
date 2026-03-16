import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { verifyPassword } from '@/lib/verify-password'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
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
      isOwner: room.ownerId === user?.id,
      leaderboard,
      stats,
    })
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
