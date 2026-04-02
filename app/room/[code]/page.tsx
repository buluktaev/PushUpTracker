'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AppLoadingScreen from '@/components/AppLoadingScreen'
import Icon from '@/components/Icon'
import IconButton from '@/components/IconButton'
import RoomLeaderboard from '@/components/RoomLeaderboard'
import RoomProfilePanel from '@/components/RoomProfilePanel'
import RoomSettingsPanel from '@/components/RoomSettingsPanel'
import Tab from '@/components/Tab'
import ThemeToggle from '@/components/ThemeToggle'
import { useRooms, type SavedRoom } from '@/hooks/useRooms'
import { getExerciseConfig, formatValue } from '@/lib/exerciseConfigs'
import { getRoomTabs } from '@/lib/roomTabs'

const CameraWorkout = dynamic(() => import('@/components/CameraWorkout'), {
  ssr: false,
  loading: () => <AppLoadingScreen />,
})

interface Participant {
  id: string
  name: string
  totalValue: number
  sessionsCount: number
  bestSession: number
  streakDays: number
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
  const previousRoomNameRef = useRef<string | null>(null)

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
  const [deletePasswordError, setDeletePasswordError] = useState('')
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
    setDeletePasswordError('')
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

  useEffect(() => {
    if (!room) return

    const previousRoomName = previousRoomNameRef.current
    if (renameValue === '' || renameValue === previousRoomName) {
      setRenameValue(room.name)
    }
    previousRoomNameRef.current = room.name
  }, [room, renameValue])

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function logout() {
    setActionError(null)
    setBusyAction('logout')
    try {
      leavingRef.current = true
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Не удалось выйти из аккаунта')
      clearRooms()
      window.location.replace('/login')
    } catch {
      leavingRef.current = false
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
    setDeletePasswordError('')
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
      if (message === 'Неверный пароль') {
        setDeletePasswordError(message)
      } else {
        setActionError(message)
      }
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
      setRenameValue(data.name)
      previousRoomNameRef.current = data.name
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
    return <AppLoadingScreen />
  }

  const roomTabs = getRoomTabs(room.discipline, room.isOwner)

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg-surface)] text-[var(--text)]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-4 app-web:grid app-web:grid-cols-[1fr_auto_1fr] app-web:items-stretch app-web:px-0 app-web:py-0 app-web:min-h-12">
          {/* Left: room name + switcher */}
          <div className="flex items-center gap-2 min-w-0 app-web:px-4 app-web:py-3" ref={switcherRef}>
            <h1 className="text-[18px] font-medium leading-[26px] truncate">{room.name}</h1>
            <div className="relative shrink-0">
              <IconButton
                onClick={() => setShowSwitcher(v => !v)}
                icon="expand_more"
                alternateIcon="expand_less"
                alternateActive={showSwitcher}
                label="переключить комнату"
                variant="secondary"
                size="compact"
              />
              {showSwitcher && (
                <div
                  className="fixed left-0 right-0 top-[57px] z-50 py-1 animate-pop-in app-web:absolute app-web:top-full app-web:left-0 app-web:right-auto app-web:min-w-[200px] app-web:mt-1"
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
                            className="flex items-center justify-center w-8 h-8 app-web:w-6 app-web:h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            aria-label="скопировать код"
                          >
                            <span className="relative inline-flex h-4 w-4 items-center justify-center">
                              <span
                                aria-hidden="true"
                                className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                                  copiedSwitcher === r.roomCode
                                    ? 'opacity-0 scale-[0.25] blur-[4px]'
                                    : 'opacity-100 scale-100 blur-0'
                                }`}
                              >
                                <Icon name="content_copy" size={16} />
                              </span>
                              <span
                                aria-hidden="true"
                                className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                                  copiedSwitcher === r.roomCode
                                    ? 'opacity-100 scale-100 blur-0'
                                    : 'opacity-0 scale-[0.25] blur-[4px]'
                                }`}
                                style={{ color: '#22c55e' }}
                              >
                                <Icon name="check" size={16} />
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ borderTop: '1px solid var(--border)' }} className="mt-1 pt-1" />
                  <button
                    onClick={() => { setShowSwitcher(false); router.push(`/?add=1&fromRoom=${code}`) }}
                    className="w-full flex items-center gap-2 px-3 py-3 app-web:py-2 text-xs text-[var(--accent-default)] hover:bg-[var(--surface-dim)] transition-colors text-left"
                  >
                    <Icon name="add" size={14} />
                    <span>add_room()</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: tabs (desktop only) */}
          <nav className="hidden app-web:flex items-stretch" role="tablist">
            {roomTabs.map(tabItem => (
                <Tab
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  role="tab"
                  aria-selected={tab === tabItem.key}
                  label={tabItem.label}
                  icon={tabItem.icon}
                  active={tab === tabItem.key}
                />
              ))}
          </nav>

          {/* Right: theme */}
          <div className="flex items-center gap-1 shrink-0 app-web:justify-end app-web:px-4 app-web:py-3">
            <ThemeToggle iconOnly compact />
          </div>
        </div>
      </header>

      <main className={`flex-1 w-full mx-auto overflow-y-auto pb-4 app-web:overflow-visible app-web:pb-0 ${tab === 'workout' ? 'max-w-[1024px] p-0 flex flex-col pt-4' : tab === 'leaderboard' ? 'p-4 app-web:pb-[56px]' : tab === 'profile' || tab === 'settings' ? 'p-4 flex flex-col' : 'max-w-2xl p-4'}`}>
        {tab === 'leaderboard' && (
          <div className="mx-auto w-full app-web:max-w-[720px]">
            <RoomLeaderboard
              participants={room.leaderboard}
              currentParticipantId={identity?.participantId}
              formatMetric={value => {
                const c = getExerciseConfig(room.discipline)
                return c ? formatValue(value, c.mode) : value.toLocaleString()
              }}
              IconComponent={Icon}
            />
          </div>
        )}

        {tab === 'workout' && identity && (
          <CameraWorkout
            participantId={identity.participantId}
            discipline={room.discipline}
            onSessionSaved={loadRoom}
          />
        )}

        {tab === 'settings' && room.isOwner && (
          <RoomSettingsPanel
            roomName={room.name}
            renameValue={renameValue}
            settingsError={settingsError}
            deletePasswordError={deletePasswordError}
            settingsLoading={settingsLoading}
            participants={room.leaderboard.map(participant => ({ id: participant.id, name: participant.name }))}
            currentParticipantId={identity?.participantId}
            showDeleteConfirm={showDeleteConfirm}
            deleteRoomName={deleteRoomName}
            deletePassword={deletePassword}
            busyAction={busyAction === 'delete' ? 'delete' : null}
            onRenameChange={setRenameValue}
            onRenameSubmit={handleRename}
            onKick={handleKick}
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
            onHideDeleteConfirm={() => {
              setShowDeleteConfirm(false)
              setDeleteRoomName('')
              setDeletePassword('')
              setDeletePasswordError('')
            }}
            onDeleteRoomNameChange={setDeleteRoomName}
            onDeletePasswordChange={value => {
              setDeletePassword(value)
              if (deletePasswordError) {
                setDeletePasswordError('')
              }
            }}
            onDelete={deleteRoom}
          />
        )}

        {tab === 'profile' && (
          <RoomProfilePanel
            profileName={profile?.name ?? identity?.name}
            profileEmail={profile?.email}
            roomName={room.name}
            roleLabel={room.isOwner ? 'создатель комнаты' : 'участник'}
            isOwner={room.isOwner}
            actionError={actionError}
            showLogoutConfirm={showLogoutConfirm}
            showLeaveConfirm={showLeaveConfirm}
            busyAction={busyAction === 'logout' || busyAction === 'leave' ? busyAction : null}
            onShowLogoutConfirm={() => setShowLogoutConfirm(true)}
            onHideLogoutConfirm={() => setShowLogoutConfirm(false)}
            onLogout={logout}
            onShowLeaveConfirm={() => setShowLeaveConfirm(true)}
            onHideLeaveConfirm={() => setShowLeaveConfirm(false)}
            onLeave={leaveRoom}
          />
        )}
      </main>

      {/* Bottom Tab Bar (mobile only) */}
      <nav
        className="app-web:hidden sticky bottom-0 z-10 bg-[var(--surface)]"
        style={{ borderTop: '1px solid var(--border)' }}
        role="tablist"
      >
        <div className="flex justify-center pt-2 pb-10">
          {roomTabs.map(tabItem => (
              <Tab
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                role="tab"
                aria-selected={tab === tabItem.key}
                label={tabItem.label}
                icon={tabItem.icon}
                active={tab === tabItem.key}
                platform="mobile"
                className="flex-1"
              />
            ))}
        </div>
      </nav>
    </div>
  )
}
