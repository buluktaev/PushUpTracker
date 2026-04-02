'use client'

import Link from 'next/link'
import AuthThemeSync from '@/components/AuthThemeSync'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import TextButton from '@/components/TextButton'

interface LoginPreviewProps {
  error?: string
  loading?: boolean
}

export function LoginPreview({ error, loading = false }: LoginPreviewProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-[var(--bg-surface)]">
      <AuthThemeSync />
      <div className="mx-auto w-[400px] pt-[200px] app-mobile:w-[calc(100%-32px)] app-mobile:pt-[144px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
              <Icon name="fitness" size={16} />
            </div>
            <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
              Selecty Wellness
            </span>
          </div>

          <div className="h-[32px]">
            <h1 className="text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
              авторизация
            </h1>
          </div>

          <div className="flex flex-col gap-0">
            <div className="pt-4">
              <Input
                label="Электронная почта"
                type="email"
                value="ivan@example.com"
                placeholder="введите почту"
                required
                disabled={loading}
                onChange={() => {}}
              />
            </div>

            <div className="pt-4">
              <Input
                label="Пароль"
                type="password"
                value="password"
                placeholder="введите пароль"
                required
                disabled={loading}
                error={Boolean(error)}
                caption={error}
                showCaption={Boolean(error)}
                onChange={() => {}}
              />
            </div>

            <div className="flex h-6 w-full flex-col items-end">
              <TextButton
                variant="primary"
                type="button"
                disabled={loading}
                className="!h-6 !justify-end !px-0 !text-[16px] !leading-[24px]"
              >
                Забыли пароль?
              </TextButton>
            </div>

            <div className="pt-[32px]">
              <Button type="button" loading={loading}>
                войти
              </Button>
            </div>

            <div className="h-[40px] pb-[2px] pt-[16px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]">
              <span>нет аккаунта? </span>
              {loading ? (
                <span className="text-[var(--text-disabled)]" aria-disabled="true">
                  зарегистрироваться
                </span>
              ) : (
                <Link
                  href="/register"
                  className="text-[var(--accent-default)] hover:text-[var(--accent-hovered)] active:text-[var(--accent-pressed)]"
                >
                  зарегистрироваться
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
