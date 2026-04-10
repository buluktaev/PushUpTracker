import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { ensureProfile, syncAuthUserName } from '@/lib/profile'

function isMissingColumnError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2022'
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await ensureProfile(user)
    await syncAuthUserName(supabase, user, profile.name)

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, name: true, code: true },
    })
    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    let existing = null
    try {
      existing = await prisma.participant.findFirst({
        where: { roomId: room.id, userId: user.id },
      })
    } catch (err) {
      if (!isMissingColumnError(err)) throw err
      existing = await prisma.participant.findFirst({
        where: { roomId: room.id, name: profile.name },
      })
    }

    if (existing) {
      return NextResponse.json({ ...existing, roomName: room.name })
    }

    let participant
    try {
      participant = await prisma.participant.create({
        data: {
          name: profile.name,
          roomId: room.id,
          userId: user.id,
        },
      })
    } catch (err) {
      if (!isMissingColumnError(err)) throw err
      participant = await prisma.participant.create({
        data: {
          name: profile.name,
          roomId: room.id,
        },
      })
    }

    return NextResponse.json({ ...participant, roomName: room.name }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
