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
