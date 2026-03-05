'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      className="text-[10px] tracking-widest px-3 py-2 border transition-colors hover:border-[#ff6b35] hover:text-[#ff6b35]"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--muted)',
      }}
    >
      {dark ? '[ light ]' : '[ dark ]'}
    </button>
  )
}
