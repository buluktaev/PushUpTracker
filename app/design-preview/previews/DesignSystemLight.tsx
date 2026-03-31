'use client'

import { PreviewIcon as Icon } from './PreviewIcon'

// ─── Hardcoded light theme colors ────────────────────────────────────────────
const L = {
  bg: '#FAF9F5',
  surface: '#FFFFFF',
  surfaceDim: '#F0EFE9',
  text: '#111111',
  muted: '#888880',
  border: '#E5E3DC',
}

// ─── Primitives ───────────────────────────────────────────────────────────────

const primitives = [
  { hex: '#FF6B35', label: 'orange/500' },
  { hex: '#EF4444', label: 'red/500' },
  { hex: '#22C55E', label: 'green/500' },
  { hex: '#F59E0B', label: 'amber/500' },
  { hex: '#FAF9F5', label: 'neutral/50' },
  { hex: '#FFFFFF', label: 'neutral/0' },
  { hex: '#F0EFE9', label: 'neutral/100' },
  { hex: '#E5E3DC', label: 'neutral/200' },
  { hex: '#888880', label: 'neutral/500' },
  { hex: '#111111', label: 'neutral/900' },
  { hex: '#161616', label: 'neutral/950' },
  { hex: '#1c1c1c', label: 'neutral/925' },
  { hex: '#141414', label: 'neutral/940' },
  { hex: '#2a2a2a', label: 'neutral/850' },
  { hex: '#e8e6e1', label: 'neutral/150' },
  { hex: '#666660', label: 'neutral/600' },
  { hex: '#F7C948', label: 'gold' },
  { hex: '#B8B8B8', label: 'silver' },
  { hex: '#CD7F32', label: 'bronze' },
]

// ─── Semantic Tokens (light values only) ─────────────────────────────────────

const tokensBg = [
  { hex: '#FAF9F5', label: 'bg/primary' },
  { hex: '#FFFFFF', label: 'bg/surface' },
  { hex: '#F0EFE9', label: 'bg/surface-dim' },
]

const tokensText = [
  { hex: '#111111', label: 'text/primary' },
  { hex: '#888880', label: 'text/secondary' },
  { hex: '#FFFFFF', label: 'text/on-accent' },
  { hex: '#FF6B35', label: 'text/accent' },
  { hex: '#EF4444', label: 'text/danger' },
  { hex: '#22C55E', label: 'text/success' },
]

const tokensBorder = [
  { hex: '#E5E3DC', label: 'border/default' },
  { hex: '#FF6B35', label: 'border/accent' },
  { hex: '#EF4444', label: 'border/danger' },
]

const tokensIcon = [
  { hex: '#888880', label: 'icon/default' },
  { hex: '#FF6B35', label: 'icon/accent' },
  { hex: '#22C55E', label: 'icon/active' },
]

const tokensAccent = [
  { hex: '#FF6B35', label: 'accent/default' },
  { hex: '#E5612F', label: 'accent/hover' },
  { hex: '#CC5629', label: 'accent/pressed' },
  { hex: '#FF6B3566', label: 'accent/disabled' },
]

const tokensDanger = [
  { hex: '#EF4444', label: 'danger/default' },
  { hex: '#EF444414', label: 'danger/weak' },
]

const tokensSuccess = [
  { hex: '#22C55E', label: 'success/default' },
]

// ─── Typography ───────────────────────────────────────────────────────────────

