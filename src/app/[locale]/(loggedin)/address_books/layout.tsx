'use client'

import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="contacts">
      <div className="flex h-full flex-col overflow-y-auto p-2">{children}</div>
    </OfflineModuleGate>
  )
}
