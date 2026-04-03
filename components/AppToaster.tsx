'use client'

import type { CSSProperties } from 'react'
import { Toaster } from 'sonner'

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      visibleToasts={3}
      expand={false}
      closeButton={false}
      offset={{ top: 16, left: 16, right: 16 }}
      mobileOffset={{ top: 16, left: 16, right: 16 }}
      style={
        {
          '--width': 'min(calc(100vw - 32px), 400px)',
        } as CSSProperties
      }
      toastOptions={{
        duration: 5000,
        unstyled: true,
        classNames: {
          toast:
            'pointer-events-auto flex w-full items-start gap-2 border px-4 py-3 shadow-none [font-family:var(--font-family-primary)] rounded-none bg-[var(--bg-surface)] text-[var(--text-primary)]',
          content: 'min-w-0 flex-1',
          title: 'text-[14px] font-normal leading-[22px] tracking-[0] text-[inherit]',
          description: 'pt-[2px] text-[14px] font-normal leading-[22px] tracking-[0] text-[var(--text-secondary)]',
          error:
            'border-[var(--status-danger-default)] bg-[var(--status-danger-weak)] text-[var(--text-primary)]',
          closeButton: 'hidden',
        },
      }}
    />
  )
}
