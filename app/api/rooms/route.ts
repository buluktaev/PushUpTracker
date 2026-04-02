import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { isValidDiscipline } from '@/lib/exerciseConfigs'
import { ROOM_CODE_LENGTH } from '@/lib/roomCode'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: ROOM_CODE_LENGTH }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

function isMissingColumnError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2022'
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

    let rooms: Array<{
      roomCode: string
      roomName: string
      participantId: string
      name: string
      isOwner: boolean
      discipline: string
    }> = []

    try {
      const participants = await prisma.participant.findMany({
        where: { userId: user.id },
        include: { room: true },
        orderBy: { createdAt: 'asc' },
      })

      rooms = participants.map(participant => ({
        roomCode: participant.room.code,
        roomName: participant.room.name,
        participantId: participant.id,
        name: participant.name,
        isOwner: participant.room.ownerId === user.id,
        discipline: participant.room.discipline,
      }))
    } catch (err) {
      if (!isMissingColumnError(err)) throw err
      rooms = []
    }

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

    const { name, discipline } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Название комнаты обязательно' }, { status: 400 })
    }
    if (name.trim().length > 64) {
      return NextResponse.json({ error: 'Название комнаты не более 64 символов' }, { status: 400 })
    }
    if (!discipline || !isValidDiscipline(discipline)) {
      return NextResponse.json({ error: 'Невалидная дисциплина' }, { status: 400 })
    }

    let code: string
    let attempts = 0
    do {
      code = generateCode()
      attempts++
      if (attempts > 10) throw new Error('Cannot generate unique code')
    } while (
      await prisma.room.findUnique({
        where: { code },
        select: { id: true },
      })
    )

    let room
    try {
      room = await prisma.room.create({
        data: { name: name.trim(), code, ownerId: user.id, discipline },
      })
    } catch (err) {
      if (!isMissingColumnError(err)) throw err
      room = await prisma.room.create({
        data: { name: name.trim(), code },
      })
    }

    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
