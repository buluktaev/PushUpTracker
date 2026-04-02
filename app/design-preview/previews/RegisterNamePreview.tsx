'use client'

import { useState } from 'react'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'

interface RegisterNamePreviewProps {
  isMobile?: boolean
  mode?: 'empty' | 'required-validation' | 'too-short' | 'filled'
}

export function RegisterNamePreview({
  isMobile = false,
  mode = 'empty',
}: RegisterNamePreviewProps) {
  const initialName = mode === 'filled' ? 'Александр' : mode === 'too-short' ? 'Я' : ''
  const [name, setName] = useState(initialName)
  const [submitted, setSubmitted] = useState(mode === 'required-validation' || mode === 'too-short')

  const shellWidth = isMobile ? 'w-[343px]' : 'w-[400px]'
  const viewportHeight = isMobile ? 'min-h-[812px]' : 'min-h-[900px]'
  const topPadding = isMobile ? 'pt-[144px]' : 'pt-[200px]'
  const isRequiredError = submitted && name.trim().length === 0
  const isTooShortError = submitted && name.trim().length > 0 && name.trim().length < 2
  const caption = isRequiredError
    ? 'поле обязательно для заполнения'
    : isTooShortError
      ? 'введите минимум 2 символа'
      : undefined

  return (
    <main className={`flex ${viewportHeight} flex-col bg-[var(--bg-surface)]`}>
      <div className={`mx-auto ${shellWidth} ${topPadding}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-[var(--accent-default)] text-[var(--text-on-accent)]">
              <Icon name="fitness" size={16} />
            </div>
            <span className="text-[12px] font-normal leading-[18px] tracking-[0] text-[var(--text-secondary)]">
              Selecty Wellness
            </span>
          </div>

          <h1 className="pt-[10px] text-[24px] font-medium leading-[32px] tracking-[0] text-[var(--text-primary)]">
            как к вам обращаться?
          </h1>

          <div className="pt-[24px]">
            <Input
              label="Имя"
              value={name}
              placeholder="введите имя"
              autoComplete="off"
              required
              error={Boolean(caption)}
              caption={caption}
              showCaption={Boolean(caption)}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="pt-[36px]">
            <Button
              type="button"
              onClick={() => setSubmitted(true)}
            >
              Продолжить
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
