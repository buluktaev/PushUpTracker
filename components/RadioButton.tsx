'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface RadioButtonProps {
  active?: boolean
  state?: 'default' | 'hovered' | 'pressed'
  disabled?: boolean
  decorative?: boolean
  label?: boolean
  labelText?: string
  className?: string
}

function getRadioStroke({
  active,
  state,
  disabled,
}: Pick<RadioButtonProps, 'active' | 'state' | 'disabled'>) {
  if (disabled) {
    return active ? 'var(--text-disabled)' : 'var(--border-disabled)'
  }

  if (active) {
    if (state === 'hovered') return 'var(--accent-hovered)'
    if (state === 'pressed') return 'var(--accent-pressed)'
    return 'var(--accent-default)'
  }

  if (state === 'hovered') return 'var(--border-primary-hovered)'
  if (state === 'pressed') return 'var(--border-primary-pressed)'
  return 'var(--border-primary-default)'
}

function RadioGlyph({
  active,
  state,
  disabled,
}: Pick<RadioButtonProps, 'active' | 'state' | 'disabled'>) {
  const stroke = getRadioStroke({ active, state, disabled })

  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-6 w-6 shrink-0"
      >
        {active ? (
          <circle cx="12" cy="12" r="6" stroke={stroke} strokeWidth="4" />
        ) : (
          <circle cx="12" cy="12" r="7.5" stroke={stroke} />
        )}
      </svg>
    </span>
  )
}

export default function RadioButton({
  active = false,
  state = 'default',
  disabled = false,
  decorative = false,
  label = false,
  labelText = 'radio text',
  className = '',
}: RadioButtonProps) {
  const glyph = <RadioGlyph active={active} state={state} disabled={disabled} />

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {decorative ? (
        glyph
      ) : (
        <RadioGroup
          value={active ? 'selected' : ''}
          disabled={disabled}
          className="inline-flex gap-0"
          aria-label={label ? labelText : 'radio button'}
        >
          <RadioGroupItem
            value="selected"
            disabled={disabled}
            className="h-6 w-6 rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-[var(--accent-default)] focus-visible:ring-offset-0"
          >
            {glyph}
          </RadioGroupItem>
        </RadioGroup>
      )}

      {label ? (
        <span
          className="text-[var(--size-16)] font-normal leading-[var(--line-height-24)] tracking-[var(--letter-spacing-0)]"
          style={{ color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)' }}
        >
          {labelText}
        </span>
      ) : null}
    </span>
  )
}
