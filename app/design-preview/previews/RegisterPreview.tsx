'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface RegisterPreviewProps {
  error?: string
  loading?: boolean
}

export function RegisterPreview({ error, loading }: RegisterPreviewProps) {
  return (
    <main className="relative min-h-[600px] flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="absolute top-3 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icon.svg" width={20} height={20} alt="" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              {'// pushup tracker'}
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-[1.15] tracking-tight">
            register()
          </h1>
          <p className="text-xs text-[var(--muted)] mt-2.5">создать аккаунт</p>
        </div>

        <form className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              name =
            </label>
            <input
              type="text"
              placeholder="Иван"
              defaultValue="Иван"
              readOnly
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent-default)] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              email =
            </label>
            <input
              type="email"
              placeholder="ivan@example.com"
              defaultValue="ivan@example.com"
              readOnly
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent-default)] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              password =
            </label>
            <input
              type="password"
              placeholder="минимум 6 символов"
              defaultValue="password"
              readOnly
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent-default)] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            />
          </div>

          {error && <p className="text-[11px] text-[#ef4444]">! {error}</p>}

          <button
            type="button"
            disabled={loading}
            className="w-full py-3 text-sm font-normal text-white bg-[var(--accent-default)] disabled:opacity-40 hover:opacity-85 transition-opacity mt-1"
          >
            {loading ? '// регистрируем...' : 'execute()'}
          </button>
        </form>

        <p className="text-xs text-[var(--muted)] mt-6">
          уже есть аккаунт?{' '}
          <Link href="/login" className="text-[var(--accent-default)] hover:underline">
            login()
          </Link>
        </p>
      </div>
    </main>
  )
}
