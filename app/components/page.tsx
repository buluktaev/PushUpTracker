'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { areReviewRoutesEnabled } from '@/lib/review-routes'

const componentPages = [
  {
    href: '/components/buttons',
    title: 'Buttons',
    description: 'Primary, secondary, danger, loading, disabled, and interactive state validation.',
    status: 'Ready',
  },
  {
    href: '/components/inputs',
    title: 'Inputs',
    description: 'Label, placeholder, icon toggle, caption toggle, validation, and state coverage.',
    status: 'Ready',
  },
  {
    href: '/components/text-button',
    title: 'Text Button',
    description: 'Inline action states, icon toggle, disabled, and loading coverage.',
    status: 'Ready',
  },
  {
    href: '/components/icon-button',
    title: 'Icon Button',
    description: 'Icon-only action states, border/background treatment, and loading coverage.',
    status: 'Ready',
  },
]

export default function ComponentsPage() {
  if (!areReviewRoutesEnabled()) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-900 p-6 text-zinc-50">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <header className="border border-zinc-700 bg-zinc-900 px-6 py-6">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">components</div>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-zinc-50">Design system pages</h1>
          <p className="mt-3 max-w-[680px] text-sm leading-6 text-zinc-400">
            Each component gets its own review page so we can lock states, interactions, and theme behavior
            without drowning in one giant matrix.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {componentPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group border border-zinc-700 bg-zinc-900 p-6 transition-colors hover:border-zinc-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium text-zinc-50">{page.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{page.description}</p>
                </div>
                <span className="border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-300">
                  {page.status}
                </span>
              </div>
              <div className="mt-6 text-[11px] uppercase tracking-[0.12em] text-zinc-500 group-hover:text-zinc-300">
                Open page
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
