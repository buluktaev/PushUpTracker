'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import AuthThemeSync from '@/components/AuthThemeSync'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import RevealSection from '@/components/RevealSection'
import TextButton from '@/components/TextButton'

const LS_KEY = 'email_confirm_blocked_until'
const MAX_ATTEMPTS = 3

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function VerifyEmailContent() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get('email') ?? ''

  const [sending, setSending] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return

    const until = parseInt(raw, 10)
    if (until > Date.now()) {
      setBlockedUntil(until)
    } else {
      localStorage.removeItem(LS_KEY)
    }
  }, [])

  useEffect(() => {
    if (!blockedUntil) return

    const tick = () => {
      const diff = Math.ceil((blockedUntil - Date.now()) / 1000)
      if (diff <= 0) {
        setBlockedUntil(null)
        setSecondsLeft(0)
        setAttemptsLeft(MAX_ATTEMPTS)
        localStorage.removeItem(LS_KEY)
        return
      }
      setSecondsLeft(diff)
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [blockedUntil])

  const handleResend = useCallback(async () => {
    if (!email || sending || blockedUntil) return

    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => ({}))

      if (response.status === 429 && typeof data.retryAfter === 'number') {
        setBlockedUntil(data.retryAfter)
        setAttemptsLeft(0)
        localStorage.setItem(LS_KEY, String(data.retryAfter))
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'ошибка отправки')
      }

      setAttemptsLeft(typeof data.attemptsLeft === 'number' ? data.attemptsLeft : attemptsLeft)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ошибка отправки')
    } finally {
      setSending(false)
    }
  }, [attemptsLeft, blockedUntil, email, sending])

  const isBlocked = Boolean(blockedUntil && secondsLeft > 0)
  const shellWidth = 'w-[400px] app-mobile:w-[calc(100%-32px)]'
  const formHeight = isBlocked ? 'h-[418px] app-mobile:h-[440px]' : 'h-[370px]'
  const warningWrapperHeight = 'h-[40px] app-mobile:h-[62px]'
  const buttonLabel = isBlocked
    ? `Отправить повторно через ${formatSeconds(secondsLeft)}`
    : 'Отправить повторно'
  const warningText = useMemo(
    () => 'лимит исчерпан — подождите перед повторной отправкой',
    []
  )

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--bg-surface)]">
      <AuthThemeSync />
      <div className={`mx-auto ${shellWidth} pt-[200px] app-mobile:pt-[144px]`}>
        <div className="flex flex-col">
          <div className={`flex flex-col gap-2 ${formHeight}`}>
            <RevealSection delay={0} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
                <Icon name="fitness" size={16} />
              </div>
              <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
                Selecty Wellness
              </span>
            </RevealSection>

            <RevealSection delay={100} className="flex flex-col">
              <h1 className="text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
                подтверждение
              </h1>

              <div className="h-[32px] pt-[8px]">
                <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                  проверьте почту и перейдите по ссылке
                </p>
              </div>
            </RevealSection>

            <RevealSection delay={200} className="h-[130px] pt-[16px]">
              <div className="h-[114px] border border-[var(--border-primary-default)] bg-[var(--bg-primary)] px-[16px] py-[16px]">
                <p className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
                  Электронная почта
                </p>
                <div className="pt-[8px]">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-normal leading-[24px] tracking-[0] text-[var(--text-primary)]">
                    {email || 'ivan@example.com'}
                  </p>
                </div>
                <div className="pt-[8px]">
                  <TextButton
                    variant="primary"
                    disabled={sending}
                    onClick={() => router.push('/register')}
                    className="!h-auto !w-full !justify-start !px-0 !text-[14px] !leading-[22px]"
                  >
                    изменить почту
                  </TextButton>
                </div>
              </div>
            </RevealSection>

            {isBlocked ? (
              <RevealSection delay={300} className={`${warningWrapperHeight} pt-[16px]`}>
                <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)]">
                  {warningText}
                </p>
              </RevealSection>
            ) : null}

            <RevealSection delay={400} className="h-[72px] pt-[32px]">
              <Button
                type="button"
                disabled={isBlocked}
                loading={sending}
                onClick={handleResend}
              >
                {buttonLabel}
              </Button>
            </RevealSection>

            <RevealSection delay={500} className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
              <span>уже есть аккаунт? </span>
              {sending ? (
                <span className="text-[var(--text-disabled)]" aria-disabled="true">
                  авторизоваться
                </span>
              ) : (
                <Link href="/login" className="text-[var(--accent-default)] hover:text-[var(--accent-hovered)] active:text-[var(--accent-pressed)]">
                  авторизоваться
                </Link>
              )}
            </RevealSection>

            {error ? (
              <RevealSection delay={600} className="pt-[8px]">
                <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)]">
                  {error}
                </p>
              </RevealSection>
            ) : null}
          </div>
        </div>
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
