'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconBarbellFilled } from '@tabler/icons-react'

export default function HomePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (!joinName.trim()) return setError('введите ваше имя')
    setLoading(true)
    setError('')
    try {
      const code = joinCode.trim().toUpperCase()
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: joinName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('pushup_identity', JSON.stringify({
        roomCode: code,
        participantId: data.id,
        name: data.name,
      }))
      router.push(`/room/${code}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <IconBarbellFilled size={16} style={{ color: '#ff6b35' }} />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              // pushup tracker
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-[1.15] tracking-tight">
            Командный<br />трекер отжиманий
          </h1>
          <p className="text-xs text-[var(--muted)] mt-2.5">
            создай комнату или войди по коду
          </p>
        </div>

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
                maxLength={6}
                className="w-full px-3 py-2.5 text-sm tracking-[0.25em] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
                style={{ border: '1px solid var(--border)' }}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="join-name" className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
                your_name =
              </label>
              <input
                id="join-name"
                type="text"
                placeholder="санан"
                value={joinName}
                onChange={e => setJoinName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
                style={{ border: '1px solid var(--border)' }}
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

      </div>
    </main>
  )
}
