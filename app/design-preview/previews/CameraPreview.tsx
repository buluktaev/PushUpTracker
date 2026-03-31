import { PreviewIcon as Icon } from './PreviewIcon'
import { getExerciseConfig } from '@/lib/exerciseConfigs'

interface CameraPreviewProps {
  state: 'off' | 'searching' | 'countdown' | 'active' | 'hold' | 'saving'
  count?: number
  elapsed?: number
  holdProgress?: number
  discipline?: string
}

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  off: { text: 'camera off', color: 'var(--text-secondary)' },
  searching: { text: 'searching...', color: 'var(--status-warning-default)' },
  countdown: { text: 'get ready...', color: 'var(--status-warning-default)' },
  active: { text: 'angle: 120°', color: 'var(--accent-default)' },
  hold: { text: 'hold position', color: 'var(--status-success-default)' },
  saving: { text: 'saving...', color: 'var(--text-secondary)' },
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

  const borderColor = cameraOn ? status.color : 'var(--border)'

  return (
    <div className="camera-wrapper flex flex-col gap-3 mx-auto w-full">

      {/* Camera container */}
      <div
        className="camera-container relative overflow-hidden"
        style={{
          background: '#0a0a0a',
          aspectRatio: '4/3',
          border: `1px solid ${borderColor}`,
          borderRadius: 0,
          transition: 'border-color 0.2s',
        }}
      >
        {/* Status badge — top left */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', borderRadius: 0 }}
        >
          <span className="w-1.5 h-1.5 shrink-0" style={{ background: status.color }} />
          <span style={{ color: status.color }}>[{status.text}]</span>
        </div>

        {/* Counter overlay — bottom center */}
        {cameraOn && (isCountdown || isActive) && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="font-bold text-white tabular-nums"
              style={{ fontSize: 88, lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
            >
              {isCountdown ? count : String(count).padStart(2, '0')}
            </div>
            {(isActive) && (
              <div
                className="text-base tabular-nums"
                style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}
              >
                {fmt(elapsed)}
              </div>
            )}
          </div>
        )}

        {/* Disable camera — top right */}
        {cameraOn && (
          <button
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider text-white"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', borderRadius: 0 }}
          >
            <Icon name="photo_camera" size={13} />
            off
          </button>
        )}

        {/* Enable camera — center */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <button
              className="flex flex-col items-center gap-2.5 px-8 py-5 text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent-default)', backdropFilter: 'blur(6px)', borderRadius: 0 }}
            >
              <Icon name="photo_camera" size={28} />
              <span className="text-[11px] tracking-widest">enable_camera()</span>
            </button>
          </div>
        )}
      </div>

      {/* Session controls */}
      {cameraOn ? (
        isCountdown ? (
          <button
            className="w-full py-3 text-sm font-normal hover:opacity-60 transition-opacity"
            style={{ color: 'var(--text-secondary)', boxShadow: 'inset 0 0 0 1px var(--border-primary-pressed)' }}
          >
            cancel()
          </button>
        ) : isActive ? (
          <button
            disabled={isSaving}
            className="relative w-full py-3 text-sm font-normal text-white disabled:opacity-40 overflow-hidden select-none"
            style={{ background: 'var(--status-danger-default)', touchAction: 'none' }}
          >
            <span
              className="absolute inset-0 bg-white/20 origin-left"
              style={{ transform: `scaleX(${holdProgress})`, transition: 'none' }}
            />
            <span className="relative">
              {isSaving
                ? '// сохраняем...'
                : isHolding
                ? '// удерживайте...'
                : `finish() · ${isHoldMode ? fmt(count) : count + ' reps'}`}
            </span>
          </button>
        ) : isSaving ? (
          <button
            disabled
            className="w-full py-3 text-sm font-normal text-[var(--muted)] ring-1 ring-inset ring-[var(--border)] disabled:opacity-60"
          >
            // сохраняем...
          </button>
        ) : (
          <button
            className="w-full py-3 text-sm font-normal text-white hover:opacity-85 transition-opacity"
            style={{ background: 'var(--status-success-default)' }}
          >
            start_session()
          </button>
        )
      ) : (
        <div className="w-full py-3 text-sm" aria-hidden="true" style={{ visibility: 'hidden' }}>&nbsp;</div>
      )}

    </div>
  )
}
