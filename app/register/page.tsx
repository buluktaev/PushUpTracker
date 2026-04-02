'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/Button'
import AuthThemeSync from '@/components/AuthThemeSync'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import RevealSection from '@/components/RevealSection'
import { createClient } from '@/lib/supabase-client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailRequiredError = submitted && email.trim().length === 0
  const passwordRequiredError = submitted && password.trim().length === 0
  const invalidEmailError = submitted && email.trim().length > 0 && !looksLikeEmail
  const emailError = emailRequiredError || invalidEmailError || Boolean(serverError)
  const passwordError = passwordRequiredError

  const emailCaption = emailRequiredError
    ? 'поле обязательно для заполнения'
    : invalidEmailError
      ? 'неправильный формат электронной почты'
      : serverError || undefined
  const passwordCaption = passwordRequiredError ? 'поле обязательно для заполнения' : undefined

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setServerError('')

    if (email.trim().length === 0 || password.trim().length === 0 || !looksLikeEmail) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        const message = error.message.toLowerCase()
        if (message.includes('already') || message.includes('exists') || message.includes('зарегистр')) {
          setServerError('пользователь с таким email уже существует')
          setLoading(false)
          return
        }
        throw error
      }

      if (!data.user) {
        throw new Error('Ошибка регистрации')
      }

      if (data.session) {
        router.push('/welcome')
        return
      }

      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'ошибка регистрации')
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
                регистрация
              </h1>
            </RevealSection>

            <RevealSection delay={200} className="flex flex-col gap-6 pt-4">
              <Input
                label="Электронная почта"
                type="email"
                value={email}
                placeholder="введите почту"
                autoComplete="email"
                required
                disabled={loading}
                error={emailError}
                caption={emailCaption}
                showCaption={Boolean(emailCaption)}
                onChange={event => setEmail(event.target.value)}
              />
              <Input
                label="Пароль"
                type="password"
                value={password}
                placeholder="введите пароль"
                autoComplete="new-password"
                required
                disabled={loading}
                error={passwordError}
                caption={passwordCaption}
                showCaption={Boolean(passwordCaption)}
                onChange={event => setPassword(event.target.value)}
              />
            </RevealSection>

            <RevealSection delay={300} className="pt-[32px]">
              <Button type="submit" loading={loading}>
                зарегистрироваться
              </Button>
            </RevealSection>

            <RevealSection delay={400} className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
              <span>уже есть аккаунт? </span>
              {loading ? (
                <span className="text-[var(--text-disabled)]" aria-disabled="true">
                  авторизоваться
                </span>
              ) : (
                <Link href="/login" className="text-[var(--accent-default)] hover:text-[var(--accent-hovered)] active:text-[var(--accent-pressed)]">
                  авторизоваться
                </Link>
              )}
            </RevealSection>
          </div>
        </div>
      </form>

      <RevealSection delay={500} className="mx-auto mt-auto w-[400px] pb-[40px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)] app-mobile:w-[calc(100%-32px)] app-mobile:pb-[56px]">
        <p>Немного формальностей:</p>
        <p>
          <span>Продолжая, вы даёте согласие на </span>
          <span className="text-[var(--accent-default)]">сбор, обработку</span>
          <span> и </span>
          <span className="text-[var(--accent-default)]">хранение персональных данных</span>
        </p>
      </RevealSection>
    </main>
  )
}
