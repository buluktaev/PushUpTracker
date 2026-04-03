'use client'

import RevealSection from '@/components/RevealSection'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import TextButton from '@/components/TextButton'

type ForgotPasswordScreenMode = 'form' | 'sent'

interface ForgotPasswordScreenProps {
  mode: ForgotPasswordScreenMode
  isMobile?: boolean
  email: string
  emailError?: boolean
  emailCaption?: string
  loading?: boolean
  resendLoading?: boolean
  resendDisabled?: boolean
  resendLabel?: string
  requestError?: string
  warningText?: string
  sentError?: string
  onEmailChange?: (value: string) => void
  onSubmit?: () => void
  onChangeEmail?: () => void
  onResend?: () => void
  onGoToLogin?: () => void
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

export default function ForgotPasswordScreen({
  mode,
  isMobile,
  email,
  emailError = false,
  emailCaption,
  loading = false,
  resendLoading = false,
  resendDisabled = false,
  resendLabel = 'отправить повторно',
  requestError,
  warningText,
  sentError,
  onEmailChange,
  onSubmit,
  onChangeEmail,
  onResend,
  onGoToLogin,
}: ForgotPasswordScreenProps) {
  const shellWidth = getShellWidth(isMobile)
  const topPadding = getTopPadding(isMobile)
  const viewportHeight = getViewportHeight(isMobile)
  const isBusy = mode === 'form' ? loading : resendLoading

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.()
  }

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
              {mode === 'form' ? 'восстановление пароля' : 'проверьте почту'}
            </h1>

            <div className="pt-[8px]">
              <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                {mode === 'form'
                  ? 'введите электронную почту, и мы отправим ссылку для смены пароля'
                  : 'если у нас есть такой электронный адрес, вы получите письмо со ссылкой для смены пароля'}
              </p>
            </div>
          </RevealSection>

          {mode === 'form' ? (
            <>
              <form onSubmit={handleSubmit} className="contents">
                <RevealSection delay={200} className="pt-[16px]">
                  <Input
                    label="электронная почта"
                    type="email"
                    value={email}
                    placeholder="введите почту"
                    autoComplete="email"
                    required
                    disabled={loading}
                    error={emailError}
                    caption={emailCaption}
                    showCaption={Boolean(emailCaption)}
                    autoFocus
                    onChange={event => onEmailChange?.(event.target.value)}
                  />
                </RevealSection>

                <RevealSection delay={300} className="pt-[32px]">
                  <Button type="submit" loading={loading}>
                    отправить ссылку
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

              {requestError ? (
                <RevealSection delay={500}>
                  <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)]">
                    {requestError}
                  </p>
                </RevealSection>
              ) : null}
            </>
          ) : (
            <>
              <RevealSection delay={200} className="pt-[16px]">
                <div className="border border-[var(--border-primary-default)] bg-[var(--bg-primary)] px-[16px] py-[16px]">
                  <p className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
                    Электронная почта
                  </p>

                  <div className="pt-[8px]">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-normal leading-[24px] tracking-[0] text-[var(--text-primary)]">
                      {email}
                    </p>
                  </div>

                  <div className="pt-[8px]">
                    <TextButton
                      variant="primary"
                      type="button"
                      disabled={isBusy}
                      className="!h-auto !w-full !justify-start !px-0 !text-[14px] !leading-[22px]"
                      onClick={onChangeEmail}
                    >
                      изменить почту
                    </TextButton>
                  </div>
                </div>
              </RevealSection>

              {warningText ? (
                <RevealSection delay={300} className="pt-[16px]">
                  <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)]">
                    {warningText}
                  </p>
                </RevealSection>
              ) : null}

              <RevealSection delay={400} className="pt-[32px]">
                <Button
                  type="button"
                  loading={resendLoading}
                  disabled={resendDisabled}
                  onClick={onResend}
                >
                  {resendLabel}
                </Button>
              </RevealSection>

              <RevealSection delay={500} className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                <span>вспомнили пароль? </span>
                <TextButton
                  variant="primary"
                  type="button"
                  disabled={isBusy}
                  className="!h-auto !px-0 !text-[14px] !leading-[22px]"
                  onClick={onGoToLogin}
                >
                  авторизоваться
                </TextButton>
              </RevealSection>

              {sentError ? (
                <RevealSection delay={600}>
                  <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)]">
                    {sentError}
                  </p>
                </RevealSection>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
