'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Icon from '@/components/Icon'
import ThemeToggle from '@/components/ThemeToggle'
import { useRooms } from '@/hooks/useRooms'

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rooms, loaded, addRoom } = useRooms()
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [showNew, setShowNew] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addMode = searchParams.get('add') === '1'

  useEffect(() => {
    if (!mounted || !loaded) return
    if (rooms.length === 1 && !addMode) {
      router.push(`/room/${rooms[0].roomCode}`)
    }
  }, [mounted, loaded, rooms, router, addMode])

  async function handleCreate() {
    if (!roomName.trim()) return setError('введите название комнаты')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/room/${data.code}?created=1&name=${encodeURIComponent(roomName)}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return setError('введите код комнаты')
    setLoading(true)
    setError('')
    try {
      const code = joinCode.trim().toUpperCase()
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Fetch room name for the saved entry
      let fetchedRoomName = code
      try {
        const roomRes = await fetch(`/api/rooms/${code}`)
        if (roomRes.ok) {
          const roomData = await roomRes.json()
          if (roomData.name) fetchedRoomName = roomData.name
        }
      } catch {}

      addRoom({
        roomCode: code,
        participantId: data.id,
        name: data.name,
        roomName: fetchedRoomName,
      })

      router.push(`/room/${code}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !loaded) return null
  if (rooms.length === 1 && !addMode) return null

  const showForms = rooms.length === 0 || showNew

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="fixed top-3 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icon.svg" width={20} height={20} alt=""  />
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

        {/* Room list (2+ rooms, or 1 room in addMode) */}
        {(rooms.length >= 2 || (addMode && rooms.length >= 1)) && (
          <div className="flex flex-col gap-1.5 mb-2">
            {rooms.map(room => (
              <div
                key={room.roomCode}
                onClick={() => router.push(`/room/${room.roomCode}`)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-[var(--text)] bg-[var(--surface)] hover:border-[#ff6b35] transition-colors cursor-pointer"
                style={{ border: '1px solid var(--border)' }}
              >
                <span className="font-medium truncate">{room.roomName}</span>
                <Icon name="arrow_forward" size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              </div>
            ))}

            {/* new_room() toggle button */}
            <button
              onClick={() => { setShowNew(v => !v); setMode('menu'); setError('') }}
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
                  onClick={() => setMode('create')}
                  className="w-full py-3 text-sm font-normal text-white bg-[#ff6b35] hover:opacity-85 transition-opacity"
                >
                  create_room()
                </button>
                <button
                  onClick={() => setMode('join')}
                  className="w-full py-3 text-sm font-normal border text-[var(--text)] bg-[var(--surface)] hover:border-[#ff6b35] transition-colors"
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
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    style={{ border: '1px solid var(--border)' }}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-[#ef4444]">! {error}</p>
                )}
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-3 text-sm font-normal text-white bg-[#ff6b35] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  {loading ? '// выполняем...' : 'execute()'}
                </button>
                <button
                  onClick={() => { setMode('menu'); setError('') }}
                  className="text-xs text-[var(--muted)] hover:text-[#ff6b35] transition-colors text-left"
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
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    maxLength={6}
                    className="w-full px-3 py-2.5 text-sm tracking-[0.25em] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
                    style={{ border: '1px solid var(--border)' }}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-[#ef4444]">! {error}</p>
                )}
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-3 text-sm font-normal text-white bg-[#ff6b35] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  {loading ? '// входим...' : 'execute()'}
                </button>
                <button
                  onClick={() => { setMode('menu'); setError('') }}
                  className="text-xs text-[var(--muted)] hover:text-[#ff6b35] transition-colors text-left"
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

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}
