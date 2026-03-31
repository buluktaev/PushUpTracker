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
        padding: '12px 16px',
        gap: 8,
        borderRadius: 0,
        backgroundColor: selected ? '#FE4711' : '#FFFFFF', // accent/default : bg/surface
        border: selected ? 'none' : '1px solid #E5E5E5',   // none : border/primary-default
        color: selected ? '#FFFFFF' : '#262626',            // text/on-accent : text/primary
        // Hover border handled below via CSS variable trick
      }}
      // Hover: border changes to accent (#FE4711) only when not selected
      onMouseEnter={
        !selected
          ? (e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                '#FE4711' // border/accent
            }
          : undefined
      }
      onMouseLeave={
        !selected
          ? (e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                '#E5E5E5' // border/primary-default
            }
          : undefined
      }
    >
      {/* Icon wrapper: 16x16 centered */}
      <span
        className="flex items-center justify-center"
        style={{
          width: 16,
          height: 16,
          color: selected ? '#FFFFFF' : 'inherit',
        }}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className="text-sm font-normal leading-[22px] text-center"
        style={{ color: 'inherit' }}
      >
        {name}
      </span>
    </button>
  )
}
