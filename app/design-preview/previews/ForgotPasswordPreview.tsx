'use client'

import ForgotPasswordScreen from '@/components/ForgotPasswordScreen'

export type ForgotPasswordPreviewMode =
  | 'empty'
  | 'required-validation'
  | 'invalid-email'
  | 'filled'
  | 'loading'
  | 'request-error'
  | 'sent-cooldown'
  | 'sent-available'
  | 'sent-attempts-exceeded'
  | 'sent-error'

interface ForgotPasswordPreviewProps {
  isMobile?: boolean
  mode?: ForgotPasswordPreviewMode
}

export function ForgotPasswordPreview({
  isMobile = false,
  mode = 'empty',
}: ForgotPasswordPreviewProps) {
  if (mode === 'sent-cooldown') {
    return (
      <ForgotPasswordScreen
        mode="sent"
        isMobile={isMobile}
        email="ivan@example.com"
        resendDisabled
        resendLabel="Отправить повторно через 0:30"
      />
    )
  }

  if (mode === 'sent-available') {
    return (
      <ForgotPasswordScreen
        mode="sent"
        isMobile={isMobile}
        email="ivan@example.com"
      />
    )
  }

  if (mode === 'sent-attempts-exceeded') {
    return (
      <ForgotPasswordScreen
        mode="sent"
        isMobile={isMobile}
        email="ivan@example.com"
        resendDisabled
        resendLabel="Отправить повторно через 14:07"
        warningText="лимит исчерпан — подождите перед повторной отправкой"
      />
    )
  }

  if (mode === 'sent-error') {
    return (
      <ForgotPasswordScreen
        mode="sent"
        isMobile={isMobile}
        email="ivan@example.com"
        sentError="ошибка отправки"
      />
    )
  }

  const email =
    mode === 'filled' || mode === 'loading' || mode === 'request-error'
      ? 'ivan@example.com'
      : mode === 'invalid-email'
        ? 'ivanexample.com'
        : ''
  const emailError = mode === 'required-validation' || mode === 'invalid-email'
  const emailCaption =
    mode === 'required-validation'
      ? 'поле обязательно для заполнения'
      : mode === 'invalid-email'
        ? 'неправильный формат электронной почты'
        : undefined

  return (
    <ForgotPasswordScreen
      mode="form"
      isMobile={isMobile}
      email={email}
      emailError={emailError}
      emailCaption={emailCaption}
      loading={mode === 'loading'}
      requestError={mode === 'request-error' ? 'ошибка отправки' : undefined}
    />
  )
}
