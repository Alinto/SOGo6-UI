'use client'

import { isPwaEnabled } from '@/features/offline/flags'
import { disableInstalledPwa } from '@/features/offline/pwa-kill-switch'
import dynamic from 'next/dynamic'
import { useEffect, type ReactNode } from 'react'

const SerwistProvider = dynamic(
  () => import('@serwist/turbopack/react').then((m) => m.SerwistProvider),
  { ssr: false }
)

interface SerwistProviderGateProps {
  children: ReactNode
}

export default function SerwistProviderGate({
  children,
}: SerwistProviderGateProps) {
  const pwaEnabled = isPwaEnabled()

  useEffect(() => {
    // Flag turned off after rollout: remove the worker installed earlier.
    if (!pwaEnabled) void disableInstalledPwa()
  }, [pwaEnabled])

  if (!pwaEnabled) {
    return <>{children}</>
  }

  // reloadOnOnline: a full reload on every `online` event would interrupt the
  // outbox flush and drop in-memory state. cacheOnNavigation: posts
  // CACHE_URLS on every pushState, i.e. an extra server render per route
  // change whose result no runtime route keeps.
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={false}
      reloadOnOnline={false}
      cacheOnNavigation={false}
    >
      {children}
    </SerwistProvider>
  )
}
