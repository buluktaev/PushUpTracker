'use client'

import { LoginPreview } from './LoginPreview'
import { RegisterPreview } from './RegisterPreview'
import { VerifyEmailPreview } from './VerifyEmailPreview'
import HomePreview from './HomePreview'
import { RoomPreview } from './RoomPreview'
import AppLoadingScreen from '@/components/AppLoadingScreen'
import { mockRooms, mockRoom, mockRoomMember, mockProfile } from '@/app/design-preview/mock-data'

type ThemeMode = 'light' | 'dark' | 'both'

interface ScreenFrameProps {
  id: string
  label: string
  themeMode: ThemeMode
  children?: React.ReactNode
  render?: (opts: { isMobile: boolean }) => React.ReactNode
}

function ScreenFrame({ id, label, themeMode, children, render }: ScreenFrameProps) {
  const content = (isMobile: boolean) => (render ? render({ isMobile }) : children)
  const themes = themeMode === 'both' ? ['light', 'dark'] : [themeMode]
  const viewports = [
    { isMobile: true, width: 375, label: 'Mobile 375px' },
    { isMobile: false, width: 1440, label: 'Desktop 1440px' },
  ]

  return (
    <section id={id} className="mb-16">
      <h3 className="mb-4 inline-block bg-gray-800 px-2 py-1 text-sm font-bold text-white">{label}</h3>
      <div className="flex flex-wrap gap-8">
        {themes.flatMap(theme =>
          viewports.map(viewport => (
            <div key={`${id}-${theme}-${viewport.label}`} className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500">
                {theme === 'light' ? 'Light' : 'Dark'} · {viewport.label}
              </span>
              <div
                style={{ width: viewport.width }}
                className="overflow-hidden border border-gray-700"
                data-theme={theme}
              >
                {content(viewport.isMobile)}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export function ScreenCatalog({ themeMode = 'both' }: { themeMode?: ThemeMode }) {
  return (
    <>
      <h2 id="auth" className="mb-6 mt-4 border-b border-gray-700 pb-2 text-lg font-bold text-white">
        01 — Auth
      </h2>

      <ScreenFrame id="login-default" label="Login — Default" themeMode={themeMode}>
        <LoginPreview />
      </ScreenFrame>

      <ScreenFrame id="login-error" label="Login — Error" themeMode={themeMode}>
        <LoginPreview error="Неверный email или пароль" />
      </ScreenFrame>

      <ScreenFrame id="register-default" label="Register — Default" themeMode={themeMode}>
        <RegisterPreview />
      </ScreenFrame>

      <ScreenFrame id="register-error" label="Register — Error" themeMode={themeMode}>
        <RegisterPreview />
      </ScreenFrame>

      <ScreenFrame id="verify-email" label="Verify Email — Default" themeMode={themeMode}>
        <VerifyEmailPreview email="ivan@example.com" attemptsLeft={2} />
      </ScreenFrame>

      <ScreenFrame id="verify-email-blocked" label="Verify Email — Rate Limited" themeMode={themeMode}>
        <VerifyEmailPreview email="ivan@example.com" isBlocked secondsLeft={847} />
      </ScreenFrame>

      <h2 id="home" className="mb-6 mt-12 border-b border-gray-700 pb-2 text-lg font-bold text-white">
        02 — Home
      </h2>

      <ScreenFrame id="home-menu" label="Home — Menu (0 rooms)" themeMode={themeMode}>
        <HomePreview mode="menu" />
      </ScreenFrame>

      <ScreenFrame id="home-create-step1" label="Home — Create Step 1 (Room Name)" themeMode={themeMode}>
        <HomePreview mode="create" roomName="Команда Альфа" />
      </ScreenFrame>

      <ScreenFrame id="home-create-step2" label="Home — Create Step 2 (Discipline Picker)" themeMode={themeMode}>
        <HomePreview mode="pick-discipline" selectedDiscipline="pushups" />
      </ScreenFrame>

      <ScreenFrame id="home-join" label="Home — Join" themeMode={themeMode}>
        <HomePreview mode="join" joinCode="ABC1" />
      </ScreenFrame>

      <ScreenFrame id="home-rooms" label="Home — Room List (3 rooms)" themeMode={themeMode}>
        <HomePreview mode="menu" rooms={mockRooms.map(r => ({ roomCode: r.roomCode, roomName: r.roomName }))} />
      </ScreenFrame>

      <ScreenFrame id="home-rooms-new" label="Home — Room List + new_room()" themeMode={themeMode}>
        <HomePreview
          mode="menu"
          rooms={mockRooms.map(r => ({ roomCode: r.roomCode, roomName: r.roomName }))}
          showNew
        />
      </ScreenFrame>

      <h2 id="workout" className="mb-6 mt-12 border-b border-gray-700 pb-2 text-lg font-bold text-white">
        03 — Room / Workout
      </h2>

      <ScreenFrame
        id="workout-off"
        label="Workout — Camera Off"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="workout"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            cameraState="off"
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="workout-countdown"
        label="Workout — Countdown"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="workout"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            cameraState="countdown"
            cameraCount={3}
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="workout-active"
        label="Workout — Session Active"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="workout"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            cameraState="active"
            cameraCount={5}
            cameraElapsed={42}
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="workout-hold"
        label="Workout — Hold (Plank)"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={{ ...mockRoom, discipline: 'plank' }}
            tab="workout"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            cameraState="hold"
            cameraCount={35}
            cameraElapsed={35}
            cameraHoldProgress={0.6}
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame id="room-loading" label="Room — Loading" themeMode={themeMode}>
        <AppLoadingScreen />
      </ScreenFrame>

      <h2 id="leaderboard" className="mb-6 mt-12 border-b border-gray-700 pb-2 text-lg font-bold text-white">
        04 — Room / Leaderboard
      </h2>

      <ScreenFrame
        id="leaderboard-empty"
        label="Leaderboard — Empty"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={{
              ...mockRoom,
              leaderboard: [],
              stats: { ...mockRoom.stats, totalValue: 0, participantsCount: 0, sessionsCount: 0, activeToday: 0 },
            }}
            tab="leaderboard"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="leaderboard-filled"
        label="Leaderboard — Filled"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="leaderboard"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )}
      />

      <h2 id="settings-profile" className="mb-6 mt-12 border-b border-gray-700 pb-2 text-lg font-bold text-white">
        05 — Room / Settings + Profile
      </h2>

      <ScreenFrame
        id="settings-default"
        label="Settings — Rename + Participants (Owner)"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="settings"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="settings-delete"
        label="Settings — Delete Expanded"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="settings"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            showDeleteConfirm
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="profile-owner"
        label="Profile — Owner"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="profile"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="profile-member"
        label="Profile — Member"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoomMember}
            tab="profile"
            currentParticipantId="p2"
            profileName="Мария"
            profileEmail="maria@example.com"
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="profile-logout"
        label="Profile — Logout Confirm"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="profile"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            showLogoutConfirm
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="profile-leave"
        label="Profile — Leave Confirm (Member)"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoomMember}
            tab="profile"
            currentParticipantId="p2"
            profileName="Мария"
            profileEmail="maria@example.com"
            showLeaveConfirm
            isMobile={isMobile}
          />
        )}
      />

      <ScreenFrame
        id="header-switcher"
        label="Header — Switcher Open"
        themeMode={themeMode}
        render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="workout"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            showSwitcher
            rooms={mockRooms.map(r => ({ roomCode: r.roomCode, roomName: r.roomName }))}
            isMobile={isMobile}
          />
        )}
      />
    </>
  )
}
