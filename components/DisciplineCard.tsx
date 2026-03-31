'use client'

interface DisciplineCardProps {
  icon: React.ReactNode
  name: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export default function DisciplineCard({
  icon,
  name,
  selected = false,
  onClick,
  className = '',
}: DisciplineCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center cursor-pointer transition-colors duration-100 ${className}`}
      style={{
        padding: 'var(--space-12) var(--space-16)',
        gap: 'var(--space-8)',
        borderRadius: 0,
        backgroundColor: selected ? 'var(--accent-default)' : 'var(--surface)',
        border: selected ? 'none' : '1px solid var(--border-primary-default)',
        color: selected ? 'var(--text-on-accent)' : 'var(--text-primary)',
        // Hover border handled below via CSS variable trick
      }}
      // Hover: border swaps to the semantic accent token when not selected.
      onMouseEnter={
        !selected
          ? (e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--border-accent)'
            }
          : undefined
      }
      onMouseLeave={
        !selected
          ? (e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--border-primary-default)'
            }
          : undefined
      }
    >
      {/* Icon wrapper: 16x16 centered */}
      <span
        className="flex items-center justify-center"
        style={{
          width: 'var(--icon-size-16)',
          height: 'var(--icon-size-16)',
          color: selected ? 'var(--text-on-accent)' : 'inherit',
        }}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className="text-[var(--size-14)] font-normal leading-[var(--line-height-22)] text-center"
        style={{ color: 'inherit' }}
      >
        {name}
      </span>
    </button>
  )
}
