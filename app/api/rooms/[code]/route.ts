import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
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
      leaderboard,
      stats,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
