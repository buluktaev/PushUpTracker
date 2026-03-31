'use client'

import Icon from '@/components/Icon'
import Loader from '@/components/Loader'

type IconButtonVariant = 'primary' | 'secondary' | 'danger'

interface IconButtonProps {
  icon: string
  label: string
  variant?: IconButtonVariant
  state?: 'default' | 'hovered' | 'pressed'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function IconButton({
  icon,
  label,
  variant = 'primary',
  state = 'default',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}: IconButtonProps) {
  const isInactive = disabled || loading

  const style: React.CSSProperties = {
    width: 'var(--control-height-40)',
    height: 'var(--control-height-40)',
    boxSizing: 'border-box',
    borderRadius: 0,
    border: '1px solid transparent',
    cursor: isInactive ? 'default' : 'pointer',
    pointerEvents: isInactive ? 'none' : undefined,
  }

  if (variant === 'primary') {
    style.backgroundColor =
      isInactive
        ? 'var(--accent-disabled)'
        : state === 'hovered'
          ? 'var(--accent-hovered)'
          : state === 'pressed'
            ? 'var(--accent-pressed)'
            : 'var(--accent-default)'
    style.color = isInactive ? 'var(--text-on-accent-disabled)' : 'var(--icon-on-accent)'
  }

  if (variant === 'secondary') {
    style.backgroundColor = 'transparent'
    style.border = `1px solid ${
      isInactive
        ? 'var(--border-disabled)'
        : state === 'hovered'
          ? 'var(--border-primary-hovered)'
          : state === 'pressed'
            ? 'var(--border-primary-pressed)'
            : 'var(--border-primary-default)'
    }`
    style.color = isInactive ? 'var(--icon-disabled)' : 'var(--icon-default)'
  }

  if (variant === 'danger') {
    style.backgroundColor =
      isInactive
        ? 'var(--status-danger-weak)'
        : state === 'hovered'
          ? 'var(--status-danger-hovered)'
          : state === 'pressed'
            ? 'var(--status-danger-pressed)'
            : 'var(--status-danger-default)'
    style.color = isInactive ? 'var(--text-on-accent-disabled)' : 'var(--icon-on-accent)'
  }

  return (
    <button
      type={type}
      aria-label={label}
      aria-busy={loading}
      disabled={isInactive}
      onClick={isInactive ? undefined : onClick}
      className={`inline-flex items-center justify-center p-2 transition-colors duration-100 ${className}`}
      style={style}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center p-1">
        {loading ? (
          <Loader size={16} color="currentColor" />
        ) : (
          <Icon name={icon} size={16} />
        )}
      </span>
    </button>
  )
}
