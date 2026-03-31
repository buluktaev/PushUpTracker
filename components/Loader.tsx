'use client'

import { createElement } from 'react'

if (typeof window !== 'undefined') {
  import('ldrs').then(({ square }) => {
    square.register()
  })
}

interface LoaderProps {
  size?: number
  stroke?: number
  strokeLength?: number
  bgOpacity?: number
  speed?: number
  color?: string
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

export default function Loader({
  size = 16,
  stroke = 2,
  strokeLength = 0.5,
  bgOpacity = 0.1,
  speed = 2,
  color,
  opacity = 0.56,
  className = '',
  style,
}: LoaderProps) {
  const resolvedColor = color ?? (typeof style?.color === 'string' ? style.color : 'currentColor')
  const wrapperStyle = { ...style }
  delete wrapperStyle.color

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        lineHeight: 0,
        flexShrink: 0,
        transform: 'translate(-0.5px, -0.5px)',
        color: resolvedColor,
        opacity,
        ...wrapperStyle,
      }}
    >
      {createElement('l-square', {
        size: String(size),
        stroke: String(stroke),
        color: resolvedColor,
        speed: String(speed),
        'stroke-length': String(strokeLength),
        'bg-opacity': String(bgOpacity),
      })}
    </span>
  )
}
