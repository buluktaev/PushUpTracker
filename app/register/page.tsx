'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import ThemeToggle from '@/components/ThemeToggle'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('введите имя')
    if (!email.trim()) return setError('введите email')
    if (password.length < 6) return setError('пароль минимум 6 символов')

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })
      if (authError) throw new Error(authError.message)
      if (!data.user) throw new Error('Ошибка регистрации')

      if (data.session) {
        router.push('/')
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[var(--bg)]">
      <div className="fixed top-3 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <img src="/icon.svg" width={20} height={20} alt="" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              // pushup tracker
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--text)] leading-[1.15] tracking-tight">
            register()
          </h1>
          <p className="text-xs text-[var(--muted)] mt-2.5">создать аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-[var(--muted)]">
              name =
            </label>
            <input
              type="text"
              placeholder="Иван"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
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
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#ff6b35] transition-colors"
              style={{ border: '1px solid var(--border)' }}
            />
          </div>

          {error && <p className="text-[11px] text-[#ef4444]">! {error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-normal text-white bg-[#ff6b35] disabled:opacity-40 hover:opacity-85 transition-opacity mt-1"
          >
            {loading ? '// регистрируем...' : 'execute()'}
          </button>
        </form>

        <p className="text-xs text-[var(--muted)] mt-6">
          уже есть аккаунт?{' '}
          <Link href="/login" className="text-[#ff6b35] hover:underline">
            login()
          </Link>
        </p>
      </div>
    </main>
  )
}
