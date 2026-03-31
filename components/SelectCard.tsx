'use client'

import Icon from '@/components/Icon'

interface SelectCardProps {
  title: string
  icon: string
  selected?: boolean
  state?: 'default' | 'hovered' | 'selected'
  className?: string
  onClick?: () => void
}

export default function SelectCard({
  title,
  icon,
  selected = false,
  state = 'default',
  className = '',
  onClick,
}: SelectCardProps) {
  const resolvedState = selected ? 'selected' : state
  const isSelected = resolvedState === 'selected'
  const borderColor =
    resolvedState === 'default' ? 'var(--border-primary-default)' : 'var(--accent-default)'
  const iconColor = isSelected ? 'var(--accent-default)' : 'var(--icon-default)'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-start gap-2 p-3 text-left transition-colors duration-100 ${className}`}
      style={{
        width: '221px',
        backgroundColor: 'var(--surface)',
        border: `1px solid ${borderColor}`,
        color: 'var(--text-primary)',
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
