'use client'

import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import IconButton from '@/components/IconButton'

interface ThemeToggleProps {
  iconOnly?: boolean
  compact?: boolean
}

export default function ThemeToggle({
  iconOnly = false,
  compact = false,
}: ThemeToggleProps) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))

    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  function toggle() {
    const next = !dark
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(next)

    if (next === prefersDark) {
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    document.documentElement.classList.toggle('dark', next)
  }

  if (!mounted) return null

  const icon = dark ? 'light_mode' : 'dark_mode'

  if (iconOnly) {
    return (
      <IconButton
        icon="dark_mode"
        alternateIcon="light_mode"
        alternateActive={dark}
        label={dark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
        variant="secondary"
        size={compact ? 'compact' : 'default'}
        onClick={toggle}
      />
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      className="flex items-center justify-center w-8 h-8 text-[var(--muted)] hover:text-[var(--accent-default)] transition-colors app-web:w-auto app-web:h-auto app-web:text-[11px] app-web:tracking-wider app-web:px-3 app-web:py-1.5 app-web:border app-web:border-[var(--border)] app-web:bg-[var(--surface)] app-web:hover:border-[var(--accent-default)]"
    >
      <span className="app-web:hidden"><Icon name={icon} size={18} /></span>
      <span className="hidden app-web:inline">{dark ? '[ light ]' : '[ dark ]'}</span>
    </button>
  )
}
