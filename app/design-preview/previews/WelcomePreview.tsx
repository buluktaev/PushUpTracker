'use client'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import RevealSection from '@/components/RevealSection'

interface WelcomePreviewProps {
  isMobile?: boolean
}

export function WelcomePreview({ isMobile = false }: WelcomePreviewProps) {
  const viewportHeight = isMobile ? 'min-h-[812px]' : 'min-h-[900px]'
  const contentWidth = isMobile ? 'w-[343px]' : 'w-[720px]'
  const logoSize = isMobile ? 40 : 48
  const iconSize = isMobile ? 26 : 32
  const headingSize = isMobile ? 'text-[26px] leading-[32px]' : 'text-[48px] leading-[48px]'
  const accentWeight = isMobile ? 'font-semibold italic' : 'font-medium italic'

  return (
    <main className={`relative ${viewportHeight} bg-[var(--bg-surface)]`}>
      <div
        className={`${isMobile ? 'absolute left-[16px] right-[16px] top-1/2 -translate-y-1/2' : 'absolute left-1/2 top-1/2 w-[720px] -translate-x-1/2 -translate-y-1/2'} flex flex-col items-center gap-8`}
      >
        <RevealSection delay={0}>
          <div
            className="flex items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]"
            style={{ width: logoSize, height: logoSize }}
          >
            <Icon name="fitness" size={iconSize} />
          </div>
        </RevealSection>

        <RevealSection delay={100}>
          <div className={`${contentWidth} text-center font-normal tracking-[0] text-[var(--text-primary)] ${headingSize}`}>
            <p>добро пожаловать</p>
            <p>
              <span>туда, где активность становится </span>
              <span className={`text-[var(--accent-default)] ${accentWeight}`}>игрой</span>
            </p>
          </div>
        </RevealSection>
      </div>

      <div className={isMobile ? 'absolute bottom-[56px] left-[16px] right-[16px]' : 'absolute bottom-[56px] left-1/2 w-[400px] -translate-x-1/2'}>
        <RevealSection delay={200}>
          <Button type="button">Начать</Button>
        </RevealSection>
      </div>
    </main>
  )
}
