import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const SECRET = 'e88c8c1bacebc8934b689120243a18ed'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await prisma.session.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.room.deleteMany()
  return NextResponse.json({ ok: true })
}
