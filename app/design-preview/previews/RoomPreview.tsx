'use client'

import { PreviewIcon as Icon } from './PreviewIcon'
import { getExerciseConfig, formatValue } from '@/lib/exerciseConfigs'
import CameraPreview from './CameraPreview'

interface Participant {
  id: string
  name: string
  totalValue: number
  sessionsCount: number
  bestSession: number
  activeToday: boolean
}

interface RoomStats {
  totalValue: number
  participantsCount: number
  sessionsCount: number
  activeToday: number
}

interface RoomData {
  name: string
  code: string
  discipline: string
  isOwner: boolean
  leaderboard: Participant[]
  stats: RoomStats
}

interface RoomPreviewProps {
  room: RoomData
  tab: 'workout' | 'leaderboard' | 'settings' | 'profile'
  currentParticipantId: string
  profileName?: string
  profileEmail?: string
  showSwitcher?: boolean
  rooms?: Array<{ roomCode: string; roomName: string }>
  // Settings states
  showDeleteConfirm?: boolean
  // Profile states
  showLogoutConfirm?: boolean
  showLeaveConfirm?: boolean
  // Camera states (for workout tab)
  cameraState?: 'off' | 'searching' | 'countdown' | 'active' | 'hold' | 'saving'
  cameraCount?: number
  cameraElapsed?: number
  cameraHoldProgress?: number
  // Layout
  isMobile?: boolean
}

