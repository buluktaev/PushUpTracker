'use client'

import { useEffect, useState, useCallback } from 'react'
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

  const { rooms, addRoom, removeRoom, getRoom, nextRoom } = useRooms()
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [identity, setIdentity] = useState<SavedRoom | null>(null)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leaderboard' | 'workout'>('workout')
  const [copied, setCopied] = useState(false)
  const [creatorNameInput, setCreatorNameInput] = useState('')
  const [showCreatorForm, setShowCreatorForm] = useState(false)

  useEffect(() => {
    async function init() {
      const saved = getRoom(code)
      if (saved) {
        setIdentity(saved)
        return
      }
      const isCreator = searchParams.get('created') === '1'
      if (isCreator) {
        setShowCreatorForm(true)
        setLoading(false)
        return
      } else {
        router.push('/')
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, rooms])

  async function submitCreatorName() {
    if (!creatorNameInput.trim()) return
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: creatorNameInput }),
    })
    if (res.ok) {
      const data = await res.json()
      const roomNameFromUrl = searchParams.get('name') ?? code
      const saved: SavedRoom = { roomCode: code, participantId: data.id, name: data.name, roomName: roomNameFromUrl }
      addRoom(saved)
      setIdentity(saved)
      setShowCreatorForm(false)
      setLoading(true)
    } else {
      router.push('/')
    }
  }

  const loadRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`)
      if (!res.ok) throw new Error('Комната не найдена')
      const data = await res.json()
      setRoom(data)
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [code, router])

  useEffect(() => {
    if (identity) loadRoom()
  }, [identity, loadRoom])

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function leaveRoom() {
    removeRoom(code)
    const next = nextRoom(code)
    if (next) {
      router.push(`/room/${next.roomCode}`)
    } else {
      router.push('/')
    }
  }

  if (showCreatorForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] relative">
        <div className="absolute top-3 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm p-6 flex flex-col gap-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[var(--muted)]">// комната создана</p>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">Как вас зовут?</h2>
          </div>
          <input
            type="text"
            placeholder="ваше_имя"
            value={creatorNameInput}
            onChange={e => setCreatorNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitCreatorName()}
            className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
            style={{ border: '1px solid var(--border)' }}
            autoFocus
          />
          <button
            onClick={submitCreatorName}
            disabled={!creatorNameInput.trim()}
            className="w-full py-3 text-sm font-normal text-white bg-[#ff6b35] disabled:opacity-40"
          >
            войти в комнату
          </button>
        </div>
      </div>
    )
  }

  if (loading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] relative">
        <div className="absolute top-3 right-4"><ThemeToggle /></div>
        <span className="text-[10px] tracking-widest text-[var(--muted)]">// загрузка...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* Header with tabs in center */}
      <header className="sticky top-0 z-10 bg-[var(--bg)]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
          {/* Left: room name + switcher + code */}
          <div className="flex items-center gap-2 min-w-0 px-4 py-3 relative">
            <h1 className="font-bold text-sm truncate">{room.name}</h1>
            {rooms.length > 1 && (
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
                    className="absolute top-full left-0 mt-1 z-50 min-w-[180px] py-1"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    {rooms
                      .filter(r => r.roomCode !== code)
                      .map(r => (
                        <button
                          key={r.roomCode}
                          onClick={() => { setShowSwitcher(false); router.push(`/room/${r.roomCode}`) }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-dim)] transition-colors text-left"
                        >
                          <span className="truncate mr-2">{r.roomName}</span>
                          <span className="text-[10px] text-[var(--muted)] shrink-0">{r.roomCode}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={copyCode}
              className="shrink-0 flex items-center gap-1 text-[10px] tracking-wider px-2 py-0.5 text-[var(--muted)] hover:border-[#ff6b35] hover:text-[var(--text)] transition-colors"
              style={{ background: 'var(--surface-dim)', border: '1px solid var(--border)' }}
            >
              {copied ? (
                <><Icon name="check_circle" size={11} className="text-[#22c55e]" /> copied</>
              ) : (
                code
              )}
            </button>
          </div>

          {/* Center: tabs */}
          <nav className="flex items-stretch" role="tablist">
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
          <div className="flex items-center justify-end gap-2 px-4 py-3">
            <button
              onClick={leaveRoom}
              className="text-[11px] px-3 py-1.5 text-[var(--muted)] hover:border-[#ef4444] hover:text-[#ef4444] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              exit()
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-2xl w-full mx-auto">
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
    </div>
  )
}
