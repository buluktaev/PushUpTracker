'use client'

import type { ButtonHTMLAttributes } from 'react'
import Icon from '@/components/Icon'

interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
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
  type = 'button',
  ...buttonProps
}: TabProps) {
  const isMobile = platform === 'mobile'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex transition-colors duration-100 ${isMobile ? 'flex-col px-3 py-0' : 'h-full gap-1.5 px-5'} ${className}`}
      style={{
        minWidth: isMobile ? 'var(--tab-mobile-min-width)' : undefined,
        minHeight: isMobile ? undefined : 'var(--tab-height-44)',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'var(--accent-default)' : 'var(--text-secondary)',
        borderBottom: 'none',
        backgroundColor: 'transparent',
      }}
      {...buttonProps}
    >
      <span className={isMobile ? 'flex items-center p-1' : 'flex items-center'} style={{ color: active ? 'var(--accent-default)' : 'var(--icon-default)' }}>
        <Icon name={icon} size={16} />
      </span>
      <span
        className={isMobile ? 'px-1 py-[3px] text-[14px] font-normal leading-[22px] tracking-[0]' : 'text-[14px] font-normal leading-[22px] tracking-[0]'}
      >
        {label}
      </span>
    </button>
  )
}
