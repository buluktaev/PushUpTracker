'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Icon from '@/components/Icon'
import ThemeToggle from '@/components/ThemeToggle'
import { useRooms, type SavedRoom } from '@/hooks/useRooms'
import { createClient as createSupabaseClient } from '@/lib/supabase-client'
import { getExerciseConfig, formatValue } from '@/lib/exerciseConfigs'

const CameraWorkout = dynamic(() => import('@/components/CameraWorkout'), {
  ssr: false,
  loading: () => <div className="py-8 text-[10px] tracking-widest text-[var(--muted)]">{'// загрузка камеры...'}</div>,
})

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

interface ProfileData {
  email: string
  name: string
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const { rooms, loaded, addRoom, removeRoom, clearRooms, getRoom } = useRooms()
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
  const [copiedSwitcher, setCopiedSwitcher] = useState<string | null>(null)

  function copySwitcherCode(e: React.MouseEvent, roomCode: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(roomCode)
    setCopiedSwitcher(roomCode)
    setTimeout(() => setCopiedSwitcher(null), 2000)
  }
  const [identity, setIdentity] = useState<SavedRoom | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leaderboard' | 'workout' | 'settings' | 'profile'>('workout')
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [busyAction, setBusyAction] = useState<'logout' | 'leave' | 'delete' | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteRoomName, setDeleteRoomName] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  // Сброс при переходе между комнатами
  useEffect(() => {
    setLoading(true)
    setRoom(null)
    setProfile(null)
    setIdentity(null)
    setShowSwitcher(false)
    leavingRef.current = false
    setTab('workout')
    setActionError(null)
    setShowLogoutConfirm(false)
    setShowLeaveConfirm(false)
    setShowDeleteConfirm(false)
    setDeleteRoomName('')
    setDeletePassword('')
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
      const [roomRes, profileRes] = await Promise.all([
        fetch(`/api/rooms/${code}`),
        fetch('/api/profile'),
      ])

      if (!roomRes.ok) throw new Error('Комната не найдена')

      const roomData = await roomRes.json()
      setRoom(roomData)

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }
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

  async function logout() {
    setActionError(null)
    setBusyAction('logout')
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearRooms()
      router.push('/login')
    } catch {
      setActionError('Не удалось выйти из аккаунта')
    } finally {
      setBusyAction(null)
      setShowLogoutConfirm(false)
    }
  }

  async function leaveRoom() {
    setActionError(null)
    setBusyAction('leave')
    try {
      const res = await fetch(`/api/rooms/${code}/membership`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error ?? 'Не удалось покинуть комнату')
      }

      leavingRef.current = true
      removeRoom(code)
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось покинуть комнату'
      setActionError(message)
    } finally {
      setBusyAction(null)
      setShowLeaveConfirm(false)
    }
  }

  async function deleteRoom() {
    setActionError(null)
    setBusyAction('delete')
    try {
      const res = await fetch(`/api/rooms/${code}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: deleteRoomName,
          password: deletePassword,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error ?? 'Не удалось удалить комнату')
      }

      leavingRef.current = true
      removeRoom(code)
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить комнату'
      setActionError(message)
    } finally {
      setBusyAction(null)
    }
  }

  async function handleRename() {
    if (!renameValue.trim() || !room) return
    setSettingsLoading(true)
    setSettingsError('')
    try {
      const res = await fetch(`/api/rooms/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRoom(prev => prev ? { ...prev, name: data.name } : prev)
      setRenameValue('')
    } catch (e: unknown) {
      setSettingsError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setSettingsLoading(false)
    }
  }

  async function handleKick(participantId: string) {
    setSettingsLoading(true)
    setSettingsError('')
    try {
      const res = await fetch(`/api/rooms/${code}/participants/${participantId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await loadRoom()
    } catch (e: unknown) {
      setSettingsError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setSettingsLoading(false)
    }
  }

  if (loading || !room) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)] relative">
        <div className="absolute top-3 right-4"><ThemeToggle /></div>
        <span className="text-[10px] tracking-widest text-[var(--muted)]">{'// загрузка...'}</span>
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
            {(() => {
              const config = getExerciseConfig(room.discipline)
              return config ? (
                <span className="text-[10px] text-[var(--muted)] truncate">· {config.name}</span>
              ) : null
            })()}
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
                          {isCurrent && <span className="text-[10px] tracking-wider text-[var(--accent-default)] shrink-0">[active]</span>}
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
                    className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 text-xs text-[var(--accent-default)] hover:bg-[var(--surface-dim)] transition-colors text-left"
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
            {(() => {
              const tabs = room.isOwner
                ? (['workout', 'leaderboard', 'settings', 'profile'] as const)
                : (['workout', 'leaderboard', 'profile'] as const)
              return tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  role="tab"
                  aria-selected={tab === t}
                  className={`px-5 text-[11px] tracking-wide transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                    tab === t
                      ? 'border-[var(--accent-default)] text-[var(--text)] font-bold'
                      : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon name={t === 'leaderboard' ? 'emoji_events' : t === 'profile' ? 'person' : t === 'settings' ? 'settings' : 'fitness_center'} size={13} />
                  {t}
                </button>
              ))
            })()}
          </nav>

          {/* Right: theme */}
          <div className="flex items-center gap-1 shrink-0 sm:justify-end sm:px-4 sm:py-3">
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
              <span>total: <strong className="text-[var(--text)]">
                {(() => {
                  const c = getExerciseConfig(room.discipline)
                  return c ? formatValue(room.stats.totalValue, c.mode) : room.stats.totalValue.toLocaleString()
                })()}
              </strong> {(() => { const c = getExerciseConfig(room.discipline); return c?.mode === 'hold' ? 'sec' : 'reps' })()}</span>
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
                  {'// пока никого нет. начните тренировку.'}
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
                          <span className="text-[10px] tracking-wider text-[var(--accent-default)] shrink-0">[you]</span>
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
                        {p.sessionsCount} sessions · best: {(() => {
                          const c = getExerciseConfig(room.discipline)
                          return c ? formatValue(p.bestSession, c.mode) : p.bestSession
                        })()}
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums shrink-0">
                      {(() => {
                        const c = getExerciseConfig(room.discipline)
                        return c ? formatValue(p.totalValue, c.mode) : p.totalValue
                      })()}
                    </span>
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
            discipline={room.discipline}
            onSessionSaved={loadRoom}
          />
        )}

        {tab === 'settings' && room.isOwner && (
          <div className="space-y-6">
            {settingsError && (
              <div className="px-4 py-3 text-sm text-[#ef4444]"
                style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                {settingsError}
              </div>
            )}

            {/* Rename */}
            <div className="p-4 space-y-3"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// переименовать комнату'}</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={room.name}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                  className="flex-1 px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
                  style={{ border: '1px solid var(--border)' }}
                />
                <button
                  onClick={handleRename}
                  disabled={settingsLoading || !renameValue.trim()}
                  className="px-4 py-2.5 text-sm text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity"
                >
                  save()
                </button>
              </div>
            </div>

            {/* Participants + kick */}
            <div className="p-4 space-y-3"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// участники'}</div>
              <div style={{ border: '1px solid var(--border)' }}>
                {room.leaderboard.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-[var(--muted)]">{'// пока никого'}</div>
                ) : (
                  room.leaderboard.map(p => (
                    <div key={p.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex-1 min-w-0">
                        <span className="truncate font-medium">{p.name}</span>
                        {p.id === identity?.participantId && (
                          <span className="ml-2 text-[10px] tracking-wider text-[var(--accent-default)]">[you]</span>
                        )}
                      </div>
                      {p.id !== identity?.participantId && (
                        <button
                          onClick={() => handleKick(p.id)}
                          disabled={settingsLoading}
                          className="text-[11px] text-[var(--muted)] hover:text-[#ef4444] transition-colors disabled:opacity-40 ml-3 shrink-0"
                        >
                          kick()
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Delete room (moved from profile) */}
            <div className="p-4 space-y-3"
              style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
              <div className="text-[10px] tracking-widest text-[#ef4444]">{'// danger zone'}</div>
              <div className="text-sm text-[#ef4444]">
                Удаление комнаты удалит всех участников и результаты без возможности восстановления.
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity"
                >
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
                        value={deleteRoomName}
                        onChange={e => setDeleteRoomName(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-transparent outline-none"
                        style={{ border: '1px solid var(--border)' }}
                        placeholder={room.name}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] tracking-widest text-[var(--muted)]">password</span>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={e => setDeletePassword(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-transparent outline-none"
                        style={{ border: '1px solid var(--border)' }}
                        placeholder="••••••••"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteRoomName(''); setDeletePassword('') }}
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      cancel
                    </button>
                    <button
                      onClick={deleteRoom}
                      disabled={busyAction === 'delete' || deleteRoomName !== room.name || deletePassword.length === 0}
                      className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity disabled:opacity-50"
                    >
                      {busyAction === 'delete' ? 'delete_room()...' : 'delete_room()'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-4">
            <div
              className="p-4 space-y-3"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// profile'}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] tracking-widest text-[var(--muted)]">name</div>
                  <div className="mt-1 text-sm font-medium">{profile?.name ?? identity?.name ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] tracking-widest text-[var(--muted)]">email</div>
                  <div className="mt-1 text-sm break-all">{profile?.email ?? '—'}</div>
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

            {actionError && (
              <div
                className="px-4 py-3 text-sm text-[#ef4444]"
                style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}
              >
                {actionError}
              </div>
            )}

            <div
              className="p-4 space-y-3"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// account'}</div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[var(--muted)]">logout() завершит текущую сессию, но не удалит комнаты и статистику.</div>
                {!showLogoutConfirm ? (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    logout()
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      cancel
                    </button>
                    <button
                      onClick={logout}
                      disabled={busyAction === 'logout'}
                      className="px-4 py-2 text-sm text-white bg-[var(--accent-default)] hover:opacity-85 transition-opacity disabled:opacity-50"
                    >
                      {busyAction === 'logout' ? 'logout()...' : 'logout()'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!room.isOwner ? (
              <div
                className="p-4 space-y-3"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <div className="text-[10px] tracking-widest text-[var(--muted)]">{'// room'}</div>
                <div className="text-sm text-[var(--muted)]">
                  leave_room() удалит твое участие в комнате и всю статистику без возможности восстановления.
                </div>
                {!showLeaveConfirm ? (
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity"
                  >
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
                        onClick={() => setShowLeaveConfirm(false)}
                        className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                        style={{ border: '1px solid var(--border)' }}
                      >
                        cancel
                      </button>
                      <button
                        onClick={leaveRoom}
                        disabled={busyAction === 'leave'}
                        className="px-4 py-2 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity disabled:opacity-50"
                      >
                        {busyAction === 'leave' ? 'leave_room()...' : 'leave_room()'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="p-4 space-y-3"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
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
        className="sm:hidden sticky bottom-0 z-10 bg-[var(--bg)]"
        style={{ borderTop: '1px solid var(--border)' }}
        role="tablist"
      >
        <div className="flex">
          {(() => {
            const tabs = room.isOwner
              ? (['workout', 'leaderboard', 'settings', 'profile'] as const)
              : (['workout', 'leaderboard', 'profile'] as const)
            return tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
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
            ))
          })()}
        </div>
      </nav>
    </div>
  )
}
