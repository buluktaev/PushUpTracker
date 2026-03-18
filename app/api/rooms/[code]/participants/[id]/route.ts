import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  try {
    const { code, id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } })
    if (!room) return NextResponse.json({ error: 'Комната не найдена' }, { status: 404 })
    if (room.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const participant = await prisma.participant.findUnique({ where: { id } })
    if (!participant || participant.roomId !== room.id) {
      return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    }
    if (participant.userId === user.id) {
      return NextResponse.json({ error: 'Нельзя кикнуть владельца' }, { status: 400 })
    }

    await prisma.participant.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
