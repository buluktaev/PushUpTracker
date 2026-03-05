'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { IconTrophyFilled, IconBarbellFilled, IconCircleCheckFilled } from '@tabler/icons-react'

const CameraWorkout = dynamic(() => import('@/components/CameraWorkout'), {
  ssr: false,
  loading: () => <div className="py-8 text-[10px] tracking-widest text-[#888880]">// загрузка камеры...</div>,
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <div className="w-full max-w-sm p-6 flex flex-col gap-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#888880]">// комната создана</p>
            <h2 className="text-lg font-bold text-[#111111] mt-1">Как вас зовут?</h2>
          </div>
          <input
            type="text"
            placeholder="ваше_имя"
            value={creatorNameInput}
            onChange={e => setCreatorNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitCreatorName()}
            className="w-full rounded-[2px] px-3 py-2.5 text-sm bg-white border border-[#E5E3DC] text-[#111111] placeholder-[#888880] focus:outline-none focus:border-[#ff6b35] transition-colors"
            autoFocus
          />
          <button
            onClick={submitCreatorName}
            disabled={!creatorNameInput.trim()}
            className="w-full py-3 rounded-[2px] text-sm font-bold text-white bg-[#ff6b35] disabled:opacity-40"
          >
            войти в комнату
          </button>
        </div>
      </div>
    )
  }

  if (loading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <span className="text-[10px] tracking-widest text-[#888880]">// загрузка...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#111111]">

      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-[#E5E3DC] bg-[#FAF9F5]">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="font-bold text-sm truncate">{room.name}</h1>
          <button
            onClick={copyCode}
            className="shrink-0 flex items-center gap-1 text-[10px] tracking-wider px-2 py-0.5 bg-[#F0EFE9] border border-[#E5E3DC] rounded-[2px] text-[#888880] hover:border-[#ff6b35] hover:text-[#111111] transition-colors"
          >
            {copied ? (
              <><IconCircleCheckFilled size={11} className="text-[#22c55e]" /> copied</>
            ) : (
              code
            )}
          </button>
        </div>
        <button
          onClick={leaveRoom}
          className="shrink-0 text-[11px] px-3 py-1.5 rounded-[2px] border border-[#E5E3DC] text-[#888880] hover:border-[#ef4444] hover:text-[#ef4444] transition-colors"
        >
          exit()
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-[#E5E3DC] bg-[#FAF9F5]" role="tablist">
        {(['leaderboard', 'workout'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
            className={`px-5 py-2.5 text-[11px] tracking-wide transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              tab === t
                ? 'border-[#ff6b35] text-[#111111] font-bold'
                : 'border-transparent text-[#888880] hover:text-[#111111]'
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
            <div className="rounded-[2px] px-3 py-2 mb-4 bg-[#F0EFE9] border border-[#E5E3DC] text-[10px] tracking-wide text-[#888880] flex flex-wrap gap-x-3 gap-y-1">
              <span>total: <strong className="text-[#111111]">{room.stats.totalPushups.toLocaleString()}</strong> reps</span>
              <span>·</span>
              <span>members: <span className="text-[#111111]">{room.stats.participantsCount}</span></span>
              <span>·</span>
              <span>sessions: <span className="text-[#111111]">{room.stats.sessionsCount}</span></span>
              <span>·</span>
              <span>active today: <span className="text-[#22c55e] font-bold">{room.stats.activeToday}</span></span>
            </div>

            {/* Leaderboard */}
            <div className="rounded-[2px] overflow-hidden border border-[#E5E3DC] bg-white">
              {room.leaderboard.length === 0 ? (
                <div className="p-8 text-center text-[10px] tracking-widest text-[#888880]">
                  // пока никого нет. начните тренировку.
                </div>
              ) : (
                room.leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-[#E5E3DC] last:border-0 ${
                      p.id === identity?.participantId ? 'bg-[#FAF9F5]' : ''
                    }`}
                  >
                    <span className="w-6 text-[10px] font-bold text-[#888880] shrink-0 tabular-nums">
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
                      <div className="text-[10px] text-[#888880] mt-0.5">
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
              className="mt-3 w-full py-2.5 rounded-[2px] text-[11px] border border-[#E5E3DC] text-[#888880] hover:border-[#111111] hover:text-[#111111] transition-colors"
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
