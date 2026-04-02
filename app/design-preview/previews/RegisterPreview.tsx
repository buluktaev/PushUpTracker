'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import TextButton from '@/components/TextButton'

interface RegisterPreviewProps {
  loading?: boolean
  isMobile?: boolean
  mode?: 'empty' | 'required-validation' | 'filled' | 'invalid-email-format' | 'email-exists' | 'password-visible' | 'loading'
}

export function RegisterPreview({
  loading = false,
  isMobile = false,
  mode = 'empty',
}: RegisterPreviewProps) {
  const initialEmail =
    mode === 'filled' || mode === 'loading' || mode === 'password-visible' || mode === 'email-exists'
      ? 'ivan@example.com'
      : mode === 'invalid-email-format'
        ? 'ivanexample.com'
        : ''
  const initialPassword =
    mode === 'filled' || mode === 'loading' || mode === 'password-visible' || mode === 'email-exists' || mode === 'invalid-email-format'
      ? '1234567890123456789012345'
      : ''

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState(initialPassword)
  const [submitted, setSubmitted] = useState(mode === 'required-validation')
  const [authLinkState, setAuthLinkState] = useState<'default' | 'hovered' | 'pressed'>('default')
  const shellWidth = isMobile ? 'w-[343px]' : 'w-[400px]'
  const viewportHeight = isMobile ? 'min-h-[812px]' : 'min-h-[1024px]'
  const topPadding = isMobile ? 'pt-[144px]' : 'pt-[200px]'
  const bottomPadding = isMobile ? 'pb-[56px]' : 'pb-[40px]'
  const isSubmitting = loading || mode === 'loading'
  const shouldShowPassword = mode === 'password-visible'
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailRequiredError = submitted && email.trim().length === 0
  const passwordRequiredError = submitted && password.trim().length === 0
  const emailExistsError = mode === 'email-exists'
  const invalidEmailError = mode === 'invalid-email-format' || (submitted && email.trim().length > 0 && !looksLikeEmail)
  const emailError = emailRequiredError || emailExistsError || invalidEmailError
  const passwordError = passwordRequiredError
  const emailCaption = emailRequiredError
    ? 'поле обязательно для заполнения'
    : emailExistsError
      ? 'пользователь с таким email уже существует'
      : invalidEmailError
        ? 'неправильный формат электронной почты'
        : undefined
  const passwordCaption = passwordRequiredError ? 'поле обязательно для заполнения' : undefined

  const handleSubmit = () => {
    setSubmitted(true)
  }

  return (
    <main className={`flex ${viewportHeight} flex-col bg-[var(--bg-surface)]`}>
      <div className={`mx-auto ${shellWidth} ${topPadding}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
              <Icon name="fitness" size={16} />
            </div>
            <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
              Selecty Wellness
            </span>
          </div>

          <h1 className="pt-[10px] text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
            регистрация
          </h1>

          <div className="pt-[24px]">
            <Input
              label="Электронная почта"
              type="email"
              value={email}
              placeholder="введите почту"
              autoComplete="off"
              required
              disabled={isSubmitting}
              error={emailError}
              caption={emailCaption}
              showCaption={Boolean(emailCaption)}
              onChange={(event) => {
                setEmail(event.target.value)
              }}
            />
          </div>

          <div className="pt-[24px]">
            <Input
              label="Пароль"
              type="password"
              value={password}
              placeholder="введите пароль"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              error={passwordError}
              caption={passwordCaption}
              showCaption={Boolean(passwordCaption)}
              passwordVisible={shouldShowPassword}
              onChange={(event) => {
                setPassword(event.target.value)
              }}
            />
          </div>

          <div className="pt-[36px]">
            <Button type="button" loading={isSubmitting} onClick={handleSubmit}>
              зарегистрироваться
            </Button>
          </div>

          <div className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
            <span>{'уже есть аккаунт? '}</span>
            <Link
              href="/login"
              className="inline-flex align-top"
              onMouseEnter={() => setAuthLinkState('hovered')}
              onMouseLeave={() => setAuthLinkState('default')}
              onPointerDown={() => setAuthLinkState('pressed')}
              onPointerUp={() => setAuthLinkState('hovered')}
            >
              <TextButton as="span" variant="primary" state={authLinkState} className="!h-auto">
                авторизоваться
              </TextButton>
            </Link>
          </div>
        </div>
      </div>

      <div className={`mx-auto mt-auto ${shellWidth} ${bottomPadding} text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]`}>
        <p>Немного формальностей:</p>
        <p>
          <span>{'Продолжая, вы даёте согласие на '}</span>
          <span className="text-[var(--accent-default)]">сбор, обработку</span>
          <span>{' и '}</span>
          <span className="text-[var(--accent-default)]">хранение персональных данных</span>
        </p>
      </div>
    </main>
  )
}
