'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import AuthThemeSync from '@/components/AuthThemeSync'
import ResetPasswordScreen from '@/components/ResetPasswordScreen'
import { createClient } from '@/lib/supabase-client'

const MIN_PASSWORD_LENGTH = 8
const RECOVERY_MARKER_KEY = 'password_recovery_active_at'
const RECOVERY_MARKER_TTL_MS = 30 * 60 * 1000
const RECOVERY_SESSION_TIMEOUT_MS = 5000
const RECOVERY_SESSION_POLL_INTERVAL_MS = 150

function hasRecoveryUrlHint() {
  const search = window.location.search.toLowerCase()
  const hash = window.location.hash.toLowerCase()

  return (
    search.includes('type=recovery') ||
    hash.includes('type=recovery') ||
    hash.includes('access_token=') ||
    search.includes('access_token=') ||
    search.includes('code=')
  )
}

function setRecoveryMarker() {
  sessionStorage.setItem(RECOVERY_MARKER_KEY, String(Date.now()))
}

function clearRecoveryMarker() {
  sessionStorage.removeItem(RECOVERY_MARKER_KEY)
}

function hasFreshRecoveryMarker() {
  const raw = sessionStorage.getItem(RECOVERY_MARKER_KEY)
  if (!raw) return false

  const timestamp = Number.parseInt(raw, 10)
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > RECOVERY_MARKER_TTL_MS) {
    clearRecoveryMarker()
    return false
  }

  return true
}

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function isRecoverySessionError(message: string) {
  const normalized = message.toLowerCase()

  return (
    normalized.includes('auth session missing') ||
    normalized.includes('session not found') ||
    normalized.includes('invalid refresh token') ||
    normalized.includes('refresh token') ||
    normalized.includes('token has expired') ||
    normalized.includes('jwt') ||
    normalized.includes('session')
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'validating' | 'invalid' | 'form' | 'success'>('validating')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const recoveryHintFromUrl = hasRecoveryUrlHint()
    const supabase = createClient()
    let cancelled = false
    let recoveryDetected = false
    let recoveryResolved = false
    let recoveryHandoffStarted = false

    const finishRecovery = () => {
      if (cancelled || recoveryResolved) {
        return
      }

      recoveryDetected = true
      recoveryResolved = true
      setRecoveryMarker()

      // Recovery links arrive through a PKCE/auth redirect. Force one clean
      // route handoff so the password form runs on a stable page instance.
      if (recoveryHintFromUrl && !recoveryHandoffStarted) {
        recoveryHandoffStarted = true
        window.location.replace(`${window.location.origin}/reset-password`)
        return
      }

      setMode('form')
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return

      if (
        session &&
        (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && recoveryHintFromUrl))
      ) {
        finishRecovery()
      }
    })

    async function validateRecovery() {
      const hasHint = recoveryHintFromUrl
      const hasMarker = hasFreshRecoveryMarker()

      if (!hasHint && !hasMarker) {
        setMode('invalid')
        return
      }

      if (cancelled) return

      if (hasHint) {
        const deadline = Date.now() + RECOVERY_SESSION_TIMEOUT_MS

        while (!cancelled && Date.now() < deadline) {
          if (recoveryResolved) {
            return
          }

          const session = (await supabase.auth.getSession()).data.session
          if (cancelled) return

          if (session && (recoveryDetected || hasFreshRecoveryMarker() || recoveryHintFromUrl)) {
            finishRecovery()
            return
          }

          await wait(RECOVERY_SESSION_POLL_INTERVAL_MS)
        }

        const finalSession = (await supabase.auth.getSession()).data.session
        if (cancelled) return

        if (finalSession && (recoveryDetected || hasFreshRecoveryMarker() || recoveryHintFromUrl)) {
          finishRecovery()
          return
        }

        if (recoveryResolved) {
          return
        }

        clearRecoveryMarker()
        setMode('invalid')
        return
      }

      const session = (await supabase.auth.getSession()).data.session
      if (cancelled) return

      if (session && hasMarker) {
        recoveryResolved = true
        setMode('form')
        return
      }

      clearRecoveryMarker()
      setMode('invalid')
    }

    void validateRecovery()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const trimmedPassword = password.trim()
  const trimmedConfirmPassword = confirmPassword.trim()
  const passwordRequiredError = submitted && trimmedPassword.length === 0
  const passwordTooShortError = submitted && trimmedPassword.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const confirmRequiredError = submitted && trimmedConfirmPassword.length === 0
  const passwordMismatchError =
    submitted &&
    trimmedPassword.length > 0 &&
    trimmedConfirmPassword.length > 0 &&
    password !== confirmPassword

  const passwordCaption = passwordRequiredError
    ? 'поле обязательно для заполнения'
    : passwordTooShortError
      ? 'минимум 8 символов'
      : undefined
  const confirmPasswordCaption = confirmRequiredError
    ? 'поле обязательно для заполнения'
    : passwordMismatchError
      ? 'пароли не совпадают'
      : undefined

  const goToLogin = () => {
    clearRecoveryMarker()
    router.push('/login')
  }

  const retryRecovery = () => {
    clearRecoveryMarker()
    router.push('/forgot-password')
  }

  const handleSubmit = async () => {
    setSubmitted(true)

    if (
      trimmedPassword.length === 0 ||
      trimmedConfirmPassword.length === 0 ||
      password.length < MIN_PASSWORD_LENGTH ||
      password !== confirmPassword
    ) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        if (isRecoverySessionError(error.message)) {
          clearRecoveryMarker()
          setMode('invalid')
          setLoading(false)
          return
        }

        throw error
      }

      await supabase.auth.signOut({ scope: 'local' })
      clearRecoveryMarker()
      setMode('success')
      setLoading(false)
    } catch {
      toast.error('не удалось обновить пароль, попробуйте позже')
      setLoading(false)
    }
  }

  return (
    <>
      <AuthThemeSync />
      <ResetPasswordScreen
        mode={mode}
        password={password}
        confirmPassword={confirmPassword}
        passwordError={passwordRequiredError || passwordTooShortError}
        confirmPasswordError={confirmRequiredError || passwordMismatchError}
        passwordCaption={passwordCaption}
        confirmPasswordCaption={confirmPasswordCaption}
        loading={loading}
        onPasswordChange={value => {
          setPassword(value)
        }}
        onConfirmPasswordChange={value => {
          setConfirmPassword(value)
        }}
        onSubmit={() => {
          void handleSubmit()
        }}
        onGoToLogin={goToLogin}
        onRetry={retryRecovery}
      />
    </>
  )
}
