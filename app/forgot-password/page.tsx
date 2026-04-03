'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import AuthThemeSync from '@/components/AuthThemeSync'
import ForgotPasswordScreen from '@/components/ForgotPasswordScreen'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_COOLDOWN_MS = 30 * 1000
const BLOCKED_MESSAGE = 'лимит исчерпан — подождите перед повторной отправкой'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getCooldownStorageKey(email: string) {
  return `forgot_password_cooldown_until:${normalizeEmail(email)}`
}

function getBlockedStorageKey(email: string) {
  return `forgot_password_blocked_until:${normalizeEmail(email)}`
}

function readStoredTimestamp(key: string) {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= Date.now()) {
    localStorage.removeItem(key)
    return null
  }

  return parsed
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getRateLimitToastMessage(blockedUntil: number) {
  const seconds = Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000))
  return `превышены лимиты на запрос, попробуйте через ${formatSeconds(seconds)}`
}

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sentFlag = searchParams.get('sent') === '1'
  const sentEmail = (searchParams.get('email') ?? '').trim()
  const sentMode = sentFlag && EMAIL_PATTERN.test(sentEmail)

  const [email, setEmail] = useState(sentEmail)
  const [submitted, setSubmitted] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (sentMode && sentEmail !== email) {
      setEmail(sentEmail)
    }
  }, [email, sentEmail, sentMode])

  useEffect(() => {
    if (!sentMode) {
      setCooldownUntil(null)
      setBlockedUntil(null)
      setSecondsLeft(0)
      return
    }

    setCooldownUntil(readStoredTimestamp(getCooldownStorageKey(sentEmail)))
    setBlockedUntil(readStoredTimestamp(getBlockedStorageKey(sentEmail)))
  }, [sentEmail, sentMode])

  useEffect(() => {
    const activeUntil =
      blockedUntil && blockedUntil > Date.now() ? blockedUntil : cooldownUntil && cooldownUntil > Date.now() ? cooldownUntil : null

    if (!activeUntil) {
      setSecondsLeft(0)
      return
    }

    const tick = () => {
      const nextSecondsLeft = Math.ceil((activeUntil - Date.now()) / 1000)

      if (nextSecondsLeft <= 0) {
        setSecondsLeft(0)

        if (blockedUntil && blockedUntil <= activeUntil) {
          setBlockedUntil(null)
          if (sentMode) {
            localStorage.removeItem(getBlockedStorageKey(sentEmail))
          }
        }

        if (cooldownUntil && cooldownUntil <= activeUntil) {
          setCooldownUntil(null)
          if (sentMode) {
            localStorage.removeItem(getCooldownStorageKey(sentEmail))
          }
        }

        return
      }

      setSecondsLeft(nextSecondsLeft)
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [blockedUntil, cooldownUntil, sentEmail, sentMode])

  const trimmedEmail = email.trim()
  const looksLikeEmail = EMAIL_PATTERN.test(trimmedEmail)
  const emailRequiredError = submitted && trimmedEmail.length === 0
  const emailInvalidError = submitted && trimmedEmail.length > 0 && !looksLikeEmail
  const emailCaption = emailRequiredError
    ? 'поле обязательно для заполнения'
    : emailInvalidError
      ? 'неправильный формат электронной почты'
      : undefined

  const resendBlocked = Boolean(blockedUntil && blockedUntil > Date.now())
  const resendCooldown = !resendBlocked && Boolean(cooldownUntil && cooldownUntil > Date.now())
  const resendDisabled = resendLoading || resendBlocked || resendCooldown
  const resendLabel =
    resendBlocked || resendCooldown
      ? `отправить повторно через ${formatSeconds(secondsLeft)}`
      : 'отправить повторно'

  const navigateToSentState = (targetEmail: string) => {
    router.push(`/forgot-password?sent=1&email=${encodeURIComponent(targetEmail)}`)
  }

  const saveCooldown = (targetEmail: string, nextCooldownUntil: number) => {
    localStorage.setItem(getCooldownStorageKey(targetEmail), String(nextCooldownUntil))
    setCooldownUntil(nextCooldownUntil)
  }

  const saveBlockedUntil = (targetEmail: string, nextBlockedUntil: number) => {
    localStorage.setItem(getBlockedStorageKey(targetEmail), String(nextBlockedUntil))
    setBlockedUntil(nextBlockedUntil)
  }

  const handleRequest = async (targetEmail: string, source: 'submit' | 'resend') => {
    const setBusy = source === 'submit' ? setRequestLoading : setResendLoading
    const storedBlockedUntil = readStoredTimestamp(getBlockedStorageKey(targetEmail))

    if (source === 'submit' && storedBlockedUntil) {
      saveBlockedUntil(targetEmail, storedBlockedUntil)
      toast.error(getRateLimitToastMessage(storedBlockedUntil))
      return
    }

    setBusy(true)

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.status === 429 && typeof data.retryAfter === 'number') {
        saveBlockedUntil(targetEmail, data.retryAfter)
        setBusy(false)

        if (source === 'submit') {
          toast.error(getRateLimitToastMessage(data.retryAfter))
        }

        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'request_failed')
      }

      const nextCooldownUntil = Date.now() + RESEND_COOLDOWN_MS
      saveCooldown(targetEmail, nextCooldownUntil)
      setBlockedUntil(readStoredTimestamp(getBlockedStorageKey(targetEmail)))

      if (source === 'submit') {
        navigateToSentState(targetEmail)
        return
      }

      setBusy(false)
    } catch {
      toast.error('не удалось отправить письмо, попробуйте позже')
      setBusy(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitted(true)

    if (!trimmedEmail || !looksLikeEmail) {
      return
    }

    await handleRequest(trimmedEmail, 'submit')
  }

  const handleResend = async () => {
    if (!sentMode || !sentEmail || resendDisabled) {
      return
    }

    await handleRequest(sentEmail, 'resend')
  }

  const handleChangeEmail = () => {
    router.push('/forgot-password')
  }

  const goToLogin = () => {
    if (!requestLoading && !resendLoading) {
      router.push('/login')
    }
  }

  const warningText = useMemo(() => (resendBlocked ? BLOCKED_MESSAGE : undefined), [resendBlocked])

  return (
    <>
      <AuthThemeSync />
      <ForgotPasswordScreen
        mode={sentMode ? 'sent' : 'form'}
        email={sentMode ? sentEmail : email}
        emailError={emailRequiredError || emailInvalidError}
        emailCaption={emailCaption}
        loading={requestLoading}
        resendLoading={resendLoading}
        resendDisabled={resendDisabled}
        resendLabel={resendLabel}
        warningText={warningText}
        onEmailChange={value => {
          setEmail(value)
        }}
        onSubmit={() => {
          void handleSubmit()
        }}
        onChangeEmail={handleChangeEmail}
        onResend={() => {
          void handleResend()
        }}
        onGoToLogin={goToLogin}
      />
    </>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
