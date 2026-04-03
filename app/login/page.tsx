'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthThemeSync from '@/components/AuthThemeSync'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import RevealSection from '@/components/RevealSection'
import TextButton from '@/components/TextButton'
import { useRooms } from '@/hooks/useRooms'
import { createClient } from '@/lib/supabase-client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rooms } = useRooms({ hydrateFromServer: false })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailRequiredError = submitted && email.trim().length === 0
  const passwordRequiredError = submitted && password.trim().length === 0
  const passwordServerError = Boolean(serverError)

  const emailCaption = emailRequiredError ? 'поле обязательно для заполнения' : undefined
  const passwordCaption = passwordRequiredError
    ? 'поле обязательно для заполнения'
    : passwordServerError
      ? serverError
      : undefined

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setServerError('')

    if (email.trim().length === 0 || password.trim().length === 0) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        const message = authError.message.toLowerCase()
        if (
          message.includes('invalid login credentials') ||
          message.includes('invalid_credentials') ||
          message.includes('invalid email or password')
        ) {
          throw new Error('неверный email или пароль')
        }
        throw authError
      }

      const participantIds = rooms.map(room => room.participantId).filter(Boolean)
      if (participantIds.length > 0) {
        await fetch('/api/auth/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantIds }),
        })
      }

      const next = searchParams.get('next') ?? '/'
      router.push(next)
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : 'ошибка авторизации')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--bg-surface)]">
      <AuthThemeSync />
      <form onSubmit={handleSubmit} className="contents">
        <div className="mx-auto w-[400px] pt-[200px] app-mobile:w-[calc(100%-32px)] app-mobile:pt-[144px]">
          <div className="flex flex-col gap-2">
            <RevealSection delay={0} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
                <Icon name="fitness" size={16} />
              </div>
              <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
                Selecty Wellness
              </span>
            </RevealSection>

            <RevealSection delay={100} className="h-[32px]">
              <h1 className="text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
                авторизация
              </h1>
            </RevealSection>

            <RevealSection delay={200} className="flex flex-col gap-2">
              <div className="pt-4">
                <Input
                  label="электронная почта"
                  type="email"
                  value={email}
                  placeholder="введите почту"
                  autoComplete="email"
                  required
                  disabled={loading}
                  error={emailRequiredError}
                  caption={emailCaption}
                  showCaption={Boolean(emailCaption)}
                  onChange={event => setEmail(event.target.value)}
                  autoFocus
                />
              </div>

              <div className="pt-4">
                <Input
                  label="пароль"
                  type="password"
                  value={password}
                  placeholder="введите пароль"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  error={passwordRequiredError || passwordServerError}
                  caption={passwordCaption}
                  showCaption={Boolean(passwordCaption)}
                  onChange={event => setPassword(event.target.value)}
                />
              </div>
            </RevealSection>

            <RevealSection delay={300} className="flex h-6 w-full flex-col items-end">
              {loading ? (
                  <span className="text-[var(--text-disabled)]" aria-disabled="true">
                  забыли пароль?
                  </span>
                ) : (
                  <Link href="/forgot-password" className="inline-flex">
                  <TextButton
                    as="span"
                    variant="primary"
                    className="!h-6 !justify-end !px-0 !text-[16px] !leading-[24px]"
                  >
                    забыли пароль?
                  </TextButton>
                </Link>
              )}
            </RevealSection>

            <RevealSection delay={400} className="pt-[32px]">
                <Button type="submit" loading={loading}>
                  войти
                </Button>
            </RevealSection>

            <RevealSection delay={500} className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                <span>нет аккаунта? </span>
                {loading ? (
                  <span className="text-[var(--text-disabled)]" aria-disabled="true">
                    зарегистрироваться
                  </span>
                ) : (
                  <Link
                    href="/register"
                    className="text-[var(--accent-default)] hover:text-[var(--accent-hovered)] active:text-[var(--accent-pressed)]"
                  >
                    зарегистрироваться
                  </Link>
                )}
            </RevealSection>
          </div>
        </div>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
