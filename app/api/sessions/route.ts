import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { participantId, value, duration } = await request.json()

    if (!participantId || !value || value <= 0) {
      return NextResponse.json(
        { error: 'participantId и value обязательны' },
        { status: 400 }
      )
    }
    if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
      return NextResponse.json({ error: 'duration должен быть неотрицательным числом' }, { status: 400 })
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    })
    if (!participant) {
      return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    }

    const date = new Date().toISOString().split('T')[0]
    const session = await prisma.session.create({
      data: { participantId, value, duration: duration ?? 0, date }
    })

    return NextResponse.json(session, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
