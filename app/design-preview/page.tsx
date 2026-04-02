'use client'

import { useEffect } from 'react'
import { notFound } from 'next/navigation'
import { ComponentSheet } from './previews/ComponentSheet'
import { DesignSystemLight } from './previews/DesignSystemLight'
import { DesignSystemDark } from './previews/DesignSystemDark'
import { ScreenCatalog } from './previews/ScreenCatalog'

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
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://mcp.figma.com/mcp/html-to-design/capture.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="sticky top-0 z-50 flex gap-4 overflow-x-auto border-b border-gray-700 bg-gray-900 px-6 py-3">
        <span className="shrink-0 text-xs font-bold text-gray-400">Design Preview</span>
        {NAV_ITEMS.map(item => (
          <a key={item.id} href={`#${item.id}`} className="shrink-0 text-xs text-gray-400 hover:text-white">
            {item.label}
          </a>
        ))}
      </nav>

      <main className="mx-auto max-w-[1600px] p-6">
        <ScreenCatalog themeMode="both" />

        <h2 id="design-system" className="mb-6 mt-12 border-b border-gray-700 pb-2 text-lg font-bold text-white">
          06 — Design System
        </h2>

        <section id="ds-light" className="mb-16">
          <h3 className="mb-4 inline-block bg-gray-800 px-2 py-1 text-sm font-bold text-white">
            Design System — Light
          </h3>
          <div className="overflow-hidden border border-gray-700" style={{ width: 1440 }}>
            <DesignSystemLight />
          </div>
        </section>

        <section id="ds-dark" className="mb-16">
          <h3 className="mb-4 inline-block bg-gray-800 px-2 py-1 text-sm font-bold text-white">
            Design System — Dark
          </h3>
          <div className="overflow-hidden border border-gray-700" style={{ width: 1440 }}>
            <DesignSystemDark />
          </div>
        </section>

        <h2 id="components" className="mb-6 mt-12 border-b border-gray-700 pb-2 text-lg font-bold text-white">
          07 — Components
        </h2>

        <section id="component-sheet" className="mb-16">
          <h3 className="mb-4 inline-block bg-gray-800 px-2 py-1 text-sm font-bold text-white">Component Sheet</h3>
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500">Light · Desktop 1440px</span>
              <div style={{ width: 1440 }} className="overflow-hidden border border-gray-700" data-theme="light">
                <ComponentSheet />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500">Dark · Desktop 1440px</span>
              <div style={{ width: 1440 }} className="overflow-hidden border border-gray-700" data-theme="dark">
                <ComponentSheet />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
