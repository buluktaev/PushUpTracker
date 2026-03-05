'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const CameraWorkout = dynamic(() => import('@/components/CameraWorkout'), {
  ssr: false,
  loading: () => <div className="text-center py-8 text-[#666]">Загрузка камеры...</div>,
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
      const nameParam = searchParams.get('name') || ''

      if (isCreator) {
        const joinName = prompt('Ваше имя в комнате:') || nameParam || 'Участник'
        const res = await fetch(`/api/rooms/${code}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: joinName }),
        })
        if (res.ok) {
          const data = await res.json()
          const id: Identity = { roomCode: code, participantId: data.id, name: data.name }
          localStorage.setItem('pushup_identity', JSON.stringify(id))
          setIdentity(id)
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }
    init()
  }, [code, searchParams, router])

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

  if (loading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-[#666]">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#f0f0f0]">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <div>
          <h1 className="font-bold text-base">{room.name}</h1>
          <button
            onClick={copyCode}
            className="text-xs font-mono text-[#666] hover:text-[#f0f0f0] transition-colors"
          >
            {copied ? '✓ Скопировано' : `Код: ${code}`}
          </button>
        </div>
        <button
          onClick={leaveRoom}
          className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[#666] hover:text-[#f0f0f0] transition-colors"
        >
          Выйти
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 px-4 py-2 border-b border-[#2a2a2a]">
        {(['leaderboard', 'workout'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white/8 text-[#f0f0f0]'
                : 'text-[#666] hover:text-[#f0f0f0]'
            }`}
          >
            {t === 'leaderboard' ? '🏆 Лидерборд' : '💪 Тренировка'}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 max-w-2xl w-full mx-auto">
        {tab === 'leaderboard' && (
          <>
            {/* Room stats */}
            <div className="rounded-xl p-4 mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm bg-[#1a1a1a] border border-[#2a2a2a]">
              <span>
                Всего: <strong>{room.stats.totalPushups.toLocaleString()}</strong> отжиманий
              </span>
              <span className="text-[#666]">·</span>
              <span className="text-[#666]">Участников: {room.stats.participantsCount}</span>
              <span className="text-[#666]">·</span>
              <span className="text-[#666]">Сессий: {room.stats.sessionsCount}</span>
              <span className="text-[#666]">·</span>
              <span className="text-[#666]">Активны сегодня: {room.stats.activeToday}</span>
            </div>

            {/* Leaderboard */}
            <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
              {room.leaderboard.length === 0 ? (
                <div className="p-8 text-center text-[#666]">
                  Пока никого нет. Начните тренировку!
                </div>
              ) : (
                room.leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 px-4 py-3 border-b border-[#2a2a2a] last:border-0 ${
                      p.id === identity?.participantId ? 'bg-[#ff6b35]/8' : ''
                    }`}
                  >
                    <span
                      className="w-6 text-center font-bold text-sm"
                      style={{
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#666',
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        <span className="truncate">{p.name}</span>
                        {p.id === identity?.participantId && (
                          <span className="text-xs text-[#ff6b35] shrink-0">вы</span>
                        )}
                        {p.activeToday && (
                          <span className="text-xs text-[#22c55e] shrink-0">●</span>
                        )}
                      </div>
                      <div className="text-xs text-[#666]">
                        {p.sessionsCount} сессий · лучшая: {p.bestSession}
                      </div>
                    </div>
                    <span className="font-bold tabular-nums">{p.totalPushups}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={loadRoom}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium border border-[#2a2a2a] text-[#666] hover:text-[#f0f0f0] transition-colors"
            >
              Обновить
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
