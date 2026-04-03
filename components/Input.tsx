'use client'

import { useRef, useState } from 'react'
import Icon from '@/components/Icon'

export const INPUT_LABEL_TEXT_CLASSNAME =
  'text-[12px] font-normal leading-[18px] tracking-[0px] whitespace-nowrap'
export const INPUT_LABEL_DEFAULT_COLOR = 'var(--text-secondary)'

interface InputProps {
  label: string
  value?: string
  placeholder?: string
  autoComplete?: string
  textVariant?: 'default' | 'code'
  maxLength?: number
  error?: boolean
  disabled?: boolean
  state?: 'default' | 'hovered' | 'focused' | 'disabled'
  required?: boolean
  caption?: string
  icon?: string
  showIcon?: boolean
  showCaption?: boolean
  passwordVisible?: boolean
  type?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  className?: string
  id?: string
}

export default function Input({
  label,
  value,
  placeholder,
  autoComplete,
  textVariant = 'default',
  maxLength,
  error = false,
  disabled = false,
  state,
  required = false,
  caption,
  icon,
  showIcon,
  showCaption = true,
  passwordVisible,
  type = 'text',
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  autoFocus,
  className = '',
  id,
}: InputProps) {
  const [interactionState, setInteractionState] = useState<'default' | 'hovered' | 'focused'>('default')
  const [isPasswordVisible, setIsPasswordVisible] = useState(Boolean(passwordVisible))
  const inputRef = useRef<HTMLInputElement>(null)

  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const resolvedState = disabled ? 'disabled' : state ?? interactionState
  const hasValue = typeof value === 'string' && value.length > 0
  const isPasswordField = type === 'password'

  let wrapperBorderColor = 'var(--border-primary-default)'
  if (resolvedState === 'disabled') {
    wrapperBorderColor = 'var(--border-disabled)'
  } else if (error) {
    wrapperBorderColor = 'var(--status-danger-default)'
  } else if (resolvedState === 'hovered' || resolvedState === 'focused') {
    wrapperBorderColor = 'var(--accent-default)'
  }

  const labelColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--text-secondary)'
  const requiredColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--accent-default)'
  const inputTextColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : hasValue ? 'var(--text-primary)' : 'var(--text-secondary)'
  const autofillTextColor = resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--text-primary)'
  const captionText = showCaption ? caption ?? (error ? '!поле обязательно для заполнения' : undefined) : undefined
  const shouldShowIcon = isPasswordField ? true : (showIcon ?? Boolean(icon))
  const resolvedPasswordVisible = passwordVisible ?? isPasswordVisible
  const resolvedIcon = isPasswordField
    ? (resolvedPasswordVisible ? 'eye_open' : 'eye_close')
    : (icon ?? 'person')
  const resolvedInputType = isPasswordField ? (resolvedPasswordVisible ? 'text' : 'password') : type
  const isMaskedPassword = isPasswordField && hasValue && !resolvedPasswordVisible
  const isCodeInput = textVariant === 'code' && hasValue
  const inputFontFamily = isCodeInput ? 'var(--font-family-secondary)' : 'var(--font-family-primary)'
  const inputLetterSpacing = isCodeInput ? '3.5px' : undefined
  const inputTextTransform = isCodeInput ? 'uppercase' : undefined
  const inputStyle = {
    color: inputTextColor,
    fontFamily: inputFontFamily,
    letterSpacing: inputLetterSpacing,
    textTransform: inputTextTransform,
  }

  const syncBrowserFilledValue = (nextValue: string) => {
    if (!onChange || nextValue === (value ?? '')) {
      return
    }

    onChange({
      target: { value: nextValue },
      currentTarget: { value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: 'var(--space-6)' }}>
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-1 ${INPUT_LABEL_TEXT_CLASSNAME}`}
        style={{ color: labelColor, fontFamily: 'var(--font-primary)', fontWeight: 'var(--weight-400)' }}
      >
        <span>{label}</span>
        {required ? <span style={{ color: requiredColor }}>*</span> : null}
      </label>

      <div
        className="relative"
        onMouseEnter={() => {
          if (!disabled && state === undefined && interactionState !== 'focused') {
            setInteractionState('hovered')
          }
        }}
        onMouseLeave={() => {
          if (!disabled && state === undefined && interactionState !== 'focused') {
            setInteractionState('default')
          }
        }}
        style={{
          height: 'var(--control-height-40)',
          backgroundColor: 'var(--surface)',
          border: `1px solid ${wrapperBorderColor}`,
        }}
      >
        <div className="flex h-full items-center px-[var(--space-8)]">
          <div className="flex min-w-0 flex-1 items-center px-1">
            <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              id={inputId}
              type={resolvedInputType}
              value={value}
              placeholder={placeholder}
              autoComplete={autoComplete}
              maxLength={maxLength}
              disabled={resolvedState === 'disabled'}
              autoFocus={autoFocus}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={(event) => {
                if (!disabled && state === undefined) {
                  setInteractionState('focused')
                }
                syncBrowserFilledValue(event.currentTarget.value)
                onFocus?.(event)
              }}
              onBlur={(event) => {
                if (!disabled && state === undefined) {
                  setInteractionState('default')
                }
                syncBrowserFilledValue(event.currentTarget.value)
                onBlur?.(event)
              }}
              onAnimationStart={(event) => {
                if (event.animationName === 'codex-input-autofill-start') {
                  syncBrowserFilledValue(event.currentTarget.value)
                }
              }}
              className="w-full bg-transparent text-[var(--size-16)] font-normal leading-[var(--line-height-24)] tracking-[var(--letter-spacing-0)] outline-none"
              style={inputStyle}
            />
            </div>
          </div>
          {shouldShowIcon ? (
            isPasswordField ? (
              <button
                type="button"
                disabled={resolvedState === 'disabled'}
                aria-label={resolvedPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                onMouseDown={(event) => {
                  if (resolvedState !== 'disabled') {
                    event.preventDefault()
                    syncBrowserFilledValue(inputRef.current?.value ?? '')
                  }
                }}
                onClick={() => {
                  if (resolvedState !== 'disabled') {
                    setIsPasswordVisible(prev => !prev)
                  }
                }}
                className="relative inline-flex h-6 w-6 items-center justify-center p-1"
                style={{ color: inputTextColor }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                    resolvedPasswordVisible
                      ? 'opacity-0 scale-[0.25] blur-[4px]'
                      : 'opacity-100 scale-100 blur-0'
                  }`}
                >
                  <Icon name="eye_close" size={16} />
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                    resolvedPasswordVisible
                      ? 'opacity-100 scale-100 blur-0'
                      : 'opacity-0 scale-[0.25] blur-[4px]'
                  }`}
                >
                  <Icon name="eye_open" size={16} />
                </span>
              </button>
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center p-1" style={{ color: inputTextColor }}>
                <Icon name={resolvedIcon} size={16} />
              </span>
            )
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes codex-input-autofill-start {
          from {}
          to {}
        }

        #${inputId}::placeholder {
          color: ${resolvedState === 'disabled' ? 'var(--text-disabled)' : 'var(--text-secondary)'};
        }

        #${inputId}:-webkit-autofill,
        #${inputId}:-webkit-autofill:hover,
        #${inputId}:-webkit-autofill:focus,
        #${inputId}:-webkit-autofill:active {
          animation-name: codex-input-autofill-start;
          animation-duration: 0.01s;
          -webkit-text-fill-color: ${autofillTextColor};
          caret-color: ${autofillTextColor};
          -webkit-box-shadow: 0 0 0 1000px var(--surface) inset;
          box-shadow: 0 0 0 1000px var(--surface) inset;
          transition: background-color 9999s ease-out 0s;
        }
      `}</style>

      {captionText ? (
        <p
          className="text-[12px] font-normal leading-[18px] tracking-[var(--letter-spacing-0)]"
          style={{ color: 'var(--status-danger-default)' }}
        >
          {captionText}
        </p>
      ) : null}
    </div>
  )
}
