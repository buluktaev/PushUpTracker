'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Icon from '@/components/Icon'
import ThemeToggle from '@/components/ThemeToggle'
import { useRooms, type SavedRoom } from '@/hooks/useRooms'

const CameraWorkout = dynamic(() => import('@/components/CameraWorkout'), {
  ssr: false,
  loading: () => <div className="py-8 text-[10px] tracking-widest text-[var(--muted)]">// загрузка камеры...</div>,
})

interface Participant {
  id: string
  name: string
  totalPushups: number
  sessionsCount: number
  bestSession: number
  activeToday: boolean
}

interface RoomStats {
  totalPushups: number
  participantsCount: number
  sessionsCount: number
  activeToday: number
}

interface RoomData {
  name: string
  code: string
  leaderboard: Participant[]
  stats: RoomStats
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const { rooms, loaded, addRoom, removeRoom, getRoom, nextRoom } = useRooms()
  const leavingRef = useRef(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const [showSwitcher, setShowSwitcher] = useState(false)

  useEffect(() => {
    if (!showSwitcher) return
    function handleClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSwitcher])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [copiedSwitcher, setCopiedSwitcher] = useState<string | null>(null)

  function copySwitcherCode(e: React.MouseEvent, roomCode: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(roomCode)
    setCopiedSwitcher(roomCode)
    setTimeout(() => setCopiedSwitcher(null), 2000)
  }
  const [identity, setIdentity] = useState<SavedRoom | null>(null)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leaderboard' | 'workout'>('workout')
  const [copied, setCopied] = useState(false)

  // Сброс при переходе между комнатами
  useEffect(() => {
    setLoading(true)
    setRoom(null)
    setIdentity(null)
    setShowSwitcher(false)
    setShowExitConfirm(false)
    leavingRef.current = false
  }, [code])

  useEffect(() => {
    if (!loaded) return  // ждём загрузки localStorage
    async function init() {
      if (leavingRef.current) return  // навигация уже инициирована в leaveRoom
      const saved = getRoom(code)
      if (saved) {
        setIdentity(saved)
        return
      }
      const isCreator = searchParams.get('created') === '1'
      if (isCreator) {
        // Автоматически вступаем — имя берётся из Profile на сервере
        const res = await fetch(`/api/rooms/${code}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (res.status === 401) {
          router.push('/login')
          return
        }

        if (!res.ok) {
          router.push('/')
          return
        }

        const data = await res.json()
        const roomNameFromUrl = searchParams.get('name') ?? code
        const saved: SavedRoom = {
          roomCode: code,
          participantId: data.id,
          name: data.name,
          roomName: roomNameFromUrl,
        }
        addRoom(saved)
        setIdentity(saved)
        // loading остаётся true, loadRoom запустится через useEffect на identity
      } else {
        router.push('/')
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, rooms, loaded])

  const loadRoom = useCallback(async () => {
    await new Promise(r => setTimeout(r, 1000))
    try {
      const res = await fetch(`/api/rooms/${code}`)
      if (!res.ok) throw new Error('Комната не найдена')
      const data = await res.json()
      setRoom(data)
    } catch {
      removeRoom(code)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [code, router, removeRoom])

  useEffect(() => {
    if (identity) loadRoom()
  }, [identity, loadRoom])

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function leaveRoom() {
    leavingRef.current = true
    removeRoom(code)
    const next = nextRoom(code)
    if (next) {
      router.push(`/room/${next.roomCode}`)
    } else {
      router.push('/')
    }
  }

  if (loading || !room) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)] relative">
        <div className="absolute top-3 right-4"><ThemeToggle /></div>
        <span className="text-[10px] tracking-widest text-[var(--muted)]">// загрузка...</span>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg)]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:px-0 sm:py-0">
          {/* Left: room name + switcher */}
          <div className="flex items-center gap-2 min-w-0 sm:px-4 sm:py-3" ref={switcherRef}>
            <h1 className="font-bold text-sm truncate">{room.name}</h1>
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSwitcher(v => !v)}
                className="flex items-center justify-center w-6 h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                style={{ border: '1px solid var(--border)' }}
                aria-label="переключить комнату"
              >
                <Icon name={showSwitcher ? 'expand_less' : 'expand_more'} size={14} />
              </button>
              {showSwitcher && (
                <div
                  className="fixed left-0 right-0 top-[49px] z-50 py-1 animate-pop-in sm:absolute sm:top-full sm:left-0 sm:right-auto sm:min-w-[200px] sm:mt-1"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {rooms.map(r => {
                    const isCurrent = r.roomCode === code
                    return (
                      <div
                        key={r.roomCode}
                        className={`flex items-center transition-colors ${isCurrent ? 'bg-[var(--surface-dim)]' : 'hover:bg-[var(--surface-dim)]'}`}
                      >
                        <button
                          onClick={() => { if (!isCurrent) { setShowSwitcher(false); router.push(`/room/${r.roomCode}`) } }}
                          className={`flex-1 flex items-center gap-2 px-3 py-3 text-xs text-left min-w-0 ${isCurrent ? 'cursor-default' : ''}`}
                        >
                          <span className={`truncate ${isCurrent ? 'text-[var(--text)] font-medium' : 'text-[var(--text)]'}`}>{r.roomName}</span>
                          {isCurrent && <span className="text-[10px] tracking-wider text-[#ff6b35] shrink-0">[active]</span>}
                        </button>
                        <div className="flex items-center gap-2 pr-3 shrink-0">
                          <span className="text-[10px] text-[var(--muted)]">{r.roomCode}</span>
                          <button
                            onClick={e => copySwitcherCode(e, r.roomCode)}
                            className="flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            aria-label="скопировать код"
                          >
                            <Icon
                              name={copiedSwitcher === r.roomCode ? 'check' : 'content_copy'}
                              size={16}
                              style={{ color: copiedSwitcher === r.roomCode ? '#22c55e' : undefined }}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ borderTop: '1px solid var(--border)' }} className="mt-1 pt-1" />
                  <button
                    onClick={() => { setShowSwitcher(false); router.push('/?add=1') }}
                    className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 text-xs text-[#ff6b35] hover:bg-[var(--surface-dim)] transition-colors text-left"
                  >
                    <Icon name="add" size={14} />
                    <span>add_room()</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: tabs (desktop only) */}
          <nav className="hidden sm:flex items-stretch" role="tablist">
            {(['workout', 'leaderboard'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                className={`px-5 text-[11px] tracking-wide transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  tab === t
                    ? 'border-[#ff6b35] text-[var(--text)] font-bold'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {t === 'leaderboard' ? (
                  <><Icon name="emoji_events" size={13} /> leaderboard</>
                ) : (
                  <><Icon name="fitness_center" size={13} /> workout</>
                )}
              </button>
            ))}
          </nav>

          {/* Right: exit + theme */}
          <div className="flex items-center gap-1 shrink-0 sm:justify-end sm:px-4 sm:py-3">
            <div className="relative">
              {/* Mobile: icon button */}
              <button
                onClick={() => setShowExitConfirm(v => !v)}
                className={`sm:hidden flex items-center justify-center w-8 h-8 transition-colors ${
                  showExitConfirm ? 'text-[#ef4444]' : 'text-[var(--muted)] hover:text-[#ef4444]'
                }`}
                aria-label="выйти из комнаты"
              >
                <Icon name="logout" size={18} />
              </button>
              {/* Desktop: text button */}
              <button
                onClick={() => setShowExitConfirm(v => !v)}
                className={`hidden sm:flex text-[11px] px-3 py-1.5 transition-colors ${
                  showExitConfirm
                    ? 'border-[#ef4444] text-[#ef4444]'
                    : 'text-[var(--muted)] hover:border-[#ef4444] hover:text-[#ef4444]'
                }`}
                style={{ border: '1px solid var(--border)' }}
              >
                exit()
              </button>
              {showExitConfirm && (
                <div
                  className="absolute top-full right-0 mt-1 z-50 p-3 flex flex-col gap-2 min-w-[160px] animate-pop-in-right"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <p className="text-[10px] tracking-widest text-[var(--muted)]">// покинуть комнату?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 py-1.5 text-[11px] text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      cancel
                    </button>
                    <button
                      onClick={leaveRoom}
                      className="flex-1 py-1.5 text-[11px] text-white bg-[#ef4444] hover:opacity-85 transition-opacity"
                    >
                      exit()
                    </button>
                  </div>
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={`flex-1 w-full mx-auto ${tab === 'workout' ? 'max-w-[1024px] p-0 flex flex-col justify-center' : 'max-w-2xl p-4'}`}>
        {tab === 'leaderboard' && (
          <>
            {/* Stats bar */}
            <div
              className="px-3 py-2 mb-4 text-[10px] tracking-wide text-[var(--muted)] flex flex-wrap gap-x-3 gap-y-1"
              style={{ background: 'var(--surface-dim)', border: '1px solid var(--border)' }}
            >
              <span>total: <strong className="text-[var(--text)]">{room.stats.totalPushups.toLocaleString()}</strong> reps</span>
              <span>·</span>
              <span>members: <span className="text-[var(--text)]">{room.stats.participantsCount}</span></span>
              <span>·</span>
              <span>sessions: <span className="text-[var(--text)]">{room.stats.sessionsCount}</span></span>
              <span>·</span>
              <span>active today: <span className="text-[#22c55e] font-bold">{room.stats.activeToday}</span></span>
            </div>

            {/* Leaderboard */}
            <div className="overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              {room.leaderboard.length === 0 ? (
                <div className="p-8 text-center text-[10px] tracking-widest text-[var(--muted)]">
                  // пока никого нет. начните тренировку.
                </div>
              ) : (
                room.leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: p.id === identity?.participantId ? 'var(--surface-dim)' : undefined,
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
                        {p.id === identity?.participantId && (
                          <span className="text-[10px] tracking-wider text-[#ff6b35] shrink-0">[you]</span>
                        )}
                        {p.activeToday && (
                          <span
                            className="text-[10px] tracking-wider text-[#22c55e] shrink-0"
                            aria-label="активен сегодня"
                          >
                            [active]
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">
                        {p.sessionsCount} sessions · best: {p.bestSession}
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums shrink-0">{p.totalPushups}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={loadRoom}
              className="mt-3 w-full py-2.5 text-[11px] text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              refresh()
            </button>
          </>
        )}

        {tab === 'workout' && identity && (
          <CameraWorkout
            participantId={identity.participantId}
            onSessionSaved={loadRoom}
          />
        )}
      </main>

      {/* Bottom Tab Bar (mobile only) */}
      <nav className="sm:hidden sticky bottom-0 z-10 bg-[var(--bg)]" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex">
          {(['workout', 'leaderboard'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-selected={tab === t}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                tab === t ? 'text-[#ff6b35]' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon name={t === 'workout' ? 'fitness_center' : 'emoji_events'} size={20} />
              <span className="text-[10px] tracking-wide">{t}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
