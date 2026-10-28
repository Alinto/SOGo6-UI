import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export async function generateMetadata() {
  const { zoneMetadata } = await import('@/lib/i18n/zone-metadata')
  return zoneMetadata('settings.string')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="settings">
      <div className="h-[calc(100vh-var(--header-height))] overflow-y-auto p-2 pb-24">
        {children}
      </div>
    </OfflineModuleGate>
  )
}
