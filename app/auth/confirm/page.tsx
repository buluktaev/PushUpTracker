'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthThemeSync from '@/components/AuthThemeSync'
import Icon from '@/components/Icon'
import { createClient } from '@/lib/supabase-client'
import { useRooms } from '@/hooks/useRooms'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rooms, loaded } = useRooms()
  const confirmedRef = useRef(false)
  const [error, setError] = useState('')
  const confirmErrorMessage = 'Ссылка некорректна, уже была использована или её срок действия истёк'

  useEffect(() => {
    if (!loaded || confirmedRef.current) return
    confirmedRef.current = true

    const tokenHashParam = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHashParam || type !== 'email') {
      setError(confirmErrorMessage)
      return
    }
    const tokenHash = tokenHashParam

    async function confirm() {
      try {
        const supabase = createClient()
        const { data, error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        })

        if (otpError) throw new Error(confirmErrorMessage)
        if (!data.user) throw new Error(confirmErrorMessage)

        const profileRes = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (!profileRes.ok) {
          const payload = await profileRes.json().catch(() => ({}))
          if (!String(payload.error || '').includes('Unique')) {
            throw new Error(payload.error || 'Ошибка сохранения профиля')
          }
        }

        const participantIds = rooms.map(room => room.participantId).filter(Boolean)
        if (participantIds.length > 0) {
          await fetch('/api/auth/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantIds }),
          })
        }

        router.push('/welcome')
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? confirmErrorMessage : confirmErrorMessage)
      }
    }

    void confirm()
  }, [confirmErrorMessage, loaded, rooms, router, searchParams])

  const isError = Boolean(error)
  const shellWidth = 'w-[400px] app-mobile:w-[calc(100%-32px)]'
  const formHeight = isError ? 'h-[126px]' : 'h-[64px]'
  const topPadding = isError ? 'pt-[387px] app-mobile:pt-[343px]' : 'pt-[418px] app-mobile:pt-[374px]'

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--bg-surface)]">
      <AuthThemeSync />
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
              {isError ? 'ошибка' : 'подтверждаем почту...'}
            </h1>

            {isError ? (
              <div className="h-[54px] pt-[8px]">
                <p className="text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
                  {error}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  )
}
