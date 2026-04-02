import type { CSSProperties, HTMLAttributes } from 'react'

interface RevealSectionProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number
}

export default function RevealSection({
  delay = 0,
  className = '',
  style,
  children,
  ...props
}: RevealSectionProps) {
  const resolvedStyle = {
    ...style,
    ['--reveal-delay' as const]: `${delay}ms`,
  } as CSSProperties

  return (
    <div className={`reveal-section ${className}`.trim()} style={resolvedStyle} {...props}>
      {children}
    </div>
  )
}
