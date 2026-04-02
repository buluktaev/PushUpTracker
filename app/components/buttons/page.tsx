'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useMemo, useState } from 'react'
import Button from '@/components/Button'

type ThemeMode = 'light' | 'dark'
type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonState = 'default' | 'hovered' | 'pressed'

function ThemeToggle({
  theme,
  onChange,
}: {
  theme: ThemeMode
  onChange: (theme: ThemeMode) => void
}) {
  return (
    <div
      className="inline-flex p-1"
      style={{
        border: '1px solid var(--border-primary-default)',
        backgroundColor: 'var(--surface-dim)',
      }}
    >
      {(['light', 'dark'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="min-w-[88px] px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          style={{
            backgroundColor: theme === option ? 'var(--surface)' : 'transparent',
            color: theme === option ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </div>
  )
}

function DemoCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ border: '1px solid var(--border-primary-default)', backgroundColor: 'var(--surface-dim)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary-default)' }}>
        <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function FixedPreview({
  theme,
  children,
}: {
  theme: ThemeMode
  children: React.ReactNode
}) {
  return (
    <div
      data-theme={theme}
      className="p-6"
      style={{
        border: '1px solid var(--border-primary-default)',
        backgroundColor: 'var(--bg)',
      }}
    >
      {children}
    </div>
  )
}

function DemoCell({
  label,
  theme,
  width = '100%',
  children,
}: {
  label: string
  theme: ThemeMode
  width?: number | string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
      <FixedPreview theme={theme}>
        <div style={{ width }}>{children}</div>
      </FixedPreview>
    </div>
  )
}

function InteractiveVariantPreview({
  theme,
  variant,
  children,
}: {
  theme: ThemeMode
  variant: ButtonVariant
  children: React.ReactNode
}) {
  const [state, setState] = useState<ButtonState>('default')

  return (
    <DemoCell theme={theme} label={variant} width="100%">
      <div
        className="w-full"
        onMouseEnter={() => setState('hovered')}
        onMouseLeave={() => setState('default')}
        onPointerDown={() => setState('pressed')}
        onPointerUp={() => setState('hovered')}
      >
        <Button variant={variant} state={state}>
          {children}
        </Button>
      </div>
    </DemoCell>
  )
}

function InteractiveButtonDemo({ theme }: { theme: ThemeMode }) {
  const [variant, setVariant] = useState<ButtonVariant>('primary')
  const [visualState, setVisualState] = useState<ButtonState>('default')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wide, setWide] = useState(false)

  const activeState = disabled || loading ? 'default' : visualState

  const button = useMemo(
    () => (
      <Button
        variant={variant}
        state={activeState}
        disabled={disabled}
        loading={loading}
        type="button"
      >
        Continue
      </Button>
    ),
    [activeState, disabled, loading, variant]
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <FixedPreview theme={theme}>
        <div className="flex min-h-[280px] items-center justify-center">
          <div
            style={{ width: wide ? '100%' : 420, maxWidth: wide ? 640 : 420 }}
            onMouseEnter={() => {
              if (!disabled && !loading) setVisualState('hovered')
            }}
            onMouseLeave={() => {
              if (!disabled && !loading) setVisualState('default')
            }}
            onPointerDown={() => {
              if (!disabled && !loading) setVisualState('pressed')
            }}
            onPointerUp={() => {
              if (!disabled && !loading) setVisualState('hovered')
            }}
          >
            {button}
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
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Button</div>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            Live playground for our system button. Hover and press are real interactions, while the toggles help
            us lock edge cases fast.
          </p>
        </div>

        <div className="space-y-3">
          <ControlLabel>Variant</ControlLabel>
          <div className="grid grid-cols-3 gap-2">
            {(['primary', 'secondary', 'danger'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVariant(option)}
                className="border px-3 py-2 text-xs uppercase tracking-[0.08em]"
                style={{
                  borderColor: variant === option ? 'var(--text-primary)' : 'var(--border-primary-default)',
                  backgroundColor: variant === option ? 'var(--surface)' : 'transparent',
                  color: variant === option ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <ControlLabel>State</ControlLabel>
          <div className="grid grid-cols-3 gap-2">
            {(['default', 'hovered', 'pressed'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVisualState(option)}
                className="border px-3 py-2 text-xs uppercase tracking-[0.08em]"
                style={{
                  borderColor: visualState === option ? 'var(--text-primary)' : 'var(--border-primary-default)',
                  backgroundColor: visualState === option ? 'var(--surface)' : 'transparent',
                  color: visualState === option ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {[
            { label: 'disabled', value: disabled, onChange: setDisabled },
            { label: 'loading', value: loading, onChange: setLoading },
            { label: 'wide', value: wide, onChange: setWide },
          ].map((toggle) => (
            <label
              key={toggle.label}
              className="flex items-center justify-between gap-3 text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              <span>{toggle.label}</span>
              <button
                type="button"
                onClick={() => toggle.onChange(!toggle.value)}
                className="relative h-6 w-11 transition-colors"
                style={{
                  border: '1px solid var(--border-primary-default)',
                  backgroundColor: toggle.value ? 'var(--border-primary-pressed)' : 'transparent',
                }}
                aria-pressed={toggle.value}
              >
                <span
                  className="absolute top-[2px] h-4 w-4 transition-transform"
                  style={{ backgroundColor: 'var(--surface)', left: toggle.value ? 22 : 2 }}
                />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ButtonsPage() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main
      data-theme={theme}
      className="min-h-screen p-6"
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mx-auto max-w-[1280px] space-y-6">
        <header
          className="px-6 py-6"
          style={{
            border: '1px solid var(--border-primary-default)',
            backgroundColor: 'var(--surface-dim)',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link href="/components" className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
                Back to components
              </Link>
              <h1 className="mt-4 text-3xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Buttons
              </h1>
              <p className="mt-3 max-w-[720px] text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                HeroUI-style component page, but powered by our own `Button`. This is the place to lock variants,
                states, disabled behavior, loading treatment, and live interaction feel before screens rely on it.
              </p>
            </div>
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>
        </header>

        <DemoCard
          title="Playground"
          description="Use the controls to validate the real component under theme, state, loading, and disabled combinations."
        >
          <InteractiveButtonDemo theme={theme} />
        </DemoCard>

        <DemoCard
          title="Variants"
          description="Default interaction surface for the three system variants."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <InteractiveVariantPreview theme={theme} variant="primary">
              Continue
            </InteractiveVariantPreview>
            <InteractiveVariantPreview theme={theme} variant="secondary">
              Continue
            </InteractiveVariantPreview>
            <InteractiveVariantPreview theme={theme} variant="danger">
              Delete room
            </InteractiveVariantPreview>
          </div>
        </DemoCard>

        <DemoCard
          title="States"
          description="Forced state matrix for visual QA. This keeps hover and press deterministic when we compare against design."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {(['primary', 'secondary', 'danger'] as const).map((variant) => (
              <div key={variant} className="space-y-4">
                <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
                  {variant}
                </div>
                <DemoCell theme={theme} label="Default">
                  <Button variant={variant} state="default">
                    {variant}
                  </Button>
                </DemoCell>
                <DemoCell theme={theme} label="Hovered">
                  <Button variant={variant} state="hovered">
                    {variant}
                  </Button>
                </DemoCell>
                <DemoCell theme={theme} label="Pressed">
                  <Button variant={variant} state="pressed">
                    {variant}
                  </Button>
                </DemoCell>
              </div>
            ))}
          </div>
        </DemoCard>

        <DemoCard
          title="Disabled and Loading"
          description="Edge cases that usually drift first. Keeping them together makes regressions obvious."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {(['primary', 'secondary', 'danger'] as const).map((variant) => (
              <div key={variant} className="space-y-4">
                <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
                  {variant}
                </div>
                <DemoCell theme={theme} label="Disabled / Default">
                  <Button variant={variant} disabled>
                    {variant}
                  </Button>
                </DemoCell>
                <DemoCell theme={theme} label="Disabled / Hovered">
                  <Button variant={variant} state="hovered" disabled>
                    {variant}
                  </Button>
                </DemoCell>
                <DemoCell theme={theme} label="Disabled / Pressed">
                  <Button variant={variant} state="pressed" disabled>
                    {variant}
                  </Button>
                </DemoCell>
                <DemoCell theme={theme} label="Loading">
                  <Button variant={variant} loading>
                    {variant}
                  </Button>
                </DemoCell>
              </div>
            ))}
          </div>
        </DemoCard>

      </div>
    </main>
  )
}
