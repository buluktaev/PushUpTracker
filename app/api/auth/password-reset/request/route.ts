import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/emailRateLimit'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizePublicOrigin(raw: string | undefined) {
  if (!raw) return null

  try {
    return new URL(raw).origin
  } catch {
    return null
  }
}

function resolvePublicOrigin(request: Request) {
  const envOrigin = normalizePublicOrigin(process.env.APP_PUBLIC_URL)
  if (envOrigin) {
    return envOrigin
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
    const host = forwardedHost.split(',')[0]?.trim()

    if (host) {
      const forwardedOrigin = normalizePublicOrigin(`${forwardedProto}://${host}`)
      if (forwardedOrigin) {
        return forwardedOrigin
      }
    }
  }

  return new URL(request.url).origin
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const email = typeof payload?.email === 'string' ? payload.email.trim() : ''

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'email обязателен' }, { status: 400 })
  }

  const limit = checkRateLimit(email, 'password-reset')
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limit',
        retryAfter: limit.retryAfter,
      },
      { status: 429 }
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: cookiesToSet => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const origin = resolvePublicOrigin(request)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
      const retryAfter = Date.now() + 15 * 60 * 1000

      return NextResponse.json(
        {
          error: 'rate_limit',
          retryAfter,
        },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: 'ошибка отправки' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    attemptsLeft: limit.attemptsLeft,
  })
}
