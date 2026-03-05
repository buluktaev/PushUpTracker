'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { IconTrophyFilled, IconBarbellFilled, IconCircleCheckFilled } from '@tabler/icons-react'
import ThemeToggle from '@/components/ThemeToggle'

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

interface Identity {
  roomCode: string
  participantId: string
  name: string
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [identity, setIdentity] = useState<Identity | null>(null)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leaderboard' | 'workout'>('leaderboard')
  const [copied, setCopied] = useState(false)
  const [creatorNameInput, setCreatorNameInput] = useState('')
  const [showCreatorForm, setShowCreatorForm] = useState(false)

  useEffect(() => {
    async function init() {
      const saved = localStorage.getItem('pushup_identity')
      if (saved) {
        const parsed: Identity = JSON.parse(saved)
        if (parsed.roomCode === code) {
          setIdentity(parsed)
          return
        }
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
  }, [code, searchParams, router])

  async function submitCreatorName() {
    if (!creatorNameInput.trim()) return
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: creatorNameInput }),
    })
    if (res.ok) {
      const data = await res.json()
      const id: Identity = { roomCode: code, participantId: data.id, name: data.name }
      localStorage.setItem('pushup_identity', JSON.stringify(id))
      setIdentity(id)
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
    localStorage.removeItem('pushup_identity')
    router.push('/')
  }

  if (showCreatorForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
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
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <span className="text-[10px] tracking-widest text-[var(--muted)]">// загрузка...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between bg-[var(--bg)]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="font-bold text-sm truncate">{room.name}</h1>
          <button
            onClick={copyCode}
            className="shrink-0 flex items-center gap-1 text-[10px] tracking-wider px-2 py-0.5 text-[var(--muted)] hover:border-[#ff6b35] hover:text-[var(--text)] transition-colors"
            style={{ background: 'var(--surface-dim)', border: '1px solid var(--border)' }}
          >
            {copied ? (
              <><IconCircleCheckFilled size={11} className="text-[#22c55e]" /> copied</>
            ) : (
              code
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={leaveRoom}
            className="text-[11px] px-3 py-1.5 text-[var(--muted)] hover:border-[#ef4444] hover:text-[#ef4444] transition-colors"
            style={{ border: '1px solid var(--border)' }}
          >
            exit()
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex" role="tablist" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['leaderboard', 'workout'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
            className={`px-5 py-2.5 text-[11px] tracking-wide transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              tab === t
                ? 'border-[#ff6b35] text-[var(--text)] font-bold'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t === 'leaderboard' ? (
              <><IconTrophyFilled size={13} /> leaderboard</>
            ) : (
              <><IconBarbellFilled size={13} /> workout</>
            )}
          </button>
        ))}
      </nav>

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
                    <span className="w-6 text-[10px] font-bold text-[var(--muted)] shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
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
