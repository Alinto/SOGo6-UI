'use client'

import OfflineFallbackShell from '@/features/offline/components/offline-fallback-shell'
import { retryOfflineNavigation } from '@/features/offline/network/retry-offline-navigation'
import { pwaStartUrl } from '@/features/offline/pwa-start-url'

/**
 * Service-worker document fallback (no locale provider).
 * User-facing copy is English-only by design for this technical route.
 */
/* eslint-disable react/jsx-no-literals -- no next-intl on the unprefixed SW fallback */
export default function OfflineFallbackRootPage() {
  return (
    <OfflineFallbackShell>
      <h1 className="text-xl font-semibold">You are offline</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Reconnect or reopen SOGo after you have visited it online at least once.
      </p>
      <button
        type="button"
        onClick={() => retryOfflineNavigation(pwaStartUrl())}
        className="text-primary cursor-pointer text-sm underline"
      >
        Try again
      </button>
    </OfflineFallbackShell>
  )
}
