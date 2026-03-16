import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { ensureProfile } from '@/lib/profile'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    if (typeof body?.name === 'string' && body.name.trim().length > 0) {
      user.user_metadata = { ...user.user_metadata, name: body.name.trim() }
    }

    const profile = await ensureProfile(user)

    return NextResponse.json(profile, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await ensureProfile(user)

    return NextResponse.json(profile)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
