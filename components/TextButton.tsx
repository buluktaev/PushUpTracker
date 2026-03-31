'use client'

import Icon from '@/components/Icon'
import Loader from '@/components/Loader'

type TextButtonVariant = 'primary' | 'secondary' | 'danger'

interface TextButtonProps {
  children: React.ReactNode
  variant?: TextButtonVariant
  state?: 'default' | 'hovered' | 'pressed'
  disabled?: boolean
  loading?: boolean
  icon?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function TextButton({
  children,
  variant = 'primary',
  state = 'default',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = '',
  type = 'button',
}: TextButtonProps) {
  const isInactive = disabled || loading

  let color = 'var(--text-disabled)'

  if (!isInactive) {
    if (variant === 'primary') {
      color =
        state === 'hovered'
          ? 'var(--accent-hovered)'
          : state === 'pressed'
            ? 'var(--accent-pressed)'
            : 'var(--accent-default)'
    }
    if (variant === 'secondary') {
      color = 'var(--text-primary)'
    }
    if (variant === 'danger') {
      color =
        state === 'hovered'
          ? 'var(--status-danger-hovered)'
          : state === 'pressed'
            ? 'var(--status-danger-pressed)'
            : 'var(--status-danger-default)'
    }
  }

  return (
    <button
      type={type}
      disabled={isInactive}
      onClick={isInactive ? undefined : onClick}
      className={`inline-flex h-[var(--control-height-40)] items-center justify-center gap-1 px-0 text-[var(--size-16)] font-normal leading-[var(--line-height-24)] tracking-[var(--letter-spacing-0)] transition-colors duration-100 ${className}`}
      style={{
        color,
        boxSizing: 'border-box',
      }}
    >
      {loading ? (
        <span className="inline-flex h-4 w-4 items-center justify-center p-1">
          <Loader size={16} color="currentColor" />
        </span>
      ) : null}
      {!loading && icon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center p-1">
          <Icon name={icon} size={16} />
        </span>
      ) : null}
      {!loading ? <span>{children}</span> : null}
    </button>
  )
}
