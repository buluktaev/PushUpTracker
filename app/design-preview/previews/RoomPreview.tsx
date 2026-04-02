'use client'

import { PreviewIcon as Icon } from './PreviewIcon'
import RoomLeaderboard from '@/components/RoomLeaderboard'
import RoomProfilePanel from '@/components/RoomProfilePanel'
import RoomSettingsPanel from '@/components/RoomSettingsPanel'
import Tab from '@/components/Tab'
import { getExerciseConfig, formatValue } from '@/lib/exerciseConfigs'
import { getRoomTabs } from '@/lib/roomTabs'
import CameraPreview from './CameraPreview'

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

interface RoomPreviewProps {
  room: RoomData
  tab: 'workout' | 'leaderboard' | 'settings' | 'profile'
  currentParticipantId: string
  profileName?: string
  profileEmail?: string
  showSwitcher?: boolean
  rooms?: Array<{ roomCode: string; roomName: string }>
  // Settings states
  showDeleteConfirm?: boolean
  // Profile states
  showLogoutConfirm?: boolean
  showLeaveConfirm?: boolean
  // Camera states (for workout tab)
  cameraState?: 'off' | 'searching' | 'countdown' | 'active' | 'hold' | 'saving'
  cameraCount?: number
  cameraElapsed?: number
  cameraHoldProgress?: number
  // Layout
  isMobile?: boolean
}

