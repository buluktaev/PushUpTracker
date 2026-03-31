'use client'

import Icon from '@/components/Icon'

interface TabProps {
  label: string
  icon: string
  active?: boolean
  platform?: 'web' | 'mobile'
  className?: string
  onClick?: () => void
}

export default function Tab({
  label,
  icon,
  active = false,
  platform = 'web',
  className = '',
  onClick,
}: TabProps) {
  const isMobile = platform === 'mobile'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex transition-colors duration-100 ${isMobile ? 'flex-col gap-1 px-3 py-3' : 'gap-2 px-4'} ${className}`}
      style={{
        minWidth: isMobile ? 'var(--tab-mobile-min-width)' : undefined,
        minHeight: isMobile ? undefined : 'var(--tab-height-44)',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderBottom: isMobile ? 'none' : `1px solid ${active ? 'var(--accent-default)' : 'transparent'}`,
        backgroundColor: 'transparent',
      }}
    >
      <span style={{ color: active ? 'var(--accent-default)' : 'var(--icon-default)' }}>
        <Icon name={icon} size={16} />
      </span>
      <span
        className={isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'}
        style={{ letterSpacing: isMobile ? 'var(--letter-spacing-1)' : 'var(--letter-spacing-0)' }}
      >
        {label}
      </span>
    </button>
  )
}
