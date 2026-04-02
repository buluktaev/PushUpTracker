'use client'

import Icon from '@/components/Icon'

interface ConfirmEmailPreviewProps {
  isMobile?: boolean
  mode?: 'pending' | 'error'
}

export function ConfirmEmailPreview({
  isMobile = false,
  mode = 'pending',
}: ConfirmEmailPreviewProps) {
  const viewportHeight = isMobile ? 'min-h-[812px]' : 'min-h-[900px]'
  const shellWidth = isMobile ? 'w-[343px]' : 'w-[400px]'
  const formHeight = mode === 'pending' ? 'h-[64px]' : 'h-[126px]'
  const topPadding = mode === 'pending'
    ? (isMobile ? 'pt-[374px]' : 'pt-[418px]')
    : (isMobile ? 'pt-[343px]' : 'pt-[387px]')
  const heading = mode === 'pending' ? 'подтверждаем почту...' : 'ошибка'
  const body = mode === 'pending'
    ? undefined
    : 'Ссылка некорректна, уже была использована или её срок действия истёк'

  return (
    <main className={`flex ${viewportHeight} flex-col bg-[var(--bg-surface)]`}>
      <div className={`mx-auto ${shellWidth} ${topPadding}`}>
        <div className={`${shellWidth} ${formHeight} flex flex-col items-start gap-2`}>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
              <Icon name="fitness" size={16} />
            </div>
            <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
              Selecty Wellness
            </span>
          </div>

          <div className="flex flex-col items-start">
            <h1 className="text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
              {heading}
            </h1>

            {body ? (
              <div className="h-[54px] pt-[8px]">
                <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                  {body}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
