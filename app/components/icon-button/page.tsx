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
import IconButton from '@/components/IconButton'

type IconButtonVariant = 'primary' | 'secondary' | 'danger'
type IconButtonState = 'default' | 'hovered' | 'pressed'

function InteractiveVariant({
  theme,
  variant,
}: {
  theme: ThemeMode
  variant: IconButtonVariant
}) {
  const [state, setState] = useState<IconButtonState>('default')

  return (
    <DemoCell theme={theme} label={variant}>
      <div
        className="inline-flex"
        onMouseEnter={() => setState('hovered')}
        onMouseLeave={() => setState('default')}
        onPointerDown={() => setState('pressed')}
        onPointerUp={() => setState('hovered')}
      >
        <IconButton variant={variant} icon="moon" label={variant} state={state} />
      </div>
    </DemoCell>
  )
}

function IconButtonPlayground({ theme }: { theme: ThemeMode }) {
  const [variant, setVariant] = useState<IconButtonVariant>('primary')
  const [state, setState] = useState<IconButtonState>('default')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const preview = useMemo(
    () => (
      <IconButton
        variant={variant}
        icon="moon"
        label={variant}
        state={disabled || loading ? 'default' : state}
        disabled={disabled}
        loading={loading}
      />
    ),
    [variant, state, disabled, loading]
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
        </div>
      </div>
    </div>
  )
}

export default function IconButtonsPage() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <DocsPageShell theme={theme}>
      <DocsHeader
        title="Icon Button"
        description="Review page for icon-only actions so color, border, shape, and loading behavior stay stable."
        theme={theme}
        onThemeChange={setTheme}
      />

      <DemoCard title="Playground" description="Live controls for the main icon button permutations.">
        <IconButtonPlayground theme={theme} />
      </DemoCard>

      <DemoCard title="Variants" description="Interactive variant row with real hover and press behavior.">
        <div className="grid gap-4 md:grid-cols-3">
          <InteractiveVariant theme={theme} variant="primary" />
          <InteractiveVariant theme={theme} variant="secondary" />
          <InteractiveVariant theme={theme} variant="danger" />
        </div>
      </DemoCard>

      <DemoCard title="States" description="Forced matrix for visual QA.">
        <div className="grid gap-4 md:grid-cols-3">
          {(['primary', 'secondary', 'danger'] as const).map((variant) => (
            <div key={variant} className="space-y-4">
              <DocsControlLabel>{variant}</DocsControlLabel>
              <DemoCell theme={theme} label="Default">
                <IconButton variant={variant} icon="moon" label={variant} state="default" />
              </DemoCell>
              <DemoCell theme={theme} label="Hovered">
                <IconButton variant={variant} icon="moon" label={variant} state="hovered" />
              </DemoCell>
              <DemoCell theme={theme} label="Pressed">
                <IconButton variant={variant} icon="moon" label={variant} state="pressed" />
              </DemoCell>
            </div>
          ))}
        </div>
      </DemoCard>

      <DemoCard title="Disabled and loading" description="Edge cases grouped where regressions are easiest to spot.">
        <div className="grid gap-4 md:grid-cols-3">
          {(['primary', 'secondary', 'danger'] as const).map((variant) => (
            <div key={variant} className="space-y-4">
              <DocsControlLabel>{variant}</DocsControlLabel>
              <DemoCell theme={theme} label="Disabled / Default">
                <IconButton variant={variant} icon="moon" label={variant} disabled />
              </DemoCell>
              <DemoCell theme={theme} label="Disabled / Hovered">
                <IconButton variant={variant} icon="moon" label={variant} disabled state="hovered" />
              </DemoCell>
              <DemoCell theme={theme} label="Disabled / Pressed">
                <IconButton variant={variant} icon="moon" label={variant} disabled state="pressed" />
              </DemoCell>
              <DemoCell theme={theme} label="Loading">
                <IconButton variant={variant} icon="moon" label={variant} loading />
              </DemoCell>
            </div>
          ))}
        </div>
      </DemoCard>
    </DocsPageShell>
  )
}