const typographyRows = [
  {
    style: 'heading/h1',
    spec: '28px · 700',
    element: <span style={{ fontSize: 28, fontWeight: 700 }}>Командный трекер</span>,
  },
  {
    style: 'heading/h2',
    spec: '18px · 700',
    element: <span style={{ fontSize: 18, fontWeight: 700 }}>Как вас зовут?</span>,
  },
  {
    style: 'body/sm',
    spec: '14px · 400',
    element: <span style={{ fontSize: 14 }}>create_room()&nbsp;&nbsp;Команда Альфа&nbsp;&nbsp;1 234 reps</span>,
  },
  {
    style: 'body/xs',
    spec: '12px · 400',
    element: <span style={{ fontSize: 12 }}>создай комнату или войди по коду&nbsp;&nbsp;← back</span>,
  },
  {
    style: 'label/mono',
    spec: '10px · widest · uppercase',
    element: (
      <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        ROOM_NAME =&nbsp;&nbsp;// PUSHUP TRACKER&nbsp;&nbsp;YOUR_NAME =
      </span>
    ),
  },
  {
    style: 'meta/desktop-btn',
    spec: '11px · wide',
    element: (
      <span style={{ fontSize: 11, letterSpacing: '0.08em' }}>
        [ dark ]&nbsp;&nbsp;exit()&nbsp;&nbsp;refresh()&nbsp;&nbsp;add_room()
      </span>
    ),
  },
  {
    style: 'code/room',
    spec: '14px · 0.25em spacing',
    element: <span style={{ fontSize: 14, letterSpacing: '0.25em' }}>A B C 1 2 3</span>,
  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

const ALL_ICONS = [
  'fitness_center',
  'emoji_events',
  'settings',
  'person',
  'photo_camera',
  'content_copy',
  'expand_more',
  'expand_less',
  'arrow_forward',
  'add',
  'dark_mode',
  'light_mode',
  'check',
  'close',
  'crown',
  'sports_martial_arts',
  'airline_seat_flat',
  'exercise',
  'iron',
  'pan_tool_alt',
  'keyboard_double_arrow_up',
  'directions_walk',
  'directions_run',
  'horizontal_rule',
  'logout',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16"
        style={{ background: hex, border: `1px solid ${L.border}` }}
      />
      <span className="text-[10px] tracking-wide" style={{ color: L.muted }}>{label}</span>
      <span className="text-[10px] font-mono" style={{ color: L.muted }}>{hex}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DesignSystemLight() {
  return (
    <div
      className="min-h-[700px] p-6 space-y-10"
      style={{ background: L.bg, color: L.text }}
    >
      {/* Header */}
      <div className="space-y-1 pb-4" style={{ borderBottom: `1px solid ${L.border}` }}>
        <div className="text-[10px] tracking-widest" style={{ color: L.muted }}>// DESIGN SYSTEM</div>
        <div className="text-2xl font-bold tracking-tight">PushUpTracker</div>
        <div className="text-[11px] tracking-wide" style={{ color: L.muted }}>
          Geist Mono · Material Symbols · Zero border-radius
        </div>
      </div>

      {/* 01a — PRIMITIVES */}
      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          01a — PRIMITIVES
        </div>
        <div className="flex flex-wrap gap-4">
          {primitives.map(s => <Swatch key={s.label} {...s} />)}
        </div>
      </section>

      {/* 01b — SEMANTIC TOKENS (LIGHT) */}
      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          01b — SEMANTIC TOKENS (LIGHT)
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>bg/</div>
            <div className="flex flex-wrap gap-4">
              {tokensBg.map(s => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>text/</div>
            <div className="flex flex-wrap gap-4">
              {tokensText.map(s => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>border/</div>
            <div className="flex flex-wrap gap-4">
              {tokensBorder.map(s => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>icon/</div>
            <div className="flex flex-wrap gap-4">
              {tokensIcon.map(s => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>accent/</div>
            <div className="flex flex-wrap gap-4">
              {tokensAccent.map(s => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>danger/ + success/</div>
            <div className="flex flex-wrap gap-4">
              {tokensDanger.map(s => <Swatch key={s.label} {...s} />)}
              {tokensSuccess.map(s => <Swatch key={s.label} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — TYPOGRAPHY */}
      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          02 — TYPOGRAPHY · GEIST MONO
        </div>

        <div className="space-y-0" style={{ border: `1px solid ${L.border}` }}>
          {typographyRows.map((row) => (
            <div
              key={row.style}
              className="flex items-center gap-6 px-4 py-3"
              style={{ borderBottom: `1px solid ${L.border}` }}
            >
              <div className="w-44 shrink-0">
                <div className="text-[10px] font-bold tracking-wide" style={{ color: L.muted }}>{row.style}</div>
                <div className="text-[10px] mt-0.5" style={{ color: L.muted }}>{row.spec}</div>
              </div>
              <div style={{ color: L.text }}>{row.element}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 03 — ICONS */}
      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          03 — ICONS · MATERIAL SYMBOLS OUTLINED · FILL=1 WGHT=400 GRAD=-25 OPSZ=20
        </div>

        <div className="flex flex-wrap gap-4">
          {ALL_ICONS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5 w-16">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ border: `1px solid ${L.border}`, background: L.surface }}
              >
                <Icon name={name} size={24} style={{ color: L.text }} />
              </div>
              <span className="text-[10px] text-center leading-tight break-all" style={{ color: L.muted }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
