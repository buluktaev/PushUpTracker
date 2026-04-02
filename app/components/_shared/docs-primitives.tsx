'use client'

import Link from 'next/link'

export type ThemeMode = 'light' | 'dark'

export function DocsThemeToggle({
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

export function DocsPageShell({
  theme,
  children,
}: {
  theme: ThemeMode
  children: React.ReactNode
}) {
  return (
    <main
      data-theme={theme}
      className="min-h-screen p-6"
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mx-auto max-w-[1280px] space-y-6">{children}</div>
    </main>
  )
}

export function DocsHeader({
  title,
  description,
  theme,
  onThemeChange,
}: {
  title: string
  description: string
  theme: ThemeMode
  onThemeChange: (theme: ThemeMode) => void
}) {
  return (
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
            {title}
          </h1>
          <p className="mt-3 max-w-[720px] text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
        <DocsThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  )
}

export function DocsControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </div>
  )
}

export function DemoCard({
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
        <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function FixedPreview({
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

export function DemoCell({
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

export function SegmentedButtonGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <div className="space-y-3">
      <DocsControlLabel>{label}</DocsControlLabel>
      <div className={`grid gap-2 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="border px-3 py-2 text-xs uppercase tracking-[0.08em]"
            style={{
              borderColor: value === option ? 'var(--text-primary)' : 'var(--border-primary-default)',
              backgroundColor: value === option ? 'var(--surface)' : 'transparent',
              color: value === option ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative h-6 w-11 transition-colors"
        style={{
          border: '1px solid var(--border-primary-default)',
          backgroundColor: value ? 'var(--border-primary-pressed)' : 'transparent',
        }}
        aria-pressed={value}
      >
        <span
          className="absolute top-[2px] h-4 w-4 transition-transform"
          style={{ backgroundColor: 'var(--surface)', left: value ? 22 : 2 }}
        />
      </button>
    </label>
  )
}
