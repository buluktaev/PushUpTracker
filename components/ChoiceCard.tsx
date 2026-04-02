'use client'

import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import RadioButton from '@/components/RadioButton'

interface ChoiceCardProps {
  title: string
  icon: string
  selected?: boolean
  state?: 'default' | 'hovered' | 'selected'
  className?: string
  onClick?: () => void
}

export default function ChoiceCard({
  title,
  icon,
  selected = false,
  state,
  className = '',
  onClick,
}: ChoiceCardProps) {
  const [interactionState, setInteractionState] = useState<'default' | 'hovered'>('default')

  function canUseHover(pointerType?: string) {
    return pointerType === 'mouse'
  }

  useEffect(() => {
    if (!selected) {
      setInteractionState('default')
    }
  }, [selected])

  const resolvedState = selected ? 'selected' : state ?? interactionState
  const isSelected = resolvedState === 'selected'
  const borderColor =
    resolvedState === 'default' ? 'var(--border-primary-default)' : 'var(--accent-default)'
  const iconColor = isSelected ? 'var(--accent-default)' : 'var(--icon-default)'

  return (
    <button
      type="button"
      onClick={() => {
        if (state === undefined) {
          setInteractionState('default')
        }
        onClick?.()
      }}
      onMouseLeave={() => {
        if (!selected && state === undefined) {
          setInteractionState('default')
        }
      }}
      onPointerEnter={(event) => {
        if (!selected && state === undefined && canUseHover(event.pointerType)) {
          setInteractionState('hovered')
        }
      }}
      onPointerLeave={() => {
        if (!selected && state === undefined) {
          setInteractionState('default')
        }
      }}
      onPointerUp={() => {
        if (!selected && state === undefined) {
          setInteractionState('default')
        }
      }}
      onPointerCancel={() => {
        if (!selected && state === undefined) {
          setInteractionState('default')
        }
      }}
      onBlur={() => {
        if (!selected && state === undefined) {
          setInteractionState('default')
        }
      }}
      className={`inline-flex h-12 items-center gap-2 px-3 text-left transition-colors duration-100 ${className}`}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'var(--surface)',
        border: `1px solid ${borderColor}`,
        color: 'var(--text-primary)',
      }}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden p-1"
        style={{ color: iconColor }}
      >
        <Icon name={icon} size={16} style={{ width: 'var(--icon-size-16)', height: 'var(--icon-size-16)' }} />
      </span>
      <span
        className="min-w-0 flex-1 text-[var(--size-14)] font-normal leading-[var(--line-height-22)] tracking-[var(--letter-spacing-0)]"
      >
        {title}
      </span>
      <RadioButton
        active={isSelected}
        state={isSelected ? 'default' : resolvedState === 'hovered' ? 'hovered' : 'default'}
        decorative
        className="shrink-0"
      />
    </button>
  )
}
