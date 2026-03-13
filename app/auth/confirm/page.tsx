'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useRooms } from '@/hooks/useRooms'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rooms } = useRooms()
  const [error, setError] = useState('')

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!token_hash || type !== 'email') {
      setError('неверная ссылка подтверждения')
      return
    }

    async function confirm() {
      try {
        const supabase = createClient()

        const { data, error: otpError } = await supabase.auth.verifyOtp({
          token_hash: token_hash!,
          type: 'email',
        })
        if (otpError) throw new Error(otpError.message)
        if (!data.user) throw new Error('Ошибка подтверждения')

        // Создать Profile (имя из user_metadata)
        const name = data.user.user_metadata?.name || data.user.email
        const profileRes = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        // Если профиль уже существует — игнорируем ошибку
        if (!profileRes.ok) {
          const d = await profileRes.json()
          if (!d.error?.includes('Unique')) throw new Error(d.error)
        }

        // Привязать существующие participantIds из localStorage
        const participantIds = rooms.map(r => r.participantId).filter(Boolean)
        if (participantIds.length > 0) {
          await fetch('/api/auth/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantIds }),
          })
        }

        router.push('/')
        router.refresh()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'ошибка подтверждения')
      }
    }

    confirm()
  }, [searchParams, rooms, router])

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icon.svg" width={20} height={20} alt="" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              // pushup tracker
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-[1.15] tracking-tight">
            {error ? 'error()' : 'confirming()'}
          </h1>
          <p className="text-xs text-[var(--muted)] mt-2.5">
            {error ? error : '// подтверждаем аккаунт...'}
          </p>
        </div>

        {!error && (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {error && (
          <a href="/register" className="text-xs text-[#ff6b35] hover:underline">
            ← вернуться к регистрации
          </a>
        )}
      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  )
}
