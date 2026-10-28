import OfflineModuleGate from '@/features/offline/components/offline-module-gate'

export async function generateMetadata() {
  const { zoneMetadata } = await import('@/lib/i18n/zone-metadata')
  return zoneMetadata('notes.string')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OfflineModuleGate target="notes">{children}</OfflineModuleGate>
}
