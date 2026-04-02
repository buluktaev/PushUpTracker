'use client'

import { useRouter } from 'next/navigation'
import AuthThemeSync from '@/components/AuthThemeSync'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import RevealSection from '@/components/RevealSection'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="relative min-h-dvh bg-[var(--bg-surface)]">
      <AuthThemeSync />
      <div className="absolute left-1/2 top-1/2 flex w-[720px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8 app-mobile:left-[16px] app-mobile:right-[16px] app-mobile:top-1/2 app-mobile:w-auto app-mobile:translate-x-0">
        <RevealSection delay={0}>
          <div className="flex h-12 w-12 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)] app-mobile:h-10 app-mobile:w-10">
            <Icon name="fitness" size={32} className="app-mobile:!h-[26px] app-mobile:!w-[26px]" />
          </div>
        </RevealSection>

        <RevealSection delay={100}>
          <div className="w-[720px] text-center text-[48px] font-normal leading-[48px] tracking-[0] text-[var(--text-primary)] app-mobile:w-full app-mobile:text-[26px] app-mobile:leading-[32px]">
            <p>добро пожаловать</p>
            <p>
              <span>туда, где активность становится </span>
              <span className="italic text-[var(--accent-default)]">игрой</span>
            </p>
          </div>
        </RevealSection>
      </div>

      <div className="absolute bottom-[56px] left-1/2 w-[400px] -translate-x-1/2 app-mobile:left-[16px] app-mobile:right-[16px] app-mobile:w-auto app-mobile:translate-x-0">
        <RevealSection delay={200}>
          <Button type="button" onClick={() => router.push('/register/name')}>
            Начать
          </Button>
        </RevealSection>
      </div>
    </main>
  )
}
