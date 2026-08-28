import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="admin">
      <div className="flex flex-col">{children}</div>
    </OfflineModuleGate>
  )
}
