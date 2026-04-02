'use client'

import { notFound } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  DemoCard,
  DemoCell,
  DocsHeader,
  DocsPageShell,
  FixedPreview,
  SegmentedButtonGroup,
  ThemeMode,
  ToggleRow,
} from '@/app/components/_shared/docs-primitives'
import Input from '@/components/Input'

type InputVisualState = 'default' | 'hovered' | 'focused'

function InputPlayground({ theme }: { theme: ThemeMode }) {
  const [visualState, setVisualState] = useState<InputVisualState>('default')
  const [required, setRequired] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [showCaption, setShowCaption] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const preview = useMemo(
    () => (
      <Input
        label="email"
        required={required}
        disabled={disabled}
        error={error}
        state={disabled ? 'disabled' : visualState}
        value={inputValue}
        placeholder="ivan@example.com"
        showIcon={showIcon}
        icon="person"
        showCaption={showCaption}
        caption="!поле обязательно для заполнения"
        onChange={(event) => setInputValue(event.target.value)}
        onFocus={() => {
          if (!disabled) setVisualState('focused')
        }}
        onBlur={() => {
          if (!disabled) setVisualState('default')
        }}
      />
    ),
    [required, disabled, error, visualState, inputValue, showIcon, showCaption]
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <FixedPreview theme={theme}>
        <div className="flex min-h-[280px] items-center justify-center">
          <div
            className="w-full max-w-[420px]"
            onMouseEnter={() => {
              if (!disabled && visualState === 'default') setVisualState('hovered')
            }}
            onMouseLeave={() => {
              if (!disabled && visualState !== 'focused') setVisualState('default')
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
          label="State"
          value={visualState}
          options={['default', 'hovered', 'focused'] as const}
          onChange={setVisualState}
        />

        <div className="grid gap-3">
          <ToggleRow label="required" value={required} onChange={setRequired} />
          <ToggleRow label="disabled" value={disabled} onChange={setDisabled} />
          <ToggleRow label="error" value={error} onChange={setError} />
          <ToggleRow label="show icon" value={showIcon} onChange={setShowIcon} />
          <ToggleRow label="show caption" value={showCaption} onChange={setShowCaption} />
          <ToggleRow
            label="has value"
            value={inputValue.length > 0}
            onChange={(nextValue) => setInputValue(nextValue ? 'ivan@example.com' : '')}
          />
        </div>
      </div>
    </div>
  )
}

export default function InputsPage() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <DocsPageShell theme={theme}>
      <DocsHeader
        title="Inputs"
        description="Review page for the input component so label sizing, icon toggles, captions, and validation states stay locked."
        theme={theme}
        onThemeChange={setTheme}
      />

      <DemoCard title="Playground" description="Live controls for the exact switches that matter on screens.">
        <InputPlayground theme={theme} />
      </DemoCard>

      <DemoCard title="Base states" description="Default, hovered, focused, and disabled snapshots.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DemoCell theme={theme} label="Default">
            <Input label="email" placeholder="ivan@example.com" required showCaption={false} />
          </DemoCell>
          <DemoCell theme={theme} label="Hovered">
            <Input label="email" placeholder="ivan@example.com" required state="hovered" showCaption={false} />
          </DemoCell>
          <DemoCell theme={theme} label="Focused">
            <Input label="email" value="ivan@example.com" required state="focused" showCaption={false} />
          </DemoCell>
          <DemoCell theme={theme} label="Disabled">
            <Input label="email" placeholder="ivan@example.com" required disabled state="disabled" showCaption={false} />
          </DemoCell>
        </div>
      </DemoCard>

      <DemoCard title="Error and caption" description="Validation treatment with and without caption output.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DemoCell theme={theme} label="Error / Default">
            <Input label="email" value="ivan@example.com" required error caption="!поле обязательно для заполнения" />
          </DemoCell>
          <DemoCell theme={theme} label="Error / Hovered">
            <Input label="email" value="ivan@example.com" required error state="hovered" caption="!поле обязательно для заполнения" />
          </DemoCell>
          <DemoCell theme={theme} label="Error / Focused">
            <Input label="email" value="ivan@example.com" required error state="focused" caption="!поле обязательно для заполнения" />
          </DemoCell>
          <DemoCell theme={theme} label="Caption hidden">
            <Input label="email" value="ivan@example.com" required error showCaption={false} />
          </DemoCell>
        </div>
      </DemoCard>

      <DemoCard title="Icon and value combinations" description="The combinations that usually drift first.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DemoCell theme={theme} label="Placeholder only">
            <Input label="email" placeholder="ivan@example.com" required showCaption={false} />
          </DemoCell>
          <DemoCell theme={theme} label="Value">
            <Input label="email" value="ivan@example.com" required showCaption={false} />
          </DemoCell>
          <DemoCell theme={theme} label="Value + Icon">
            <Input label="email" value="ivan@example.com" required icon="person" showIcon showCaption={false} />
          </DemoCell>
          <DemoCell theme={theme} label="Value + Icon hidden">
            <Input label="email" value="ivan@example.com" required icon="person" showIcon={false} showCaption={false} />
          </DemoCell>
        </div>
      </DemoCard>
    </DocsPageShell>
  )
}
