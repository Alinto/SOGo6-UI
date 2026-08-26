'use client'

import OfflineModuleGate from '@/features/offline/components/offline-module-gate'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OfflineModuleGate target="tasks">{children}</OfflineModuleGate>
}