export function RoomPreview({
  room,
  tab,
  currentParticipantId,
  profileName,
  profileEmail,
  showSwitcher,
  rooms = [],
  showDeleteConfirm,
  showLogoutConfirm,
  showLeaveConfirm,
  cameraState = 'off',
  cameraCount = 0,
  cameraElapsed = 0,
  cameraHoldProgress = 0,
  isMobile = false,
}: RoomPreviewProps) {
  const exerciseConfig = getExerciseConfig(room.discipline)
  const roomTabs = getRoomTabs(room.discipline, room.isOwner)

  return (
    <div className="min-h-[700px] flex flex-col bg-[var(--bg-surface)] text-[var(--text)]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-4 app-web:grid app-web:grid-cols-[1fr_auto_1fr] app-web:items-stretch app-web:px-0 app-web:py-0 app-web:min-h-12">

          {/* Left: room name + switcher */}
          <div className="flex items-center gap-2 min-w-0 app-web:px-4 app-web:py-3">
            <h1 className="text-[18px] font-medium leading-[26px] truncate">{room.name}</h1>
            <div className="relative shrink-0">
              <button
                className="flex h-8 w-8 items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                style={{ border: '1px solid var(--border)' }}
                aria-label="переключить комнату"
              >
                <Icon name={showSwitcher ? 'expand_less' : 'expand_more'} size={14} />
              </button>
              {showSwitcher && (
                <div
                  className="fixed left-0 right-0 top-[57px] z-50 py-1 app-web:absolute app-web:top-full app-web:left-0 app-web:right-auto app-web:min-w-[200px] app-web:mt-1"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {rooms.map(r => {
                    const isCurrent = r.roomCode === room.code
                    return (
                      <div
                        key={r.roomCode}
                        className={`flex items-center transition-colors ${isCurrent ? 'bg-[var(--surface-dim)]' : 'hover:bg-[var(--surface-dim)]'}`}
                      >
                        <button
                          className={`flex-1 flex items-center gap-2 px-3 py-3 text-xs text-left min-w-0 ${isCurrent ? 'cursor-default' : ''}`}
                        >
                          <span className={`truncate ${isCurrent ? 'text-[var(--text)] font-medium' : 'text-[var(--text)]'}`}>{r.roomName}</span>
                          {isCurrent && <span className="text-[10px] tracking-wider text-[var(--accent-default)] shrink-0">[active]</span>}
                        </button>
                        <div className="flex items-center gap-2 pr-3 shrink-0">
                          <span className="text-[10px] text-[var(--muted)]">{r.roomCode}</span>
                          <button
                            className="flex items-center justify-center w-8 h-8 app-web:w-6 app-web:h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            aria-label="скопировать код"
                          >
                            <Icon name="content_copy" size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ borderTop: '1px solid var(--border)' }} className="mt-1 pt-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-3 app-web:py-2 text-xs text-[var(--accent-default)] hover:bg-[var(--surface-dim)] transition-colors text-left">
                    <Icon name="add" size={14} />
                    <span>add_room()</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: tabs (desktop only) */}
          <nav className={`${isMobile ? 'hidden' : 'flex'} items-stretch`} role="tablist">
            {roomTabs.map(tabItem => (
              <Tab
                key={tabItem.key}
                role="tab"
                aria-selected={tab === tabItem.key}
                label={tabItem.label}
                icon={tabItem.icon}
                active={tab === tabItem.key}
              />
            ))}
          </nav>

          {/* Right: theme placeholder */}
          <div className="flex items-center gap-1 shrink-0 app-web:justify-end app-web:px-4 app-web:py-3">
            <button
              className="flex h-8 w-8 items-center justify-center text-[var(--muted)]"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              aria-label="переключить тему"
            >
              <Icon name="dark_mode" size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 w-full mx-auto overflow-y-auto pb-4 app-web:overflow-visible app-web:pb-0 ${tab === 'workout' ? 'max-w-[1024px] p-0 flex flex-col pt-4' : tab === 'leaderboard' ? 'p-4 app-web:pb-[56px]' : tab === 'profile' || tab === 'settings' ? 'p-4 flex flex-col' : 'max-w-2xl p-4'}`}>

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div className="mx-auto w-full app-web:max-w-[720px]">
            <RoomLeaderboard
              participants={room.leaderboard}
              currentParticipantId={currentParticipantId}
              formatMetric={value => exerciseConfig ? formatValue(value, exerciseConfig.mode) : value.toLocaleString()}
              IconComponent={Icon}
            />
          </div>
        )}

        {/* Workout tab */}
        {tab === 'workout' && (
          <CameraPreview
            state={cameraState}
            count={cameraCount}
            elapsed={cameraElapsed}
            holdProgress={cameraHoldProgress}
            discipline={room.discipline}
          />
        )}

        {/* Settings tab */}
        {tab === 'settings' && room.isOwner && (
          <RoomSettingsPanel
            roomName={room.name}
            renameValue={room.name}
            participants={room.leaderboard.map(participant => ({ id: participant.id, name: participant.name }))}
            currentParticipantId={currentParticipantId}
            showDeleteConfirm={Boolean(showDeleteConfirm)}
            deleteRoomName=""
            deletePassword=""
            onRenameChange={() => {}}
            onRenameSubmit={() => {}}
            onKick={() => {}}
            onShowDeleteConfirm={() => {}}
            onHideDeleteConfirm={() => {}}
            onDeleteRoomNameChange={() => {}}
            onDeletePasswordChange={() => {}}
            onDelete={() => {}}
          />
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <RoomProfilePanel
            profileName={profileName}
            profileEmail={profileEmail}
            roomName={room.name}
            roleLabel={room.isOwner ? 'создатель комнаты' : 'участник'}
            isOwner={room.isOwner}
            showLogoutConfirm={Boolean(showLogoutConfirm)}
            showLeaveConfirm={Boolean(showLeaveConfirm)}
            onShowLogoutConfirm={() => {}}
            onHideLogoutConfirm={() => {}}
            onLogout={() => {}}
            onShowLeaveConfirm={() => {}}
            onHideLeaveConfirm={() => {}}
            onLeave={() => {}}
          />
        )}
      </main>

      {/* Bottom Tab Bar (mobile only) */}
      <nav
        className={`${isMobile ? '' : 'hidden'} sticky bottom-0 z-10 bg-[var(--surface)]`}
        style={{ borderTop: '1px solid var(--border)' }}
        role="tablist"
      >
        <div className="flex justify-center pt-2 pb-10">
          {roomTabs.map(tabItem => (
            <Tab
              key={tabItem.key}
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
