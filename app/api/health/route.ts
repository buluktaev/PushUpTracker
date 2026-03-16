import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    return NextResponse.json({ ok: true, database: 'up' })
  } catch (error) {
    console.error('Health check failed', error)
    return NextResponse.json({ ok: false, database: 'down' }, { status: 503 })
  }
}
