'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AuthThemeSync from '@/components/AuthThemeSync'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import RevealSection from '@/components/RevealSection'

export default function RegisterNamePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const requiredError = submitted && name.trim().length === 0
  const shortError = submitted && name.trim().length > 0 && name.trim().length < 2
  const caption = requiredError
    ? 'поле обязательно для заполнения'
    : shortError
      ? 'введите минимум 2 символа'
      : serverError || undefined

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setServerError('')

    if (name.trim().length < 2) return

    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения профиля')
      }

      router.push('/')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Ошибка сохранения профиля')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--bg-surface)]">
      <AuthThemeSync />
      <form onSubmit={handleSubmit} className="mx-auto w-[400px] pt-[200px] app-mobile:w-[calc(100%-32px)] app-mobile:pt-[144px]">
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
              как к вам обращаться?
            </h1>
          </RevealSection>

          <RevealSection delay={200} className="pt-4">
            <Input
              label="Имя"
              type="text"
              value={name}
              placeholder="введите имя"
              autoComplete="name"
              required
              autoFocus
              disabled={loading}
              error={requiredError || shortError || Boolean(serverError)}
              caption={caption}
              showCaption={Boolean(caption)}
              onChange={event => setName(event.target.value)}
            />
          </RevealSection>

          <RevealSection delay={300} className="pt-[32px]">
            <Button type="submit" loading={loading}>
              Продолжить
            </Button>
          </RevealSection>
        </div>
      </form>
    </main>
  )
}
