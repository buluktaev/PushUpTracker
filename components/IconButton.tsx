'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'
import Loader from '@/components/Loader'

type IconButtonVariant = 'primary' | 'secondary' | 'danger'

interface IconButtonProps {
  icon: string
  alternateIcon?: string
  alternateActive?: boolean
  label: string
  variant?: IconButtonVariant
  size?: 'default' | 'compact'
  state?: 'default' | 'hovered' | 'pressed'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function IconButton({
  icon,
  alternateIcon,
  alternateActive = false,
  label,
  variant = 'primary',
  size = 'default',
  state,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}: IconButtonProps) {
  const [interactionState, setInteractionState] = useState<'default' | 'hovered' | 'pressed'>('default')
  const isInactive = disabled || loading
  const resolvedState = isInactive ? 'default' : state ?? interactionState
  const buttonSize = size === 'compact' ? 32 : 40

  const style: React.CSSProperties = {
    width: buttonSize,
    height: buttonSize,
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
        : resolvedState === 'hovered'
          ? 'var(--accent-hovered)'
          : resolvedState === 'pressed'
            ? 'var(--accent-pressed)'
            : 'var(--accent-default)'
    style.color = isInactive ? 'var(--text-on-accent-disabled)' : 'var(--icon-on-accent)'
  }

  if (variant === 'secondary') {
    style.backgroundColor = 'transparent'
    style.border = `1px solid ${
      isInactive
        ? 'var(--border-disabled)'
        : resolvedState === 'hovered'
          ? 'var(--border-primary-hovered)'
          : resolvedState === 'pressed'
            ? 'var(--border-primary-pressed)'
            : 'var(--border-primary-default)'
    }`
    style.color = isInactive ? 'var(--icon-disabled)' : 'var(--icon-default)'
  }

  if (variant === 'danger') {
    style.backgroundColor =
      isInactive
        ? 'var(--status-danger-weak)'
        : resolvedState === 'hovered'
          ? 'var(--status-danger-hovered)'
          : resolvedState === 'pressed'
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
      onMouseEnter={() => {
        if (!isInactive && state === undefined && interactionState !== 'pressed') {
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
      className={`inline-flex items-center justify-center ${size === 'compact' ? 'p-2' : 'p-2'} transition-colors duration-100 ${className}`}
      style={style}
    >
      <span className={`relative inline-flex items-center justify-center ${size === 'compact' ? 'h-4 w-4' : 'h-6 w-6 p-1'}`}>
        {loading ? (
          <Loader size={16} color="currentColor" />
        ) : alternateIcon ? (
          <>
            <span
              aria-hidden="true"
              className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                alternateActive
                  ? 'opacity-0 scale-[0.25] blur-[4px]'
                  : 'opacity-100 scale-100 blur-0'
              }`}
            >
              <Icon name={icon} size={16} />
            </span>
            <span
              aria-hidden="true"
              className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                alternateActive
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-0 scale-[0.25] blur-[4px]'
              }`}
            >
              <Icon name={alternateIcon} size={16} />
            </span>
          </>
        ) : (
          <Icon name={icon} size={16} />
        )}
      </span>
    </button>
  )
}
