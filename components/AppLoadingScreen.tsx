'use client'

import Loader from '@/components/Loader'

export default function AppLoadingScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-surface)] px-6">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Loader size={16} color="currentColor" />
        <span className="text-[14px] font-normal leading-[22px] tracking-[0]">
          загрузка
        </span>
      </div>
    </main>
  )
}
