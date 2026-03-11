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
      className="flex items-center justify-center w-8 h-8 text-[var(--muted)] hover:text-[#ff6b35] transition-colors"
    >
      <Icon name={dark ? 'light_mode' : 'dark_mode'} size={18} />
    </button>
  )
}
