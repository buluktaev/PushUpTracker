'use client'

import type { CSSProperties, ComponentType } from 'react'

export interface LeaderboardParticipant {
  id: string
  name: string
  totalValue: number
  sessionsCount: number
  bestSession: number
  streakDays: number
  activeToday: boolean
}

function formatStreakDays(days: number): string {
  const mod10 = days % 10
  const mod100 = days % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${days} день`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${days} дня`
  }

  return `${days} дней`
}

interface IconComponentProps {
  name: string
  size?: number
  style?: CSSProperties
}

interface RoomLeaderboardProps {
  participants: LeaderboardParticipant[]
  currentParticipantId?: string
  formatMetric: (value: number) => string
  IconComponent: ComponentType<IconComponentProps>
}

const RANK_COLORS = ['#F7C948', '#B8B8B8', '#CD7F32']

function rankMarker(
  rank: number,
  IconComponent: ComponentType<IconComponentProps>,
) {
  if (rank <= 3) {
    return <IconComponent name="crown" size={16} style={{ color: RANK_COLORS[rank - 1] }} />
  }

  return (
    <span
      className="tabular-nums text-[12px] leading-[18px] text-[var(--text)]"
      style={{ fontFamily: 'var(--font-family-secondary)', fontWeight: 400, letterSpacing: 'var(--letter-spacing-0)' }}
    >
      {String(rank).padStart(2, '0')}
    </span>
  )
}

function RoomLeaderboardRow({
  participant,
  rank,
  isCurrent,
  isLast,
  formatMetric,
  IconComponent,
}: {
  participant: LeaderboardParticipant
  rank: number
  isCurrent: boolean
  isLast: boolean
  formatMetric: (value: number) => string
  IconComponent: ComponentType<IconComponentProps>
}) {
  return (
    <div
      className="flex h-[60px] items-start gap-3 px-3 py-2"
      style={{
        background: isCurrent ? 'var(--bg-primary)' : 'var(--surface)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {rankMarker(rank, IconComponent)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div className="flex min-w-0 items-center">
          <span
            className="truncate text-[16px] leading-6 text-[var(--text)]"
            style={{
              fontFamily: 'var(--font-family-primary)',
              fontWeight: 400,
              letterSpacing: 'var(--letter-spacing-0)',
            }}
          >
            {isCurrent ? 'Вы' : participant.name}
          </span>
        </div>
        <div
          className="truncate text-[12px] leading-[18px] text-[var(--text-secondary)]"
          style={{
            fontFamily: 'var(--font-family-secondary)',
            fontWeight: 400,
            letterSpacing: 'var(--letter-spacing-0)',
          }}
        >
          сессий: {participant.sessionsCount} · лучшая: {formatMetric(participant.bestSession)} · стрик: {formatStreakDays(participant.streakDays)}
        </div>
      </div>

      <div
        className="shrink-0 text-[16px] leading-6 text-[var(--text)] tabular-nums"
        style={{
          fontFamily: 'var(--font-family-secondary)',
          fontWeight: 400,
          letterSpacing: 'var(--letter-spacing-0)',
        }}
      >
        {formatMetric(participant.totalValue)}
      </div>
    </div>
  )
}

export default function RoomLeaderboard({
  participants,
  currentParticipantId,
  formatMetric,
  IconComponent,
}: RoomLeaderboardProps) {
  if (participants.length === 0) {
    return (
      <div
        className="flex h-[60px] items-center px-3 text-[12px] leading-[18px] text-[var(--text-secondary)]"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-family-secondary)',
          fontWeight: 400,
          letterSpacing: 'var(--letter-spacing-0)',
        }}
      >
        пока никого нет
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--border)' }}>
      {participants.map((participant, index) => (
        <RoomLeaderboardRow
          key={participant.id}
          participant={participant}
          rank={index + 1}
          isCurrent={participant.id === currentParticipantId}
          isLast={index === participants.length - 1}
          formatMetric={formatMetric}
          IconComponent={IconComponent}
        />
      ))}
    </div>
  )
}
