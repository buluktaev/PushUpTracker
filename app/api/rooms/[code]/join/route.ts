import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 })
    }
    if (name.trim().length > 64) {
      return NextResponse.json({ error: 'Имя не более 64 символов' }, { status: 400 })
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() }
    })
    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    const existing = await prisma.participant.findFirst({
      where: { roomId: room.id, name: { equals: name.trim(), mode: 'insensitive' } }
    })
    if (existing) {
      return NextResponse.json({ ...existing, roomName: room.name })
    }

    const participant = await prisma.participant.create({
      data: { name: name.trim(), roomId: room.id }
    })

    return NextResponse.json({ ...participant, roomName: room.name }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
