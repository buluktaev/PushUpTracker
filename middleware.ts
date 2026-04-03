import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { areReviewRoutesEnabled } from '@/lib/review-routes'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isReviewRoute =
    pathname.startsWith('/components') || pathname === '/screens' || pathname === '/design-preview'

  if (isReviewRoute && !areReviewRoutesEnabled()) {
    return new NextResponse(null, { status: 404 })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected =
    pathname.startsWith('/room/') || pathname.startsWith('/profile')
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isLanding = pathname === '/'

  if ((isProtected || isLanding) && !user) {
    const url = request.nextUrl.clone()
    const next = request.nextUrl.pathname + request.nextUrl.search
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/room/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/components/:path*',
    '/screens',
    '/design-preview',
  ],
}
