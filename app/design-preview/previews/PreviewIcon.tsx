import { CONTAINER_ICONS, LEGACY_PATH_ICONS, resolveIconName } from '@/lib/iconSet'

interface PreviewIconProps {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function PreviewIcon({ name, size = 20, className, style }: PreviewIconProps) {
  const resolvedName = resolveIconName(name)
  const icon = CONTAINER_ICONS[resolvedName]
  const legacyPath = LEGACY_PATH_ICONS[resolvedName]

  if (icon) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        className={className}
        style={{ display: 'inline-flex', flexShrink: 0, ...style }}
      >
        <svg
          x={icon.innerX}
          y={icon.innerY}
          width={icon.innerWidth}
          height={icon.innerHeight}
          viewBox={icon.innerViewBox}
          fill="none"
        >
          <path d={icon.path} fill="currentColor" />
        </svg>
      </svg>
    )
  }

  if (legacyPath) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={style}
      >
        <path d={legacyPath} />
      </svg>
    )
  }

  return (
    <span
      className={className}
      style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', ...style }}
    >
      {resolvedName}
    </span>
  )
}
