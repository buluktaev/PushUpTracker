'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!roomName.trim()) return setError('Введите название комнаты')
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
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return setError('Введите код комнаты')
    if (!joinName.trim()) return setError('Введите ваше имя')
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
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f0f0f]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">💪</div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">PushUp Tracker</h1>
          <p className="text-sm mt-1 text-[#666]">Соревнуйся с командой</p>
        </div>

        {mode === 'menu' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 rounded-xl font-semibold text-black bg-[#ff6b35] hover:opacity-90 transition-opacity"
            >
              Создать комнату
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 rounded-xl font-semibold border border-[#2a2a2a] text-[#f0f0f0] hover:bg-white/5 transition-colors"
            >
              Войти в комнату
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#666]">
              Название комнаты
            </label>
            <input
              type="text"
              placeholder="Команда Альфа"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#222] border border-[#2a2a2a] text-[#f0f0f0] focus:border-[#ff6b35] placeholder-[#666] transition-colors"
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black bg-[#ff6b35] disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Создаём...' : 'Создать'}
            </button>
            <button
              onClick={() => { setMode('menu'); setError('') }}
              className="text-sm text-center text-[#666] hover:text-[#f0f0f0] transition-colors"
            >
              ← Назад
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#666]">
              Код комнаты
            </label>
            <input
              type="text"
              placeholder="ABC123"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none tracking-widest font-mono bg-[#222] border border-[#2a2a2a] text-[#f0f0f0] focus:border-[#ff6b35] placeholder-[#666] transition-colors"
              autoFocus
            />
            <label className="text-xs font-semibold uppercase tracking-wide text-[#666]">
              Ваше имя
            </label>
            <input
              type="text"
              placeholder="Санан"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#222] border border-[#2a2a2a] text-[#f0f0f0] focus:border-[#ff6b35] placeholder-[#666] transition-colors"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black bg-[#ff6b35] disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
            <button
              onClick={() => { setMode('menu'); setError('') }}
              className="text-sm text-center text-[#666] hover:text-[#f0f0f0] transition-colors"
            >
              ← Назад
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
