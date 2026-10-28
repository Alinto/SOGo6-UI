import OfflineModuleGate from '@/features/offline/components/offline-module-gate'
import React from 'react'

export async function generateMetadata() {
  const { zoneMetadata } = await import('@/lib/i18n/zone-metadata')
  return zoneMetadata('address_book.string')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineModuleGate target="contacts">
      <div className="flex h-full min-h-0 flex-col overflow-hidden p-2">
        {children}
      </div>
    </OfflineModuleGate>
  )
}
