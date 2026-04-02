import { PreviewIcon as Icon } from './PreviewIcon'
import { getExerciseConfig } from '@/lib/exerciseConfigs'

interface CameraPreviewProps {
  state: 'off' | 'searching' | 'countdown' | 'active' | 'hold' | 'saving'
  count?: number
  elapsed?: number
  holdProgress?: number
  discipline?: string
}

const HORIZONTAL_POSITION_LABEL = 'займите горизонтальное положение'
const HORIZONTAL_POSITION_LABEL_MOBILE = 'займите гор. положение'

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  off: { text: 'камера выключена', color: 'var(--status-warning-default)' },
  searching: { text: 'поиск позы', color: 'var(--status-warning-default)' },
  countdown: { text: 'приготовьтесь', color: 'var(--status-warning-default)' },
  active: { text: 'угол: 120°', color: 'var(--accent-default)' },
  hold: { text: 'держите позицию', color: 'var(--status-success-default)' },
  saving: { text: 'сохранение', color: 'var(--text-secondary)' },
}

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function CameraPreview({
  state,
  count = 0,
  elapsed = 0,
  holdProgress = 0,
  discipline = 'pushups',
}: CameraPreviewProps) {
  const config = getExerciseConfig(discipline)
  const isHoldMode = config?.mode === 'hold'

  const status = STATUS_MAP[state] ?? STATUS_MAP.off
  const cameraOn = state !== 'off'
  const isCountdown = state === 'countdown'
  const isActive = state === 'active' || state === 'hold'
  const isSaving = state === 'saving'
  const isHolding = state === 'hold'
  const showSessionControls = cameraOn
  const counterTextStyle = {
    fontFamily: 'var(--font-family-secondary)',
    fontWeight: 500,
    fontSize: 72,
    lineHeight: '80px',
    textShadow: '0 4px 8px rgba(180,180,180,0.8)',
  } as const
  const elapsedTextStyle = {
    fontFamily: 'var(--font-family-secondary)',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '24px',
    color: 'var(--text-on-accent)',
    textShadow: '0 4px 8px rgba(180,180,180,0.8)',
  } as const
  const controlButtonLabel = isCountdown
    ? 'Отмена'
    : !isActive && !isSaving
      ? 'Начать сессию'
      : isSaving
        ? 'Сохраняем...'
        : isHolding
          ? 'удерживайте...'
          : 'закончить сессию'
  const statusBadgeTone = !cameraOn
    ? { color: 'var(--accent-default)' }
    : status.color === 'var(--status-success-default)'
      ? { color: status.color }
      : { color: 'var(--status-warning-default)' }
  const isIdleCameraState = cameraOn && !isCountdown && !isActive && !isSaving
  const displayStatus = isIdleCameraState
    ? {
        text: HORIZONTAL_POSITION_LABEL,
        color: 'var(--status-warning-default)',
      }
    : {
        text: status.text,
        color: statusBadgeTone.color,
      }

  return (
    <div className="camera-wrapper mx-auto w-full max-w-[1024px]">

      {/* Camera container */}
      <div
        className="camera-container relative mx-auto w-full max-w-[1024px] aspect-[3/4] overflow-hidden bg-[#171717] p-4 app-web:aspect-[4/3]"
        style={{
          borderRadius: 0,
          transition: 'none',
        }}
      >
        {/* Status badge — top left */}
        <div
          className="absolute left-4 top-4 flex items-center pl-1 pr-2"
          style={{ background: 'var(--surface)', borderRadius: 0 }}
        >
          <span className="flex h-6 items-center justify-center px-1">
            <span className="h-1.5 w-1.5 shrink-0" style={{ background: displayStatus.color }} />
          </span>
          <span className="py-[3px] text-[12px] leading-[18px]" style={{ color: displayStatus.color }}>
            {displayStatus.text === HORIZONTAL_POSITION_LABEL ? (
              <>
                <span className="app-mobile:inline app-web:hidden">{HORIZONTAL_POSITION_LABEL_MOBILE}</span>
                <span className="hidden app-web:inline">{HORIZONTAL_POSITION_LABEL}</span>
              </>
            ) : (
              displayStatus.text
            )}
          </span>
        </div>

        {/* Counter overlay — bottom center */}
        {cameraOn && (isCountdown || isActive) && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="text-white tabular-nums"
              style={counterTextStyle}
            >
              {isCountdown ? count : String(count).padStart(2, '0')}
            </div>
            {(isActive) && (
              <div
                className="tabular-nums"
                style={elapsedTextStyle}
              >
                {fmt(elapsed)}
              </div>
            )}
          </div>
        )}

        {/* Disable camera — top right */}
        {cameraOn && !isActive && !isSaving && (
          <button
            className="absolute right-4 top-4 flex items-center pl-1 pr-2 text-[var(--text-secondary)] transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface)', borderRadius: 0 }}
          >
            <span className="flex h-6 items-center justify-center pr-1">
              <Icon name="photo_camera" size={16} />
            </span>
            <span className="py-[3px] text-[12px] leading-[18px]">отключить камеру</span>
          </button>
        )}

        {/* Enable camera — center */}
        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="flex h-[72px] w-[140px] flex-col items-center justify-center bg-[var(--accent-default)] p-3 text-white transition-opacity hover:opacity-80"
              style={{ borderRadius: 0 }}
            >
              <div className="relative shrink-0 p-1">
                <Icon name="photo_camera" size={16} />
              </div>
              <div className="flex items-center justify-center px-[10px] py-[3px]">
                <span className="text-[12px] leading-[18px]">включить камеру</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Session controls */}
      {showSessionControls ? (
        <div className="mt-4 px-4 app-web:mt-2 app-web:px-0">
          {isCountdown ? (
            <button
              className="h-10 w-full text-[16px] leading-6 font-normal text-[var(--text-primary)] hover:opacity-60 transition-opacity"
              style={{ background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--border-primary-default)' }}
            >
              отмена
            </button>
          ) : isActive ? (
            <button
              disabled={isSaving}
              className="relative h-10 w-full overflow-hidden select-none text-[16px] font-normal leading-6 text-white disabled:opacity-40"
              style={{ background: 'var(--accent-default)', touchAction: 'none' }}
            >
              <span
                className="absolute inset-0 bg-white/20 origin-left"
                style={{ transform: `scaleX(${holdProgress})`, transition: 'none' }}
              />
              <span className="relative">{controlButtonLabel}</span>
            </button>
          ) : isSaving ? (
            <button
              disabled
              className="w-full py-3 text-sm font-normal text-[var(--muted)] ring-1 ring-inset ring-[var(--border)] disabled:opacity-60"
            >
              {controlButtonLabel}
            </button>
          ) : (
            <button
              className="h-10 w-full text-[16px] leading-6 font-normal text-white hover:opacity-85 transition-opacity"
              style={{ background: 'var(--accent-default)' }}
            >
              начать сессию
            </button>
          )}
        </div>
      ) : (
        null
      )}

    </div>
  )
}
