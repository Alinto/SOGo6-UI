'use client'

import { shouldSkipDocumentNav } from '@/features/offline/network/skip-document-nav'
import { useNetworkStatus } from '@/features/offline/network/use-network-status'
import { memo } from 'react'

interface FastAccessErrorProps {
  online: string
  offline: string
}

function FastAccessError({ online, offline }: FastAccessErrorProps) {
  const { isOnline, isProbing } = useNetworkStatus()
  const isOffline = shouldSkipDocumentNav(isOnline, isProbing)
  return (
    <p
      className={
        isOffline
          ? 'text-muted-foreground px-2 py-3 text-xs'
          : 'text-destructive px-2 py-3 text-xs'
      }
    >
      {isOffline ? offline : online}
    </p>
  )
}

export default memo(FastAccessError)
