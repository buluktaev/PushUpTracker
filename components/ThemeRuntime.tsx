'use client'

import { useEffect } from 'react'

function applyResolvedTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const stored = localStorage.getItem('theme')

  if (stored && (stored === 'dark') === prefersDark) {
    localStorage.removeItem('theme')
  }

  const normalized = localStorage.getItem('theme')
  const isDark = normalized ? normalized === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
}

export default function ThemeRuntime() {
  useEffect(() => {
    applyResolvedTheme()

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onMediaChange = () => {
      if (!localStorage.getItem('theme')) {
        applyResolvedTheme()
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'theme') {
        applyResolvedTheme()
      }
    }

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onMediaChange)
    } else {
      media.addListener(onMediaChange)
    }

    window.addEventListener('storage', onStorage)

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', onMediaChange)
      } else {
        media.removeListener(onMediaChange)
      }
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return null
}
