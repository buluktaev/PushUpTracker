'use client'

import { PreviewIcon as Icon } from './PreviewIcon'

const L = {
  bg: '#faf9f5',
  surface: '#ffffff',
  surfaceDim: '#f5f5f5',
  text: '#262626',
  muted: '#737373',
  border: '#f5f5f5',
}

const primitives = [
  { hex: '#c22302', label: 'accent/500' },
  { hex: '#f63700', label: 'accent/400' },
  { hex: '#ff510a', label: 'accent/300' },
  { hex: '#e5e5e5', label: 'accent/disabled' },
  { hex: '#dc2626', label: 'danger/500' },
  { hex: '#ef4444', label: 'danger/400' },
  { hex: '#f87171', label: 'danger/300' },
  { hex: '#fecaca', label: 'danger/weak' },
  { hex: '#22c55e', label: 'success/500' },
  { hex: '#bbf7d0', label: 'success/weak' },
  { hex: '#ffffff', label: 'neutral/0' },
  { hex: '#faf9f5', label: 'neutral/50' },
  { hex: '#f5f5f5', label: 'neutral/100' },
  { hex: '#e5e5e5', label: 'neutral/200' },
  { hex: '#d4d4d4', label: 'neutral/300' },
  { hex: '#a1a1a1', label: 'neutral/400' },
  { hex: '#737373', label: 'neutral/500' },
  { hex: '#525252', label: 'neutral/600' },
  { hex: '#404040', label: 'neutral/700' },
  { hex: '#262626', label: 'neutral/800' },
]

const tokensBg = [
  { hex: '#faf9f5', label: 'bg/primary' },
  { hex: '#ffffff', label: 'bg/surface' },
  { hex: '#f5f5f5', label: 'bg/surface-dim' },
]

const tokensText = [
  { hex: '#262626', label: 'text/primary' },
  { hex: '#737373', label: 'text/secondary' },
  { hex: '#ffffff', label: 'text/on-accent' },
  { hex: '#fafafa', label: 'text/on-accent-disabled' },
  { hex: '#c22302', label: 'text/accent' },
  { hex: '#dc2626', label: 'text/danger' },
  { hex: '#22c55e', label: 'text/success' },
  { hex: '#a1a1a1', label: 'text/disabled' },
]

const tokensBorder = [
  { hex: '#f5f5f5', label: 'border/primary-default' },
  { hex: '#d4d4d4', label: 'border/primary-hovered' },
  { hex: '#a1a1a1', label: 'border/primary-pressed' },
  { hex: '#f5f5f5', label: 'border/disabled' },
  { hex: '#c22302', label: 'border/accent' },
  { hex: '#dc2626', label: 'border/danger' },
]

const tokensIcon = [
  { hex: '#737373', label: 'icon/default' },
  { hex: '#a1a1a1', label: 'icon/disabled' },
  { hex: '#ffffff', label: 'icon/on-accent' },
]

const tokensAccent = [
  { hex: '#c22302', label: 'accent/default' },
  { hex: '#f63700', label: 'accent/hovered' },
  { hex: '#ff510a', label: 'accent/pressed' },
  { hex: '#e5e5e5', label: 'accent/disabled' },
]

const tokensDanger = [
  { hex: '#dc2626', label: 'danger/default' },
  { hex: '#ef4444', label: 'danger/hovered' },
  { hex: '#f87171', label: 'danger/pressed' },
  { hex: '#fecaca', label: 'danger/weak' },
]

const tokensSuccess = [
  { hex: '#22c55e', label: 'success/default' },
  { hex: '#bbf7d0', label: 'success/weak' },
]

const tokensWarning = [
  { hex: '#c22302', label: 'warning/default' },
  { hex: '#e5e5e5', label: 'warning/weak' },
]

const typographyRows = [
  {
    style: 'heading/h1',
    spec: '24px · 700 · lh 32px',
    element: <span style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>Командный трекер</span>,
  },
  {
    style: 'heading/h3',
    spec: '18px · 500 · lh 26px',
    element: <span style={{ fontSize: 18, fontWeight: 500, lineHeight: '26px' }}>Как вас зовут?</span>,
  },
  {
    style: 'body/sm',
    spec: '16px · 400 · lh 24px',
    element: <span style={{ fontSize: 16, lineHeight: '24px' }}>create_room() Команда Альфа 1 234 reps</span>,
  },
  {
    style: 'body/xs',
    spec: '14px · 400 · lh 22px',
    element: <span style={{ fontSize: 14, lineHeight: '22px' }}>создай комнату или войди по коду ← back</span>,
  },
  {
    style: 'label/xs-uppercase',
    spec: '12px · 400 · lh 18px · ls 1.5px',
    element: (
      <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        room_name = // pushup tracker
      </span>
    ),
  },
  {
    style: 'label/xs',
    spec: '12px · 400 · lh 18px',
    element: <span style={{ fontSize: 12, lineHeight: '18px' }}>[ dark ] exit() refresh() add_room()</span>,
  },
  {
    style: 'code/room',
    spec: '16px · 400 · lh 24px · ls 3.5px',
    element: <span style={{ fontSize: 16, lineHeight: '24px', letterSpacing: '3.5px' }}>A B C 1 2 3</span>,
  },
]

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

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16" style={{ background: hex, border: `1px solid ${L.border}` }} />
      <span className="text-[10px] tracking-wide" style={{ color: L.muted }}>{label}</span>
      <span className="text-[10px]" style={{ color: L.muted }}>{hex}</span>
    </div>
  )
}

export function DesignSystemLight() {
  return (
    <div className="min-h-[700px] p-6 space-y-10" style={{ background: L.bg, color: L.text }}>
      <div className="space-y-1 pb-4" style={{ borderBottom: `1px solid ${L.border}` }}>
        <div className="text-[10px] tracking-widest" style={{ color: L.muted }}>{'// DESIGN SYSTEM'}</div>
        <div className="text-2xl font-bold tracking-tight">PushUpTracker</div>
        <div className="text-[11px] tracking-wide" style={{ color: L.muted }}>
          Google Sans · Material Symbols · Zero border-radius
        </div>
      </div>

      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          01a — PRIMITIVES
        </div>
        <div className="flex flex-wrap gap-4">
          {primitives.map((s) => <Swatch key={s.label} {...s} />)}
        </div>
      </section>

      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          01b — SEMANTIC TOKENS (LIGHT)
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>bg/</div>
            <div className="flex flex-wrap gap-4">
              {tokensBg.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>text/</div>
            <div className="flex flex-wrap gap-4">
              {tokensText.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>border/</div>
            <div className="flex flex-wrap gap-4">
              {tokensBorder.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>icon/</div>
            <div className="flex flex-wrap gap-4">
              {tokensIcon.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>accent/</div>
            <div className="flex flex-wrap gap-4">
              {tokensAccent.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>danger/</div>
            <div className="flex flex-wrap gap-4">
              {tokensDanger.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-wide mb-3" style={{ color: L.muted }}>success/ + warning/</div>
            <div className="flex flex-wrap gap-4">
              {tokensSuccess.map((s) => <Swatch key={s.label} {...s} />)}
              {tokensWarning.map((s) => <Swatch key={s.label} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: L.muted }}>
          02 — TYPOGRAPHY · GOOGLE SANS
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
