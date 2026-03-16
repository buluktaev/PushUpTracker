import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(
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

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!room) {
      return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    }

    if (room.ownerId === user.id) {
      return NextResponse.json({ error: 'Владелец не может покинуть комнату' }, { status: 403 })
    }

    const participant = await prisma.participant.findFirst({
      where: {
        roomId: room.id,
        userId: user.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    }

    await prisma.participant.delete({
      where: { id: participant.id },
    })

    return NextResponse.json({ ok: true, left: room.code })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
