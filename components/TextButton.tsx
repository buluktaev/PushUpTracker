'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'
import Loader from '@/components/Loader'

type TextButtonVariant = 'primary' | 'secondary' | 'danger'
type TextButtonSize = 'default' | 'compact'

interface TextButtonProps {
  children: React.ReactNode
  variant?: TextButtonVariant
  size?: TextButtonSize
  state?: 'default' | 'hovered' | 'pressed'
  disabled?: boolean
  loading?: boolean
  icon?: string
  showIcon?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  as?: 'button' | 'span'
}

export default function TextButton({
  children,
  variant = 'primary',
  size = 'default',
  state,
  disabled = false,
  loading = false,
  icon,
  showIcon,
  onClick,
  className = '',
  type = 'button',
  as = 'button',
}: TextButtonProps) {
  const [interactionState, setInteractionState] = useState<'default' | 'hovered' | 'pressed'>('default')
  const isInactive = disabled || loading
  const resolvedState = state ?? interactionState
  const shouldShowIcon = !loading && (showIcon ?? Boolean(icon))
  const resolvedIcon = icon ?? 'arrow_left'

  let color = 'var(--text-disabled)'

  if (!isInactive) {
    if (variant === 'primary') {
      color =
        resolvedState === 'hovered'
          ? 'var(--accent-hovered)'
          : resolvedState === 'pressed'
            ? 'var(--accent-pressed)'
            : 'var(--accent-default)'
    }
    if (variant === 'secondary') {
      color = 'var(--text-primary)'
    }
    if (variant === 'danger') {
      color =
        resolvedState === 'hovered'
          ? 'var(--status-danger-hovered)'
          : resolvedState === 'pressed'
            ? 'var(--status-danger-pressed)'
            : 'var(--status-danger-default)'
    }
  }

  const heightClass = size === 'compact' ? 'h-6' : 'h-[var(--control-height-40)]'
  const sharedClassName = `inline-flex ${heightClass} items-center justify-center gap-1 px-0 text-[var(--size-16)] font-normal lowercase leading-[var(--line-height-24)] tracking-[var(--letter-spacing-0)] transition-colors duration-100 ${className}`
  const sharedStyle = {
    color,
    boxSizing: 'border-box' as const,
  }

  const content = (
    <>
      {loading ? (
        <span className="inline-flex h-4 w-4 items-center justify-center p-1">
          <Loader size={16} color="currentColor" />
        </span>
      ) : null}
      {shouldShowIcon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center p-1">
          <Icon name={resolvedIcon} size={16} />
        </span>
      ) : null}
      {!loading ? <span>{children}</span> : null}
    </>
  )

  if (as === 'span') {
    return (
      <span
        className={sharedClassName}
        style={sharedStyle}
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
      >
        {content}
      </span>
    )
  }

  return (
    <button
      type={type}
      disabled={isInactive}
      onClick={isInactive ? undefined : onClick}
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
      className={sharedClassName}
      style={sharedStyle}
    >
      {content}
    </button>
  )
}
