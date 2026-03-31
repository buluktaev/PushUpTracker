'use client'

import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'

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
      className="flex items-center justify-center w-8 h-8 text-[var(--muted)] hover:text-[var(--accent-default)] transition-colors sm:w-auto sm:h-auto sm:text-[11px] sm:tracking-wider sm:px-3 sm:py-1.5 sm:border sm:border-[var(--border)] sm:bg-[var(--surface)] sm:hover:border-[var(--accent-default)]"
    >
      <span className="sm:hidden"><Icon name={dark ? 'light_mode' : 'dark_mode'} size={18} /></span>
      <span className="hidden sm:inline">{dark ? '[ light ]' : '[ dark ]'}</span>
    </button>
  )
}
