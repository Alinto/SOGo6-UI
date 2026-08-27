'use client'

import { ThemeSwitcher } from '@/components/theme-switcher'
import Image from 'next/image'
import { memo, type ReactNode } from 'react'

interface OfflineFallbackShellProps {
  children: ReactNode
  showThemeSwitcher?: boolean
}

function OfflineFallbackShell({
  children,
  showThemeSwitcher = false,
}: OfflineFallbackShellProps) {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <Image
          alt="SOGo"
          src="/images/sogo-compact.svg"
          width={32}
          height={32}
          priority
        />
        {showThemeSwitcher ? <ThemeSwitcher /> : null}
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        {children}
      </main>
    </div>
  )
}

export default memo(OfflineFallbackShell)
