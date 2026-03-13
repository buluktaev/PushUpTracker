import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function POST(
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

    // Получить имя из Profile
    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    })
    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    // Проверить: уже участник этой комнаты?
    const existing = await prisma.participant.findFirst({
      where: { roomId: room.id, userId: user.id },
    })
    if (existing) {
      return NextResponse.json({ ...existing, roomName: room.name })
    }

    const participant = await prisma.participant.create({
      data: {
        name: profile.name,
        roomId: room.id,
        userId: user.id,
      },
    })

    return NextResponse.json({ ...participant, roomName: room.name }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
