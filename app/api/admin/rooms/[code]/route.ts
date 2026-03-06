import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SECRET = 'e88c8c1bacebc8934b689120243a18ed'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (req.headers.get('x-admin-key') !== SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { code } = await params
  const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } })
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  await prisma.room.delete({ where: { code: code.toUpperCase() } })
  return NextResponse.json({ ok: true, deleted: code.toUpperCase() })
}
