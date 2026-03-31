'use client'

import { useEffect } from 'react'
import { notFound } from 'next/navigation'
import { LoginPreview } from './previews/LoginPreview'
import { RegisterPreview } from './previews/RegisterPreview'
import { VerifyEmailPreview } from './previews/VerifyEmailPreview'
import HomePreview from './previews/HomePreview'
import { RoomPreview } from './previews/RoomPreview'
import { ComponentSheet } from './previews/ComponentSheet'
import { DesignSystemLight } from './previews/DesignSystemLight'
import { DesignSystemDark } from './previews/DesignSystemDark'
import { mockRooms, mockRoom, mockRoomMember, mockProfile } from './mock-data'


interface FrameProps {
  id: string
  label: string
  children?: React.ReactNode
  render?: (opts: { isMobile: boolean }) => React.ReactNode
}

function Frame({ id, label, children, render }: FrameProps) {
  const content = (isMobile: boolean) => render ? render({ isMobile }) : children
  return (
    <section id={id} className="mb-16">
      <h3 className="text-sm font-bold text-white mb-4 px-2 py-1 bg-gray-800 inline-block">
        {label}
      </h3>
      <div className="flex flex-wrap gap-8">
        {/* Light Mobile */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500">Light · Mobile 375px</span>
          <div style={{ width: 375 }} className="border border-gray-700 overflow-hidden" data-theme="light">
            {content(true)}
          </div>
        </div>
        {/* Dark Mobile */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500">Dark · Mobile 375px</span>
          <div style={{ width: 375 }} className="border border-gray-700 overflow-hidden" data-theme="dark">
            {content(true)}
          </div>
        </div>
        {/* Light Desktop */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500">Light · Desktop 1440px</span>
          <div style={{ width: 1440 }} className="border border-gray-700 overflow-hidden" data-theme="light">
            {content(false)}
          </div>
        </div>
        {/* Dark Desktop */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500">Dark · Desktop 1440px</span>
          <div style={{ width: 1440 }} className="border border-gray-700 overflow-hidden" data-theme="dark">
            {content(false)}
          </div>
        </div>
      </div>
    </section>
  )
}

const NAV_ITEMS = [
  { id: 'auth', label: '01 — Auth' },
  { id: 'home', label: '02 — Home' },
  { id: 'workout', label: '03 — Workout' },
  { id: 'leaderboard', label: '04 — Leaderboard' },
  { id: 'settings-profile', label: '05 — Settings + Profile' },
  { id: 'design-system', label: '06 — Design System' },
  { id: 'components', label: '07 — Components' },
]

export default function DesignPreviewPage() {
  // Dev-only guard
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  // Inject Figma capture script (only on this page, not in layout)
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://mcp.figma.com/mcp/html-to-design/capture.js'
    script.async = true
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-3 flex gap-4 overflow-x-auto">
        <span className="text-xs font-bold text-gray-400 shrink-0">Design Preview</span>
        {NAV_ITEMS.map(item => (
          <a key={item.id} href={`#${item.id}`} className="text-xs text-gray-400 hover:text-white shrink-0">
            {item.label}
          </a>
        ))}
      </nav>

      <main className="p-6 max-w-[1600px] mx-auto">

        {/* ========== 01 — AUTH ========== */}
        <h2 id="auth" className="text-lg font-bold text-white mb-6 mt-4 border-b border-gray-700 pb-2">
          01 — Auth
        </h2>

        <Frame id="login-default" label="Login — Default">
          <LoginPreview />
        </Frame>

        <Frame id="login-error" label="Login — Error">
          <LoginPreview error="Неверный email или пароль" />
        </Frame>

        <Frame id="register-default" label="Register — Default">
          <RegisterPreview />
        </Frame>

        <Frame id="register-error" label="Register — Error">
          <RegisterPreview error="Пользователь с таким email уже существует" />
        </Frame>

        <Frame id="verify-email" label="Verify Email — Default">
          <VerifyEmailPreview email="ivan@example.com" attemptsLeft={2} />
        </Frame>

        <Frame id="verify-email-blocked" label="Verify Email — Rate Limited">
          <VerifyEmailPreview email="ivan@example.com" isBlocked secondsLeft={847} />
        </Frame>

        {/* ========== 02 — HOME ========== */}
        <h2 id="home" className="text-lg font-bold text-white mb-6 mt-12 border-b border-gray-700 pb-2">
          02 — Home
        </h2>

        <Frame id="home-menu" label="Home — Menu (0 rooms)">
          <HomePreview mode="menu" />
        </Frame>

        <Frame id="home-create-step1" label="Home — Create Step 1 (Room Name)">
          <HomePreview mode="create" roomName="Команда Альфа" />
        </Frame>

        <Frame id="home-create-step2" label="Home — Create Step 2 (Discipline Picker)">
          <HomePreview mode="pick-discipline" selectedDiscipline="pushups" />
        </Frame>

        <Frame id="home-join" label="Home — Join">
          <HomePreview mode="join" joinCode="ABC1" />
        </Frame>

        <Frame id="home-rooms" label="Home — Room List (3 rooms)">
          <HomePreview mode="menu" rooms={mockRooms.map(r => ({ roomCode: r.roomCode, roomName: r.roomName }))} />
        </Frame>

        <Frame id="home-rooms-new" label="Home — Room List + new_room()">
          <HomePreview mode="menu" rooms={mockRooms.map(r => ({ roomCode: r.roomCode, roomName: r.roomName }))} showNew />
        </Frame>

        {/* ========== 03 — WORKOUT ========== */}
        <h2 id="workout" className="text-lg font-bold text-white mb-6 mt-12 border-b border-gray-700 pb-2">
          03 — Room / Workout
        </h2>

        <Frame id="workout-off" label="Workout — Camera Off" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="workout"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            cameraState="off"
            isMobile={isMobile}
          />
        )} />

        <Frame id="workout-countdown" label="Workout — Countdown" render={({ isMobile }) => (
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
        )} />

        <Frame id="workout-active" label="Workout — Session Active" render={({ isMobile }) => (
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
        )} />

        <Frame id="workout-hold" label="Workout — Hold (Plank)" render={({ isMobile }) => (
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
        )} />

        <Frame id="room-loading" label="Room — Loading">
          <div className="min-h-[400px] flex items-center justify-center bg-[var(--bg)]">
            <span className="text-[10px] tracking-widest text-[var(--muted)]">{'// загрузка...'}</span>
          </div>
        </Frame>

        {/* ========== 04 — LEADERBOARD ========== */}
        <h2 id="leaderboard" className="text-lg font-bold text-white mb-6 mt-12 border-b border-gray-700 pb-2">
          04 — Room / Leaderboard
        </h2>

        <Frame id="leaderboard-empty" label="Leaderboard — Empty" render={({ isMobile }) => (
          <RoomPreview
            room={{ ...mockRoom, leaderboard: [], stats: { ...mockRoom.stats, totalValue: 0, participantsCount: 0, sessionsCount: 0, activeToday: 0 } }}
            tab="leaderboard"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )} />

        <Frame id="leaderboard-filled" label="Leaderboard — Filled" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="leaderboard"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )} />

        {/* ========== 05 — SETTINGS + PROFILE ========== */}
        <h2 id="settings-profile" className="text-lg font-bold text-white mb-6 mt-12 border-b border-gray-700 pb-2">
          05 — Room / Settings + Profile
        </h2>

        <Frame id="settings-default" label="Settings — Rename + Participants (Owner)" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="settings"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )} />

        <Frame id="settings-delete" label="Settings — Delete Expanded" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="settings"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            showDeleteConfirm
            isMobile={isMobile}
          />
        )} />

        <Frame id="profile-owner" label="Profile — Owner" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="profile"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            isMobile={isMobile}
          />
        )} />

        <Frame id="profile-member" label="Profile — Member" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoomMember}
            tab="profile"
            currentParticipantId="p2"
            profileName="Мария"
            profileEmail="maria@example.com"
            isMobile={isMobile}
          />
        )} />

        <Frame id="profile-logout" label="Profile — Logout Confirm" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoom}
            tab="profile"
            currentParticipantId="p1"
            profileName={mockProfile.name}
            profileEmail={mockProfile.email}
            showLogoutConfirm
            isMobile={isMobile}
          />
        )} />

        <Frame id="profile-leave" label="Profile — Leave Confirm (Member)" render={({ isMobile }) => (
          <RoomPreview
            room={mockRoomMember}
            tab="profile"
            currentParticipantId="p2"
            profileName="Мария"
            profileEmail="maria@example.com"
            showLeaveConfirm
            isMobile={isMobile}
          />
        )} />

        <Frame id="header-switcher" label="Header — Switcher Open" render={({ isMobile }) => (
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
        )} />

        {/* ========== 06 — DESIGN SYSTEM ========== */}
        <h2 id="design-system" className="text-lg font-bold text-white mb-6 mt-12 border-b border-gray-700 pb-2">
          06 — Design System
        </h2>

        <section id="ds-light" className="mb-16">
          <h3 className="text-sm font-bold text-white mb-4 px-2 py-1 bg-gray-800 inline-block">
            Design System — Light
          </h3>
          <div className="border border-gray-700 overflow-hidden" style={{ width: 1440 }}>
            <DesignSystemLight />
          </div>
        </section>

        <section id="ds-dark" className="mb-16">
          <h3 className="text-sm font-bold text-white mb-4 px-2 py-1 bg-gray-800 inline-block">
            Design System — Dark
          </h3>
          <div className="border border-gray-700 overflow-hidden" style={{ width: 1440 }}>
            <DesignSystemDark />
          </div>
        </section>

        {/* ========== 07 — COMPONENTS ========== */}
        <h2 id="components" className="text-lg font-bold text-white mb-6 mt-12 border-b border-gray-700 pb-2">
          07 — Components
        </h2>

        <Frame id="component-sheet" label="Component Sheet">
          <ComponentSheet />
        </Frame>

      </main>
    </div>
  )
}
