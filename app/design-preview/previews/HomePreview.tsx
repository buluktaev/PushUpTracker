import { PreviewIcon as Icon } from './PreviewIcon'
import ThemeToggle from '@/components/ThemeToggle'
import { exerciseConfigs } from '@/lib/exerciseConfigs'

interface HomePreviewProps {
  mode: 'menu' | 'create' | 'pick-discipline' | 'join'
  rooms?: Array<{ roomCode: string; roomName: string }>
  roomName?: string
  joinCode?: string
  selectedDiscipline?: string | null
  error?: string
  loading?: boolean
  showNew?: boolean
}

export default function HomePreview({
  mode,
  rooms = [],
  roomName = '',
  joinCode = '',
  selectedDiscipline = null,
  error = '',
  loading = false,
  showNew = false,
}: HomePreviewProps) {
  const showForms = rooms.length === 0 || showNew

  return (
    <main className="relative min-h-[700px] flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="absolute top-3 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icon.svg" width={20} height={20} alt="" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              {'// pushup tracker'}
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-[1.15] tracking-tight">
            Командный<br />трекер отжиманий
          </h1>
          <p className="text-xs text-[var(--muted)] mt-2.5">
            создай комнату или войди по коду
          </p>
        </div>

        {/* Room list */}
        {rooms.length >= 1 && (
          <div className="flex flex-col gap-1.5 mb-2">
            {rooms.map(room => (
              <div
                key={room.roomCode}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-[var(--text)] bg-[var(--surface)] hover:border-[var(--accent-default)] transition-colors cursor-pointer"
                style={{ border: '1px solid var(--border)' }}
              >
                <span className="font-medium truncate">{room.roomName}</span>
                <Icon name="arrow_forward" size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              </div>
            ))}

            {/* new_room() toggle button */}
            <button
              className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] tracking-wide text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors mt-1"
              style={{ border: '1px solid var(--border)' }}
            >
              <span>new_room()</span>
              <Icon name={showNew ? 'expand_less' : 'expand_more'} size={16} />
            </button>
          </div>
        )}

        {/* Create/Join forms */}
        {showForms && (
          <>
            {mode === 'menu' && (
              <div className="flex flex-col gap-2">
                <button
                  className="w-full py-3 text-sm font-normal text-white bg-[var(--accent-default)] hover:opacity-85 transition-opacity"
                >
                  create_room()
                </button>
                <button
                  className="w-full py-3 text-sm font-normal border text-[var(--text)] bg-[var(--surface)] hover:border-[var(--accent-default)] transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                >
                  join_room()
                </button>
              </div>
            )}

            {mode === 'create' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="room-name" className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
                    room_name =
                  </label>
                  <input
                    id="room-name"
                    type="text"
                    placeholder="команда_альфа"
                    defaultValue={roomName}
                    className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent-default)] transition-colors"
                    style={{ border: '1px solid var(--border)' }}
                    readOnly
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-[#ef4444]">! {error}</p>
                )}
                <button
                  disabled={!roomName.trim()}
                  className="w-full py-3 text-sm font-normal text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  next()
                </button>
                <button
                  className="text-xs text-[var(--muted)] hover:text-[var(--accent-default)] transition-colors text-left"
                >
                  ← back
                </button>
              </div>
            )}

            {mode === 'pick-discipline' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
                    discipline =
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {exerciseConfigs.map(d => (
                      <button
                        key={d.slug}
                        type="button"
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 text-xs transition-colors ${
                          selectedDiscipline === d.slug
                            ? 'text-white bg-[var(--accent-default)] ring-1 ring-inset ring-[var(--accent-default)]'
                            : 'text-[var(--text)] bg-[var(--surface)] ring-1 ring-inset ring-[var(--border)] hover:ring-[var(--accent-default)]'
                        }`}
                      >
                        <Icon name={d.icon} size={20} />
                        <span className="text-center leading-tight">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {error && (
                  <p className="text-[11px] text-[#ef4444]">! {error}</p>
                )}
                <button
                  disabled={loading || !selectedDiscipline}
                  className="w-full py-3 text-sm font-normal text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  {loading ? '// выполняем...' : 'execute()'}
                </button>
                <button
                  className="text-xs text-[var(--muted)] hover:text-[var(--accent-default)] transition-colors text-left"
                >
                  ← back
                </button>
              </div>
            )}

            {mode === 'join' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="join-code" className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
                    room_code =
                  </label>
                  <input
                    id="join-code"
                    type="text"
                    placeholder="ABC123"
                    defaultValue={joinCode}
                    maxLength={6}
                    className="w-full px-3 py-2.5 text-sm tracking-[0.25em] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent-default)] transition-colors"
                    style={{ border: '1px solid var(--border)' }}
                    readOnly
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-[#ef4444]">! {error}</p>
                )}
                <button
                  disabled={loading}
                  className="w-full py-3 text-sm font-normal text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  {loading ? '// входим...' : 'execute()'}
                </button>
                <button
                  className="text-xs text-[var(--muted)] hover:text-[var(--accent-default)] transition-colors text-left"
                >
                  ← back
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  )
}
