'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

const LS_KEY = 'email_confirm_blocked_until'
const MAX_ATTEMPTS = 3

function VerifyEmailContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  const [sending, setSending] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const until = parseInt(raw, 10)
      if (until > Date.now()) {
        setBlockedUntil(until)
      } else {
        localStorage.removeItem(LS_KEY)
      }
    }
  }, [])

  useEffect(() => {
    if (!blockedUntil) return
    const tick = () => {
      const diff = Math.ceil((blockedUntil - Date.now()) / 1000)
      if (diff <= 0) {
        setBlockedUntil(null)
        setAttemptsLeft(MAX_ATTEMPTS)
        localStorage.removeItem(LS_KEY)
        setSecondsLeft(0)
      } else {
        setSecondsLeft(diff)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [blockedUntil])

  const handleResend = useCallback(async () => {
    if (blockedUntil || sending || !email) return
    setSending(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.status === 429) {
        const until = data.retryAfter as number
        setBlockedUntil(until)
        localStorage.setItem(LS_KEY, String(until))
        setAttemptsLeft(0)
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'ошибка отправки')
        return
      }

      setAttemptsLeft(data.attemptsLeft ?? 0)
      setMessage('// письмо отправлено')
    } catch {
      setError('ошибка сети')
    } finally {
      setSending(false)
    }
  }, [blockedUntil, sending, email])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const isBlocked = Boolean(blockedUntil && secondsLeft > 0)

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="fixed top-3 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icon.svg" width={20} height={20} alt="" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              {'// pushup tracker'}
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-[1.15] tracking-tight">
            verify_email()
          </h1>
          <p className="text-xs text-[var(--muted)] mt-2.5">
            проверьте почту и перейдите по ссылке
          </p>
        </div>

        <div
          className="p-4 mb-6 text-sm text-[var(--text)]"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">
            email =
          </p>
          <p className="font-mono">{email || '—'}</p>
        </div>

        {isBlocked ? (
          <div className="text-sm text-[var(--muted)]">
            <p className="text-[11px] text-[#ef4444] mb-1">
              ! лимит исчерпан — подождите перед повторной отправкой
            </p>
            <p className="text-xs font-mono">
              повтор через{' '}
              <span className="text-[#ff6b35]">{formatTime(secondsLeft)}</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={sending || attemptsLeft === 0}
              className="w-full py-3 text-sm font-normal text-white bg-[#ff6b35] disabled:opacity-40 hover:opacity-85 transition-opacity"
            >
              {sending ? '// отправляем...' : 'resend()'}
            </button>

            {attemptsLeft > 0 && !sending && (
              <p className="text-[10px] text-[var(--muted)] text-center">
                осталось попыток:{' '}
                <span className="text-[var(--text)]">{attemptsLeft}</span>
              </p>
            )}

            {message && (
              <p className="text-[11px] text-[#4ade80]">{message}</p>
            )}
            {error && (
              <p className="text-[11px] text-[#ef4444]">! {error}</p>
            )}
          </div>
        )}

        <p className="text-xs text-[var(--muted)] mt-8">
          <Link href="/login" className="text-[#ff6b35] hover:underline">
            ← вернуться к login()
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