export function RoomPreview({
  room,
  tab,
  currentParticipantId,
  profileName,
  profileEmail,
  showSwitcher,
  rooms = [],
  showDeleteConfirm,
  showLogoutConfirm,
  showLeaveConfirm,
  cameraState = 'off',
  cameraCount = 0,
  cameraElapsed = 0,
  cameraHoldProgress = 0,
  isMobile = false,
}: RoomPreviewProps) {
  const exerciseConfig = getExerciseConfig(room.discipline)

  const allTabs = room.isOwner
    ? (['workout', 'leaderboard', 'settings', 'profile'] as const)
    : (['workout', 'leaderboard', 'profile'] as const)

  return (
    <div className="min-h-[700px] flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg)]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:px-0 sm:py-0">

          {/* Left: room name + switcher */}
          <div className="flex items-center gap-2 min-w-0 sm:px-4 sm:py-3">
            <h1 className="font-bold text-sm truncate">{room.name}</h1>
            {exerciseConfig && (
              <span className="text-[10px] text-[var(--muted)] truncate">· {exerciseConfig.name}</span>
            )}
            <div className="relative shrink-0">
              <button
                className="flex items-center justify-center w-6 h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                style={{ border: '1px solid var(--border)' }}
                aria-label="переключить комнату"
              >
                <Icon name={showSwitcher ? 'expand_less' : 'expand_more'} size={14} />
              </button>
              {showSwitcher && (
                <div
                  className="fixed left-0 right-0 top-[49px] z-50 py-1 sm:absolute sm:top-full sm:left-0 sm:right-auto sm:min-w-[200px] sm:mt-1"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {rooms.map(r => {
                    const isCurrent = r.roomCode === room.code
                    return (
                      <div
                        key={r.roomCode}
                        className={`flex items-center transition-colors ${isCurrent ? 'bg-[var(--surface-dim)]' : 'hover:bg-[var(--surface-dim)]'}`}
                      >
                        <button
                          className={`flex-1 flex items-center gap-2 px-3 py-3 text-xs text-left min-w-0 ${isCurrent ? 'cursor-default' : ''}`}
                        >
                          <span className={`truncate ${isCurrent ? 'text-[var(--text)] font-medium' : 'text-[var(--text)]'}`}>{r.roomName}</span>
                          {isCurrent && <span className="text-[10px] tracking-wider text-[#ff6b35] shrink-0">[active]</span>}
                        </button>
                        <div className="flex items-center gap-2 pr-3 shrink-0">
                          <span className="text-[10px] text-[var(--muted)]">{r.roomCode}</span>
                          <button
                            className="flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            aria-label="скопировать код"
                          >
                            <Icon name="content_copy" size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ borderTop: '1px solid var(--border)' }} className="mt-1 pt-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 text-xs text-[#ff6b35] hover:bg-[var(--surface-dim)] transition-colors text-left">
                    <Icon name="add" size={14} />
                    <span>add_room()</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: tabs (desktop only) */}
          <nav className={`${isMobile ? 'hidden' : 'flex'} items-stretch`} role="tablist">
            {allTabs.map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`px-5 text-[11px] tracking-wide transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  tab === t
                    ? 'border-[var(--accent-default)] text-[var(--text)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon
                  name={t === 'leaderboard' ? 'emoji_events' : t === 'profile' ? 'person' : t === 'settings' ? 'settings' : 'fitness_center'}
                  size={13}
                />
                {t}
              </button>
            ))}
          </nav>

          {/* Right: theme placeholder */}
          <div className="flex items-center gap-1 shrink-0 sm:justify-end sm:px-4 sm:py-3">
            <div className="w-8 h-8" />
          </div>
        </div>
      </header>

      <main className={`flex-1 w-full mx-auto ${tab === 'workout' ? 'max-w-[1024px] p-0 flex flex-col justify-center' : 'max-w-2xl p-4'}`}>

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <>
            {/* Stats bar */}
            <div
              className="px-3 py-2 mb-4 text-[10px] tracking-wide text-[var(--muted)] flex flex-wrap gap-x-3 gap-y-1"
              style={{ background: 'var(--surface-dim)', border: '1px solid var(--border)' }}
            >
              <span>total: <strong className="text-[var(--text)]">
                {exerciseConfig ? formatValue(room.stats.totalValue, exerciseConfig.mode) : room.stats.totalValue.toLocaleString()}
              </strong> {exerciseConfig?.mode === 'hold' ? 'sec' : 'reps'}</span>
              <span>·</span>
              <span>members: <span className="text-[var(--text)]">{room.stats.participantsCount}</span></span>
              <span>·</span>
              <span>sessions: <span className="text-[var(--text)]">{room.stats.sessionsCount}</span></span>
              <span>·</span>
              <span>active today: <span className="text-[#22c55e] font-bold">{room.stats.activeToday}</span></span>
            </div>

            {/* Leaderboard list */}
            <div className="overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              {room.leaderboard.length === 0 ? (
                <div className="p-8 text-center text-[10px] tracking-widest text-[var(--muted)]">
                  {'// пока никого нет. начните тренировку.'}
                </div>
              ) : (
                room.leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: p.id === currentParticipantId ? 'var(--surface-dim)' : undefined,
                    }}
                  >
                    <span className="w-6 shrink-0 flex items-center justify-center">
                      {i === 0 ? (
                        <Icon name="crown" size={16} style={{ color: '#F7C948' }} />
                      ) : i === 1 ? (
                        <Icon name="crown" size={16} style={{ color: '#B8B8B8' }} />
                      ) : i === 2 ? (
                        <Icon name="crown" size={16} style={{ color: '#CD7F32' }} />
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--muted)] tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                        <span className="truncate">{p.name}</span>
                        {p.id === currentParticipantId && (
                          <span className="text-[10px] tracking-wider text-[var(--accent-default)] shrink-0">[you]</span>
                        )}
                        {p.activeToday && (
                          <span className="text-[10px] tracking-wider text-[#22c55e] shrink-0" aria-label="активен сегодня">
                            [active]
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">
                        {p.sessionsCount} sessions · best: {exerciseConfig ? formatValue(p.bestSession, exerciseConfig.mode) : p.bestSession}
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums shrink-0">
                      {exerciseConfig ? formatValue(p.totalValue, exerciseConfig.mode) : p.totalValue}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              className="mt-3 w-full py-2.5 text-[11px] text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              refresh()
            </button>
          </>
        )}

        {/* Workout tab */}
        {tab === 'workout' && (
          <CameraPreview
            state={cameraState}
            count={cameraCount}
            elapsed={cameraElapsed}
            holdProgress={cameraHoldProgress}
            discipline={room.discipline}
          />
        )}

        {/* Settings tab */}
        {tab === 'settings' && room.isOwner && (
          <div className="space-y-6">
            {/* Rename */}
            <div className="p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// переименовать комнату'}</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder={room.name}
                  className="flex-1 px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
                  style={{ border: '1px solid var(--border)' }}
                />
                <button
                  disabled
                  className="px-4 py-2.5 text-sm text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  save()
                </button>
              </div>
            </div>

            {/* Participants + kick */}
            <div className="p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// участники'}</div>
              <div style={{ border: '1px solid var(--border)' }}>
                {room.leaderboard.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-[var(--muted)]">{'// пока никого'}</div>
                ) : (
                  room.leaderboard.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="truncate font-medium">{p.name}</span>
                        {p.id === currentParticipantId && (
                          <span className="ml-2 text-[10px] tracking-wider text-[var(--accent-default)]">[you]</span>
                        )}
                      </div>
                      {p.id !== currentParticipantId && (
                        <button className="text-[11px] text-[var(--muted)] hover:text-[#ef4444] transition-colors ml-3 shrink-0">
                          kick()
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="p-4 space-y-3" style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
              <div className="text-[10px] tracking-widest text-[#ef4444]">{'// danger zone'}</div>
              <div className="text-sm text-[#ef4444]">
                Удаление комнаты удалит всех участников и результаты без возможности восстановления.
              </div>
              {!showDeleteConfirm ? (
                <button className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity">
                  delete_room()
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-[#ef4444]">
                    Для удаления введи точное название комнаты и пароль от аккаунта.
                  </div>
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-[10px] tracking-widest text-[var(--muted)]">room name</span>
                      <input
                        readOnly
                        className="mt-1 w-full px-3 py-2 text-sm bg-transparent outline-none"
                        style={{ border: '1px solid var(--border)' }}
                        placeholder={room.name}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] tracking-widest text-[var(--muted)]">password</span>
                      <input
                        type="password"
                        readOnly
                        className="mt-1 w-full px-3 py-2 text-sm bg-transparent outline-none"
                        style={{ border: '1px solid var(--border)' }}
                        placeholder="••••••••"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      cancel
                    </button>
                    <button
                      disabled
                      className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity disabled:opacity-50"
                    >
                      delete_room()
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// profile'}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] tracking-widest text-[var(--muted)]">name</div>
                  <div className="mt-1 text-sm font-medium">{profileName ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] tracking-widest text-[var(--muted)]">email</div>
                  <div className="mt-1 text-sm break-all">{profileEmail ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] tracking-widest text-[var(--muted)]">room</div>
                  <div className="mt-1 text-sm font-medium">{room.name}</div>
                </div>
                <div>
                  <div className="text-[10px] tracking-widest text-[var(--muted)]">role</div>
                  <div className="mt-1 text-sm">{room.isOwner ? 'owner' : 'member'}</div>
                </div>
              </div>
            </div>

            {/* Account / logout */}
            <div className="p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// account'}</div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[var(--muted)]">logout() завершит текущую сессию, но не удалит комнаты и статистику.</div>
                {!showLogoutConfirm ? (
                  <button
                    className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    logout()
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      cancel
                    </button>
                    <button className="px-4 py-2 text-sm text-white bg-[#ff6b35] hover:opacity-85 transition-opacity">
                      logout()
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Room section */}
            {!room.isOwner ? (
              <div className="p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// room'}</div>
                <div className="text-sm text-[var(--muted)]">
                  leave_room() удалит твое участие в комнате и всю статистику без возможности восстановления.
                </div>
                {!showLeaveConfirm ? (
                  <button className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity">
                    leave_room()
                  </button>
                ) : (
                  <div
                    className="p-3 space-y-3"
                    style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}
                  >
                    <div className="text-sm text-[#ef4444]">
                      Это действие удалит твои результаты из комнаты навсегда.
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                        style={{ border: '1px solid var(--border)' }}
                      >
                        cancel
                      </button>
                      <button className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity">
                        leave_room()
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// room'}</div>
                <div className="text-sm text-[var(--muted)]">
                  Управление комнатой доступно во вкладке settings.
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Tab Bar (mobile only) */}
      <nav
        className={`${isMobile ? '' : 'hidden'} sticky bottom-0 z-10 bg-[var(--bg)]`}
        style={{ borderTop: '1px solid var(--border)' }}
        role="tablist"
      >
        <div className="flex">
          {allTabs.map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                tab === t ? 'text-[var(--accent-default)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon
                name={t === 'workout' ? 'fitness_center' : t === 'leaderboard' ? 'emoji_events' : t === 'settings' ? 'settings' : 'person'}
                size={20}
              />
              <span className="text-[10px] tracking-wide">{t}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
