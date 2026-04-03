'use client'

import RevealSection from '@/components/RevealSection'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import TextButton from '@/components/TextButton'

type ResetPasswordScreenMode = 'validating' | 'invalid' | 'form' | 'success'

interface ResetPasswordScreenProps {
  mode: ResetPasswordScreenMode
  isMobile?: boolean
  password?: string
  confirmPassword?: string
  passwordError?: boolean
  confirmPasswordError?: boolean
  passwordCaption?: string
  confirmPasswordCaption?: string
  passwordVisible?: boolean
  confirmPasswordVisible?: boolean
  loading?: boolean
  submitError?: string
  invalidMessage?: string
  onPasswordChange?: (value: string) => void
  onConfirmPasswordChange?: (value: string) => void
  onSubmit?: () => void
  onGoToLogin?: () => void
  onRetry?: () => void
}

function getShellWidth(isMobile?: boolean) {
  if (isMobile === true) return 'w-[343px]'
  if (isMobile === false) return 'w-[400px]'
  return 'w-[400px] app-mobile:w-[calc(100%-32px)]'
}

function getTopPadding(isMobile?: boolean) {
  if (isMobile === true) return 'pt-[144px]'
  if (isMobile === false) return 'pt-[200px]'
  return 'pt-[200px] app-mobile:pt-[144px]'
}

function getViewportHeight(isMobile?: boolean) {
  if (isMobile === true) return 'min-h-[812px]'
  if (isMobile === false) return 'min-h-[900px]'
  return 'min-h-dvh'
}

export default function ResetPasswordScreen({
  mode,
  isMobile,
  password = '',
  confirmPassword = '',
  passwordError = false,
  confirmPasswordError = false,
  passwordCaption,
  confirmPasswordCaption,
  passwordVisible,
  confirmPasswordVisible,
  loading = false,
  submitError,
  invalidMessage = 'Ссылка некорректна, уже была использована или её срок действия истёк',
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onGoToLogin,
  onRetry,
}: ResetPasswordScreenProps) {
  const shellWidth = getShellWidth(isMobile)
  const topPadding = getTopPadding(isMobile)
  const viewportHeight = getViewportHeight(isMobile)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.()
  }

  const heading = (() => {
    if (mode === 'validating') return 'проверяем ссылку...'
    if (mode === 'invalid') return 'ошибка'
    if (mode === 'success') return 'пароль обновлен'
    return 'новый пароль'
  })()

  const body = (() => {
    if (mode === 'validating') {
      return 'подождите, пока мы подтвердим ссылку для восстановления пароля'
    }
    if (mode === 'invalid') {
      return invalidMessage
    }
    if (mode === 'success') {
      return 'теперь вы можете авторизоваться с новым паролем'
    }
    return 'придумайте новый пароль для аккаунта'
  })()

  return (
    <main className={`flex ${viewportHeight} flex-col bg-[var(--bg-surface)]`}>
      <div className={`mx-auto ${shellWidth} ${topPadding}`}>
        <div className="flex flex-col gap-2">
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
              {heading}
            </h1>

            <div className="pt-[8px]">
              <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                {body}
              </p>
            </div>
          </RevealSection>

          {mode === 'form' ? (
            <>
              <form onSubmit={handleSubmit} className="contents">
                <RevealSection delay={200} className="flex flex-col gap-4 pt-[16px]">
                  <Input
                    label="новый пароль"
                    type="password"
                    value={password}
                    placeholder="введите пароль"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    error={passwordError}
                    caption={passwordCaption}
                    showCaption={Boolean(passwordCaption)}
                    passwordVisible={passwordVisible}
                    autoFocus
                    onChange={event => onPasswordChange?.(event.target.value)}
                  />
                  <Input
                    label="повторите пароль"
                    type="password"
                    value={confirmPassword}
                    placeholder="повторите пароль"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    error={confirmPasswordError}
                    caption={confirmPasswordCaption}
                    showCaption={Boolean(confirmPasswordCaption)}
                    passwordVisible={confirmPasswordVisible}
                    onChange={event => onConfirmPasswordChange?.(event.target.value)}
                  />
                </RevealSection>

                <RevealSection delay={300} className="pt-[32px]">
                  <Button type="submit" loading={loading}>
                    сохранить пароль
                  </Button>
                </RevealSection>
              </form>

              <RevealSection delay={400} className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                <span>вспомнили пароль? </span>
                <TextButton
                  variant="primary"
                  type="button"
                  disabled={loading}
                  className="!h-auto !px-0 !text-[14px] !leading-[22px]"
                  onClick={onGoToLogin}
                >
                  авторизоваться
                </TextButton>
              </RevealSection>

              {submitError ? (
                <RevealSection delay={500}>
                  <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)]">
                    {submitError}
                  </p>
                </RevealSection>
              ) : null}
            </>
          ) : null}

          {mode === 'success' ? (
            <RevealSection delay={200} className="pt-[32px]">
              <Button type="button" onClick={onGoToLogin}>
                авторизоваться
              </Button>
            </RevealSection>
          ) : null}

          {mode === 'invalid' ? (
            <RevealSection delay={200} className="pt-[32px]">
              <Button type="button" variant="secondary" onClick={onRetry}>
                попробовать снова
              </Button>
            </RevealSection>
          ) : null}
        </div>
      </div>
    </main>
  )
}
