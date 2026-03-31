'use client'

import { PreviewIcon as Icon } from './PreviewIcon'
import { exerciseConfigs } from '@/lib/exerciseConfigs'

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] tracking-widest text-[var(--muted)] mb-3">{'// ' + label}</div>
  )
}

export function ComponentSheet() {
  const sampleRooms = [
    { roomCode: 'ALPHA', roomName: 'Morning Crew', active: true },
    { roomCode: 'BETA', roomName: 'Evening Squad', active: false },
  ]

  const leaderboardSample = [
    { id: '1', name: 'Иван Иванов', totalValue: 320, sessionsCount: 12, bestSession: 45, activeToday: true, you: false },
    { id: '2', name: 'Мария Смирнова', totalValue: 280, sessionsCount: 9, bestSession: 40, activeToday: false, you: true },
    { id: '3', name: 'Алексей Петров', totalValue: 210, sessionsCount: 7, bestSession: 35, activeToday: true, you: false },
    { id: '4', name: 'Ольга Кузнецова', totalValue: 150, sessionsCount: 5, bestSession: 30, activeToday: false, you: false },
  ]

  const disciplineSample = exerciseConfigs

  return (
    <div className="min-h-[700px] bg-[var(--bg)] text-[var(--text)] p-6 space-y-10">

      {/* Buttons */}
      <section>
        <SectionLabel label="buttons" />
        <div className="flex flex-wrap gap-3 items-center">
          <button className="px-4 py-2.5 text-sm text-white bg-[var(--accent-default)] hover:opacity-85 transition-opacity">
            primary()
          </button>
          <button
            className="px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-dim)] transition-colors"
            style={{ border: '1px solid var(--border)' }}
          >
            secondary()
          </button>
          <button className="px-4 py-2.5 text-sm text-white bg-[#ef4444] hover:opacity-85 transition-opacity">
            danger()
          </button>
          <button
            disabled
            className="px-4 py-2.5 text-sm text-white bg-[var(--accent-default)] disabled:opacity-40"
          >
            disabled()
          </button>
          <button
            disabled
            className="px-4 py-2.5 text-sm text-[var(--muted)] disabled:opacity-40"
            style={{ border: '1px solid var(--border)' }}
          >
            {'// loading...'}
          </button>
          <button
            className="px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            style={{ border: '1px solid var(--border)' }}
          >
            logout()
          </button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <SectionLabel label="inputs" />
        <div className="flex flex-col gap-3 max-w-sm">
          <input
            type="text"
            readOnly
            className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
            style={{ border: '1px solid var(--border)' }}
            placeholder="placeholder text"
          />
          <input
            type="text"
            readOnly
            defaultValue="existing value"
            className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
          <input
            type="text"
            readOnly
            className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
            style={{ border: '1px solid #ef4444' }}
            placeholder="error state"
          />
          <p className="text-[11px] text-[#ef4444]">! ошибка: поле обязательно для заполнения</p>
        </div>
      </section>

      {/* Discipline cards */}
      <section>
        <SectionLabel label="discipline_cards" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-2xl">
          {disciplineSample.map((config, i) => {
            const selected = i === 0
            return (
              <button
                key={config.slug}
                className={`flex flex-col items-center gap-2 p-3 text-center transition-colors ${
                  selected
                    ? 'bg-[var(--accent-default)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-dim)]'
                }`}
                style={{ border: selected ? '1px solid var(--accent-default)' : '1px solid var(--border)' }}
              >
                <Icon name={config.icon} size={20} style={{ color: selected ? 'white' : 'var(--muted)' }} />
                <span className="text-[10px] tracking-wide leading-tight">{config.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Leaderboard rows */}
      <section>
        <SectionLabel label="leaderboard_row" />
        <div className="max-w-md overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {leaderboardSample.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderBottom: '1px solid var(--border)',
                background: p.you ? 'var(--surface-dim)' : undefined,
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
                  {p.you && (
                    <span className="text-[10px] tracking-wider text-[var(--accent-default)] shrink-0">[you]</span>
                  )}
                  {p.activeToday && (
                    <span className="text-[10px] tracking-wider text-[#22c55e] shrink-0">[active]</span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  {p.sessionsCount} sessions · best: {p.bestSession}
                </div>
              </div>
              <span className="text-sm font-bold tabular-nums shrink-0">{p.totalValue}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tab bar */}
      <section>
        <SectionLabel label="tab_bar" />
        <div className="max-w-xs" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
          {/* Desktop tabs */}
          <div className="hidden sm:flex items-stretch h-11" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['workout', 'leaderboard', 'settings', 'profile'] as const).map((t, i) => (
              <button
                key={t}
                className={`px-4 text-[11px] tracking-wide transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  i === 0
                    ? 'border-[var(--accent-default)] text-[var(--text)] font-bold'
                    : 'border-transparent text-[var(--muted)]'
                }`}
              >
                <Icon
                  name={t === 'leaderboard' ? 'emoji_events' : t === 'profile' ? 'person' : t === 'settings' ? 'settings' : 'fitness_center'}
                  size={13}
                />
                {t}
              </button>
            ))}
          </div>
          {/* Mobile tab bar */}
          <div className="flex sm:hidden">
            {(['workout', 'leaderboard', 'settings', 'profile'] as const).map((t, i) => (
              <button
                key={t}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  i === 0 ? 'text-[var(--accent-default)]' : 'text-[var(--muted)]'
                }`}
              >
                <Icon
                  name={t === 'workout' ? 'fitness_center' : t === 'leaderboard' ? 'emoji_events' : t === 'settings' ? 'settings' : 'person'}
                  size={20}
                />
                <span className="text-[10px] tracking-wide">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Switcher items */}
      <section>
        <SectionLabel label="switcher_item" />
        <div className="max-w-xs" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {sampleRooms.map(r => (
            <div
              key={r.roomCode}
              className={`flex items-center transition-colors ${r.active ? 'bg-[var(--surface-dim)]' : 'hover:bg-[var(--surface-dim)]'}`}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-3 text-xs min-w-0">
                <span className={`truncate ${r.active ? 'font-medium text-[var(--text)]' : 'text-[var(--text)]'}`}>
                  {r.roomName}
                </span>
                {r.active && (
                  <span className="text-[10px] tracking-wider text-[var(--accent-default)] shrink-0">[active]</span>
                )}
              </div>
              <div className="flex items-center gap-2 pr-3 shrink-0">
                <span className="text-[10px] text-[var(--muted)]">{r.roomCode}</span>
                <button
                  className="flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  aria-label="скопировать код"
                >
                  <Icon name="content_copy" size={16} />
                </button>
              </div>
            </div>
          ))}
          <button className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 text-xs text-[var(--accent-default)] hover:bg-[var(--surface-dim)] transition-colors text-left">
            <Icon name="add" size={14} />
            <span>add_room()</span>
          </button>
        </div>
      </section>

    </div>
  )
}
