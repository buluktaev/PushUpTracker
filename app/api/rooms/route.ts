import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const participants = await prisma.participant.findMany({
      where: { userId: user.id },
      include: { room: true },
      orderBy: { createdAt: 'asc' },
    })

    const rooms = participants.map(participant => ({
      roomCode: participant.room.code,
      roomName: participant.room.name,
      participantId: participant.id,
      name: participant.name,
    }))

    return NextResponse.json({ rooms })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Название комнаты обязательно' }, { status: 400 })
    }
    if (name.trim().length > 64) {
      return NextResponse.json({ error: 'Название комнаты не более 64 символов' }, { status: 400 })
    }

    let code: string
    let attempts = 0
    do {
      code = generateCode()
      attempts++
      if (attempts > 10) throw new Error('Cannot generate unique code')
    } while (await prisma.room.findUnique({ where: { code } }))

    const room = await prisma.room.create({
      data: { name: name.trim(), code, ownerId: user.id },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
