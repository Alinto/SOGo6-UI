import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export async function generateMetadata() {
  const { zoneMetadata } = await import('@/lib/i18n/zone-metadata')
  return zoneMetadata('calendar.string')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="calendar">
      <div className="h-full min-h-0 overflow-hidden p-2">{children}</div>
    </OfflineModuleGate>
  )
}
