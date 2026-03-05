interface Props {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function Icon({ name, size = 20, className = '', style }: Props) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 20",
        ...style,
      }}
    >
      {name}
    </span>
  )
}
