'use client'

import { useEffect } from 'react'

function applySystemTheme() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', isDark)
}

export default function AuthThemeSync() {
  useEffect(() => {
    applySystemTheme()

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onMediaChange = () => {
      applySystemTheme()
    }

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onMediaChange)
    } else {
      media.addListener(onMediaChange)
    }

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', onMediaChange)
      } else {
        media.removeListener(onMediaChange)
      }
    }
  }, [])

  return null
}
