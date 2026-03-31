'use client'

import Loader from '@/components/Loader'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  state?: 'default' | 'hovered' | 'pressed'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function Button({
  children,
  variant = 'primary',
  state = 'default',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const isInactive = disabled || loading
  const content = loading ? null : <span>{children}</span>

  // Base styles applied to all variants
  const base =
    'inline-flex items-center justify-center gap-2 text-[var(--size-16)] leading-[var(--line-height-24)] font-normal select-none transition-colors duration-100'

  const padding = 'px-4'

  const variantStyle: React.CSSProperties = {
    height: 'var(--control-height-40)',
    borderRadius: 0,
    justifyContent: 'center',
    width: '100%',
    boxSizing: 'border-box',
    cursor: isInactive ? 'default' : 'pointer',
    pointerEvents: isInactive ? 'none' : undefined,
  }

  if (variant === 'primary') {
    variantStyle.backgroundColor = loading || disabled
      ? 'var(--accent-disabled)'
      : state === 'hovered'
        ? 'var(--accent-hovered)'
        : state === 'pressed'
          ? 'var(--accent-pressed)'
          : 'var(--accent-default)'
    variantStyle.color = loading || disabled ? 'var(--text-on-accent-disabled)' : 'var(--text-on-accent)'
    variantStyle.border = '1px solid transparent'
  }

  if (variant === 'secondary') {
    variantStyle.backgroundColor = 'transparent'
    variantStyle.border = `1px solid ${
      loading || disabled
        ? 'var(--border-disabled)'
        : state === 'hovered'
          ? 'var(--border-primary-hovered)'
          : state === 'pressed'
            ? 'var(--border-primary-pressed)'
            : 'var(--border-primary-default)'
    }`
    variantStyle.color = loading || disabled ? 'var(--text-disabled)' : 'var(--text-primary)'
  }

  if (variant === 'danger') {
    variantStyle.backgroundColor = loading || disabled
      ? 'var(--status-danger-weak)'
      : state === 'hovered'
        ? 'var(--status-danger-hovered)'
        : state === 'pressed'
          ? 'var(--status-danger-pressed)'
          : 'var(--status-danger-default)'
    variantStyle.color = loading || disabled ? 'var(--text-on-accent-disabled)' : 'var(--text-on-accent)'
    variantStyle.border = '1px solid transparent'
  }

  return (
    <button
      type={type}
      onClick={isInactive ? undefined : onClick}
      disabled={isInactive}
      className={`${base} ${padding} ${className}`}
      style={variantStyle}
    >
      {loading ? (
        <Loader
          size={16}
          stroke={2}
          strokeLength={0.5}
          bgOpacity={0.1}
          speed={2}
          color="currentColor"
        />
      ) : null}
      {content}
    </button>
  )
}
