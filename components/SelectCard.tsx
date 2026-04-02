'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'

interface SelectCardProps {
  title: string
  icon: string
  state?: 'default' | 'hovered' | 'selected'
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export default function SelectCard({
  title,
  icon,
  state,
  disabled = false,
  className = '',
  onClick,
}: SelectCardProps) {
  const [interactionState, setInteractionState] = useState<'default' | 'hovered'>('default')
  const isInactive = disabled
  const resolvedState = isInactive ? 'default' : state ?? interactionState
  const borderColor =
    resolvedState === 'default'
      ? 'var(--border-primary-default)'
      : 'var(--accent-default)'
  const iconColor = isInactive
    ? 'var(--icon-disabled)'
    : resolvedState === 'selected'
      ? 'var(--accent-default)'
      : 'var(--icon-default)'

  return (
    <button
      type="button"
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
      onPointerCancel={() => {
        if (!isInactive && state === undefined) {
          setInteractionState('default')
        }
      }}
      className={`inline-flex h-12 items-start gap-2 px-3 py-3 text-left transition-colors duration-100 ${className}`}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'var(--surface)',
        border: `1px solid ${borderColor}`,
        color: isInactive ? 'var(--text-disabled)' : 'var(--text-primary)',
        cursor: isInactive ? 'default' : 'pointer',
        pointerEvents: isInactive ? 'none' : undefined,
      }}
    >
      <span
        className="inline-flex shrink-0 items-start justify-center overflow-hidden p-1"
        style={{ color: iconColor }}
      >
        <Icon name={icon} size={16} style={{ width: 'var(--icon-size-16)', height: 'var(--icon-size-16)' }} />
      </span>
      <span
        className="min-w-0 flex-1 py-px text-[var(--size-14)] font-normal leading-[var(--line-height-22)] tracking-[var(--letter-spacing-0)]"
      >
        {title}
      </span>
      <span
        className="inline-flex shrink-0 items-center p-1"
        style={{ color: iconColor }}
      >
        <Icon name="arrow_right" size={16} style={{ width: 'var(--icon-size-16)', height: 'var(--icon-size-16)' }} />
      </span>
    </button>
  )
}
