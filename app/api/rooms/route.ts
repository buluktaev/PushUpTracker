import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Название комнаты обязательно' }, { status: 400 })
    }

    let code: string
    let attempts = 0
    do {
      code = generateCode()
      attempts++
      if (attempts > 10) throw new Error('Cannot generate unique code')
    } while (await prisma.room.findUnique({ where: { code } }))

    const room = await prisma.room.create({
      data: { name: name.trim(), code }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
