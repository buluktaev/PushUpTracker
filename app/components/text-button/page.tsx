'use client'

import { notFound } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  DemoCard,
  DemoCell,
  DocsControlLabel,
  DocsHeader,
  DocsPageShell,
  FixedPreview,
  SegmentedButtonGroup,
  ThemeMode,
  ToggleRow,
} from '@/app/components/_shared/docs-primitives'
import TextButton from '@/components/TextButton'
import { areReviewRoutesEnabled } from '@/lib/review-routes'

type TextButtonVariant = 'primary' | 'secondary' | 'danger'
type TextButtonState = 'default' | 'hovered' | 'pressed'

function InteractiveVariant({
  theme,
  variant,
  children,
}: {
  theme: ThemeMode
  variant: TextButtonVariant
  children: React.ReactNode
}) {
  const [state, setState] = useState<TextButtonState>('default')

  return (
    <DemoCell theme={theme} label={variant}>
      <div
        className="inline-flex"
        onMouseEnter={() => setState('hovered')}
        onMouseLeave={() => setState('default')}
        onPointerDown={() => setState('pressed')}
        onPointerUp={() => setState('hovered')}
      >
        <TextButton variant={variant} state={state}>
          {children}
        </TextButton>
      </div>
    </DemoCell>
  )
}

function TextButtonPlayground({ theme }: { theme: ThemeMode }) {
  const [variant, setVariant] = useState<TextButtonVariant>('primary')
  const [state, setState] = useState<TextButtonState>('default')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showIcon, setShowIcon] = useState(false)

  const preview = useMemo(
    () => (
      <TextButton
        variant={variant}
        state={disabled || loading ? 'default' : state}
        disabled={disabled}
        loading={loading}
        icon="arrow_left"
        showIcon={showIcon}
      >
        Continue
      </TextButton>
    ),
    [variant, state, disabled, loading, showIcon]
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <FixedPreview theme={theme}>
        <div className="flex min-h-[240px] items-center justify-center">
          <div
            className="inline-flex"
            onMouseEnter={() => {
              if (!disabled && !loading) setState('hovered')
            }}
            onMouseLeave={() => {
              if (!disabled && !loading) setState('default')
            }}
            onPointerDown={() => {
              if (!disabled && !loading) setState('pressed')
            }}
            onPointerUp={() => {
              if (!disabled && !loading) setState('hovered')
            }}
          >
            {preview}
          </div>
        </div>
      </FixedPreview>

      <div
        className="space-y-5 p-5"
        style={{
          border: '1px solid var(--border-primary-default)',
          backgroundColor: 'var(--surface-dim)',
        }}
      >
        <SegmentedButtonGroup
          label="Variant"
          value={variant}
          options={['primary', 'secondary', 'danger'] as const}
          onChange={setVariant}
        />
        <SegmentedButtonGroup
          label="State"
          value={state}
          options={['default', 'hovered', 'pressed'] as const}
          onChange={setState}
        />
        <div className="grid gap-3">
          <ToggleRow label="disabled" value={disabled} onChange={setDisabled} />
          <ToggleRow label="loading" value={loading} onChange={setLoading} />
          <ToggleRow label="show icon" value={showIcon} onChange={setShowIcon} />
        </div>
      </div>
    </div>
  )
}

export default function TextButtonsPage() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  if (!areReviewRoutesEnabled()) {
    notFound()
  }

  return (
    <DocsPageShell theme={theme}>
      <DocsHeader
        title="Text Button"
        description="Review page for inline actions so color states, icon toggles, disabled, and loading behavior stay consistent."
        theme={theme}
        onThemeChange={setTheme}
      />

      <DemoCard title="Playground" description="Live controls for the main text button permutations.">
        <TextButtonPlayground theme={theme} />
      </DemoCard>

      <DemoCard title="Variants" description="Interactive variant row with real hover and press behavior.">
        <div className="grid gap-4 md:grid-cols-3">
          <InteractiveVariant theme={theme} variant="primary">Continue</InteractiveVariant>
          <InteractiveVariant theme={theme} variant="secondary">Continue</InteractiveVariant>
          <InteractiveVariant theme={theme} variant="danger">Delete room</InteractiveVariant>
        </div>
      </DemoCard>

      <DemoCard title="States" description="Forced matrix for visual QA.">
        <div className="grid gap-4 md:grid-cols-3">
          {(['primary', 'secondary', 'danger'] as const).map((variant) => (
            <div key={variant} className="space-y-4">
              <DocsControlLabel>{variant}</DocsControlLabel>
              <DemoCell theme={theme} label="Default">
                <TextButton variant={variant} state="default">{variant}</TextButton>
              </DemoCell>
              <DemoCell theme={theme} label="Hovered">
                <TextButton variant={variant} state="hovered">{variant}</TextButton>
              </DemoCell>
              <DemoCell theme={theme} label="Pressed">
                <TextButton variant={variant} state="pressed">{variant}</TextButton>
              </DemoCell>
            </div>
          ))}
        </div>
      </DemoCard>

      <DemoCard title="Icon, disabled, loading" description="The combinations that screens depend on most.">
        <div className="grid gap-4 md:grid-cols-3">
          {(['primary', 'secondary', 'danger'] as const).map((variant) => (
            <div key={variant} className="space-y-4">
              <DocsControlLabel>{variant}</DocsControlLabel>
              <DemoCell theme={theme} label="With icon">
                <TextButton variant={variant} icon="arrow_left" showIcon>{variant}</TextButton>
              </DemoCell>
              <DemoCell theme={theme} label="Disabled">
                <TextButton variant={variant} disabled>{variant}</TextButton>
              </DemoCell>
              <DemoCell theme={theme} label="Loading">
                <TextButton variant={variant} loading>{variant}</TextButton>
              </DemoCell>
            </div>
          ))}
        </div>
      </DemoCard>
    </DocsPageShell>
  )
}
