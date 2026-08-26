'use client'

import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="calendar">
      <div className="h-[calc(100vh-var(--header-height))] overflow-hidden py-2">
        {children}
      </div>
    </OfflineModuleGate>
  )
}
