import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export async function generateMetadata() {
  const { zoneMetadata } = await import('@/lib/i18n/zone-metadata')
  return zoneMetadata('admin.string')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="admin">
      <div className="flex flex-col">{children}</div>
    </OfflineModuleGate>
  )
}
