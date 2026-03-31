'use client'

import { notFound } from 'next/navigation'
import { useState } from 'react'
import { ComponentSheet } from '@/app/design-preview/previews/ComponentSheet'

export default function ComponentsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-[960px] space-y-4">
        <div className="flex items-center justify-between border border-zinc-700 bg-zinc-900 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">components preview</div>
          <div className="inline-flex border border-zinc-700 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className="min-w-[88px] px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
              style={{
                backgroundColor: theme === 'light' ? '#fafafa' : 'transparent',
                color: theme === 'light' ? '#171717' : '#a1a1aa',
              }}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className="min-w-[88px] px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
              style={{
                backgroundColor: theme === 'dark' ? '#262626' : 'transparent',
                color: theme === 'dark' ? '#fafafa' : '#a1a1aa',
              }}
            >
              Dark
            </button>
          </div>
        </div>

        <section className="overflow-hidden border border-zinc-700" data-theme={theme}>
          <ComponentSheet />
        </section>
      </div>
    </main>
  )
}
