'use client'

import { useState } from 'react'
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
  state,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const [interactionState, setInteractionState] = useState<'default' | 'hovered' | 'pressed'>('default')
  const isInactive = disabled || loading
  const resolvedState = state ?? interactionState
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
      : resolvedState === 'hovered'
        ? 'var(--accent-hovered)'
        : resolvedState === 'pressed'
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
        : resolvedState === 'hovered'
          ? 'var(--border-primary-hovered)'
          : resolvedState === 'pressed'
            ? 'var(--border-primary-pressed)'
            : 'var(--border-primary-default)'
    }`
    variantStyle.color = loading || disabled ? 'var(--text-disabled)' : 'var(--text-primary)'
  }

  if (variant === 'danger') {
    variantStyle.backgroundColor = loading || disabled
      ? 'var(--status-danger-weak)'
      : resolvedState === 'hovered'
        ? 'var(--status-danger-hovered)'
        : resolvedState === 'pressed'
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
      onMouseEnter={() => {
        if (!isInactive && state === undefined) {
          setInteractionState('hovered')
        }
      }}
      onMouseLeave={() => {
        if (!isInactive && state === undefined) {
          setInteractionState('default')
        }
      }}
      onPointerDown={() => {
        if (!isInactive && state === undefined) {
          setInteractionState('pressed')
        }
      }}
      onPointerUp={() => {
        if (!isInactive && state === undefined) {
          setInteractionState('hovered')
        }
      }}
      onPointerCancel={() => {
        if (!isInactive && state === undefined) {
          setInteractionState('default')
        }
      }}
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
