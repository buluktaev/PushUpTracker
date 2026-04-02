'use client'

import Link from 'next/link'
import { useState } from 'react'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import TextButton from '@/components/TextButton'

interface VerifyEmailPreviewProps {
  isMobile?: boolean
  email?: string
  attemptsLeft?: number
  isBlocked?: boolean
  secondsLeft?: number
  mode?: 'cooldown' | 'available' | 'attempts-exceeded'
}

export function VerifyEmailPreview({
  isMobile = false,
  email = 'ivan@example.com',
  attemptsLeft = 0,
  isBlocked = false,
  secondsLeft = 30,
  mode = 'cooldown',
}: VerifyEmailPreviewProps) {
  const [linkState, setLinkState] = useState<'default' | 'hovered' | 'pressed'>('default')
  const shellWidth = isMobile ? 'w-[343px]' : 'w-[400px]'
  const viewportHeight = isMobile ? 'min-h-[812px]' : 'min-h-[900px]'
  const topPadding = isMobile ? 'pt-[144px]' : 'pt-[200px]'
  const resolvedMode = isBlocked ? 'attempts-exceeded' : mode
  const formHeight = resolvedMode === 'attempts-exceeded' ? (isMobile ? 'h-[440px]' : 'h-[418px]') : 'h-[370px]'
  const warningText = 'лимит исчерпан — подождите перед повторной отправкой'
  const warningWrapperHeight = isMobile ? 'h-[62px]' : 'h-[40px]'

  return (
    <main className={`flex ${viewportHeight} flex-col bg-[var(--bg-surface)]`}>
      <div className={`mx-auto ${shellWidth} ${topPadding}`}>
        <div className="flex flex-col">
          <div className={`flex flex-col ${formHeight}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
                <Icon name="fitness" size={16} />
              </div>
              <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
                Selecty Wellness
              </span>
            </div>

            <div className="flex flex-col">
              <h1 className="text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
                подтверждение
              </h1>

              <div className="h-[32px] pt-[8px]">
                <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                  проверьте почту и перейдите по ссылке
                </p>
              </div>
            </div>

            <div className="h-[130px] pt-[16px]">
              <div className="h-[114px] border border-[var(--border-primary-default)] bg-[var(--bg-primary)] px-[16px] py-[16px]">
                <div>
                  <p className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
                    Электронная почта
                  </p>
                </div>
                <div className="pt-[8px]">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-normal leading-[24px] tracking-[0] text-[var(--text-primary)]">
                    {email}
                  </p>
                </div>
                <div className="flex w-full items-center justify-center pb-[2px] pt-[8px]">
                  <TextButton
                    type="button"
                    variant="primary"
                    className="!h-auto !w-full !justify-start !px-0 !text-[14px] !leading-[22px]"
                  >
                    изменить почту
                  </TextButton>
                </div>
              </div>
            </div>

            {resolvedMode === 'attempts-exceeded' ? (
              <div className={`${warningWrapperHeight} pt-[16px]`}>
                <p className={`text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--status-danger-default)] ${isMobile ? 'max-w-[343px]' : 'max-w-[400px]'}`}>
                  {warningText}
                </p>
              </div>
            ) : null}

            <div className="h-[72px] pt-[32px]">
              {resolvedMode === 'available' ? (
                <Button type="button">
                  Отправить повторно
                </Button>
              ) : (
                <Button type="button" disabled>
                  {resolvedMode === 'attempts-exceeded'
                    ? 'Отправить повторно через 14:07'
                    : `Отправить повторно через ${secondsLeft}`}
                </Button>
              )}
            </div>

            <div className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
              <span>{'уже есть аккаунт? '}</span>
              <Link
                href="/login"
                className="inline-flex align-top"
                onMouseEnter={() => setLinkState('hovered')}
                onMouseLeave={() => setLinkState('default')}
                onPointerDown={() => setLinkState('pressed')}
                onPointerUp={() => setLinkState('hovered')}
              >
                <TextButton as="span" variant="primary" state={linkState} className="!h-auto">
                  авторизоваться
                </TextButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
