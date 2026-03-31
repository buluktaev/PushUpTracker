'use client'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const isInactive = disabled || loading
  const content = loading ? '// loading...' : children

  // Base styles applied to all variants
  const base =
    'inline-flex items-center justify-center text-base leading-6 font-normal select-none transition-colors duration-100'

  // Padding: outer p-[8px] + inner px-[12px] py-[8px] collapsed = px-[20px] py-[16px]
  const padding = 'px-5 py-4'

  let variantClass = ''
  let variantStyle: React.CSSProperties = {}

  if (variant === 'primary') {
    if (isInactive) {
      variantStyle = {
        backgroundColor: '#FFC7A8', // accent/disabled
        color: '#FAFAFA',           // text/on-accent-disabled
        pointerEvents: 'none',
        cursor: 'default',
      }
      variantClass = ''
    } else {
      variantStyle = {
        backgroundColor: '#FE4711', // accent/default
        color: '#FFFFFF',           // text/on-accent
      }
      variantClass = 'hover:bg-[#FF6B35] active:bg-[#EF2C07] cursor-pointer'
    }
  } else if (variant === 'secondary') {
    if (isInactive) {
      variantStyle = {
        backgroundColor: 'transparent',
        border: '1px solid #E8E6E1', // border/disabled
        color: '#A1A1A1',            // text/disabled
        pointerEvents: 'none',
        cursor: 'default',
      }
      variantClass = ''
    } else {
      variantStyle = {
        backgroundColor: 'transparent',
        border: '1px solid #E5E5E5', // border/primary-default
        color: '#262626',            // text/primary
      }
      variantClass =
        'hover:[border-color:#D4D4D4] active:[border-color:#A1A1A1] cursor-pointer'
    }
  } else if (variant === 'danger') {
    if (isInactive) {
      variantStyle = {
        backgroundColor: '#FECACA', // danger/weak
        color: '#FAFAFA',
        pointerEvents: 'none',
        cursor: 'default',
      }
      variantClass = ''
    } else {
      variantStyle = {
        backgroundColor: '#EF4444', // danger/default
        color: '#FFFFFF',
      }
      variantClass = 'hover:bg-[#F87171] active:bg-[#DC2626] cursor-pointer'
    }
  }

  return (
    <button
      type={type}
      onClick={isInactive ? undefined : onClick}
      disabled={isInactive}
      className={`${base} ${padding} ${variantClass} ${className}`}
      style={{ borderRadius: 0, ...variantStyle }}
    >
      {content}
    </button>
  )
}
