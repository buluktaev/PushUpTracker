import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { participantIds } = await request.json()
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ claimed: 0 })
    }

    const result = await prisma.participant.updateMany({
      where: {
        id: { in: participantIds },
        userId: null, // только незаявленные
      },
      data: { userId: user.id },
    })

    return NextResponse.json({ claimed: result.count })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
