'use client'

interface InputProps {
  label: string
  value?: string
  placeholder?: string
  error?: boolean
  disabled?: boolean
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
  type = 'text',
  onChange,
  onKeyDown,
  autoFocus,
  className = '',
  id,
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  // Border color logic (priority: disabled > error > default; hover/focus override via CSS)
  let wrapperBorderColor: string
  if (disabled) {
    wrapperBorderColor = '#E8E6E1' // border/disabled
  } else if (error) {
    wrapperBorderColor = '#EF4444' // border/danger
  } else {
    wrapperBorderColor = '#E5E5E5' // border/primary-default
  }

  const labelColor = disabled ? '#A1A1A1' : '#737373' // text/disabled : text/secondary
  const inputTextColor = disabled ? '#A1A1A1' : '#262626' // text/disabled : text/primary

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: 6 }}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className="text-xs font-normal leading-[18px] uppercase tracking-[1.5px]"
        style={{ color: labelColor }}
      >
        {label}
      </label>

      {/* Input wrapper — handles hover/focus border color via group */}
      <div
        className={`group relative ${disabled ? '' : 'hover:[--wrapper-border:#FE4711] focus-within:[--wrapper-border:#FE4711]'}`}
        style={{
          border: `1px solid var(--wrapper-border, ${wrapperBorderColor})`,
          // When error and not disabled: default shows danger, hover/focus shows accent
          // CSS custom property trick handles the override above via Tailwind
        }}
      >
        <input
          id={inputId}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent outline-none text-base font-normal leading-6"
          style={{
            padding: '8px 12px',
            color: inputTextColor,
            backgroundColor: '#FFFFFF', // bg/surface
            // Placeholder color via CSS
          }}
        />
        <style>{`
          #${inputId}::placeholder {
            color: ${disabled ? '#A1A1A1' : '#737373'};
          }
        `}</style>
      </div>
    </div>
  )
}
