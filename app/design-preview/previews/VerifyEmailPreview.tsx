'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface VerifyEmailPreviewProps {
  email?: string
  isBlocked?: boolean
  secondsLeft?: number
  attemptsLeft?: number
  message?: string
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function VerifyEmailPreview({
  email = '',
  isBlocked = false,
  secondsLeft = 0,
  attemptsLeft = 3,
  message = '',
}: VerifyEmailPreviewProps) {
  return (
    <main className="relative min-h-[600px] flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="absolute top-3 right-4">
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
              <span className="text-[var(--accent-default)]">{formatTime(secondsLeft)}</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={attemptsLeft === 0}
              className="w-full py-3 text-sm font-normal text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity"
            >
              resend()
            </button>

            {attemptsLeft > 0 && (
              <p className="text-[10px] text-[var(--muted)] text-center">
                осталось попыток:{' '}
                <span className="text-[var(--text)]">{attemptsLeft}</span>
              </p>
            )}

            {message && (
              <p className="text-[11px] text-[#4ade80]">{message}</p>
            )}
          </div>
        )}

        <p className="text-xs text-[var(--muted)] mt-8">
          <Link href="/login" className="text-[var(--accent-default)] hover:underline">
            ← вернуться к login()
          </Link>
        </p>
      </div>
    </main>
  )
}
