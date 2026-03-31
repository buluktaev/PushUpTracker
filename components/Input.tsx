'use client'

import Icon from '@/components/Icon'

interface InputProps {
  label: string
  value?: string
  placeholder?: string
  error?: boolean
  disabled?: boolean
  state?: 'default' | 'hovered' | 'focused' | 'disabled'
  required?: boolean
  caption?: string
  icon?: string
  type?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  className?: string
  id?: string
}

export default function Input({
  label,
  value,
  placeholder,
  error = false,
  disabled = false,
  state = 'default',
  required = false,
  caption,
  icon,
  type = 'text',
  onChange,
  onKeyDown,
  autoFocus,
  className = '',
  id,
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const resolvedState = disabled ? 'disabled' : state
  const hasValue = typeof value === 'string' && value.length > 0

  let wrapperBorderColor = 'var(--border-primary-default)'
  if (resolvedState === 'disabled') {
    wrapperBorderColor = 'var(--border-disabled)'
  } else if (resolvedState === 'hovered' || resolvedState === 'focused') {
    wrapperBorderColor = 'var(--accent-default)'
  } else if (error) {
    wrapperBorderColor = 'var(--status-danger-default)'
  }

  const labelColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--text-secondary)'
  const requiredColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--accent-default)'
  const inputTextColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : hasValue ? 'var(--text-primary)' : 'var(--text-secondary)'
  const captionText = caption ?? (error ? '!поле обязательно для заполнения' : undefined)

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: 'var(--space-6)' }}>
      <label
        htmlFor={inputId}
        className="inline-flex items-start gap-1 text-[var(--size-12)] font-normal leading-[var(--line-height-18)] tracking-[var(--letter-spacing-0)]"
        style={{ color: labelColor }}
      >
        <span>{label}</span>
        {required ? <span style={{ color: requiredColor }}>*</span> : null}
      </label>

      <div
        className="relative"
        style={{
          border: `1px solid ${wrapperBorderColor}`,
          backgroundColor: 'var(--surface)',
        }}
      >
        <div className="flex min-h-[var(--control-height-40)] items-center p-[var(--space-8)]">
          <div className="flex min-w-0 flex-1 items-center px-1">
            <input
              id={inputId}
              type={type}
              value={value}
              placeholder={placeholder}
              disabled={resolvedState === 'disabled'}
              autoFocus={autoFocus}
              onChange={onChange}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent text-[var(--size-16)] font-normal leading-[var(--line-height-24)] tracking-[var(--letter-spacing-0)] outline-none"
              style={{ color: inputTextColor }}
            />
          </div>
          {icon ? (
            <span className="inline-flex h-6 w-6 items-center justify-center p-1" style={{ color: inputTextColor }}>
              <Icon name={icon} size={16} />
            </span>
          ) : null}
        </div>
      </div>

      <style>{`
        #${inputId}::placeholder {
          color: ${resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--text-secondary)'};
        }
      `}</style>

      {captionText ? (
        <p
          className="text-[var(--size-12)] font-normal leading-[var(--line-height-18)] tracking-[var(--letter-spacing-0)]"
          style={{ color: 'var(--status-danger-default)' }}
        >
          {captionText}
        </p>
      ) : null}
    </div>
  )
}
