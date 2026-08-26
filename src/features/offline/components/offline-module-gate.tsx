'use client'

import OfflineUnavailable from '@/features/offline/components/offline-unavailable'
import { isPwaEnabled } from '@/features/offline/flags'
import { useNetworkStatus } from '@/features/offline/network/use-network-status'
import {
  isMailFolderUnavailableTarget,
  type OfflineModuleId,
} from '@/features/offline/offline-modules'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { memo, type ReactNode } from 'react'

interface OfflineModuleGateProps {
  target: OfflineModuleId
  children: ReactNode
}

function OfflineModuleGate({ target, children }: OfflineModuleGateProps) {
  const { view } = useOfflineNav()
  const { isOnline, isProbing } = useNetworkStatus()

  if (
    isPwaEnabled() &&
    view.kind === 'unavailable' &&
    !isMailFolderUnavailableTarget(view.target)
  ) {
    return <OfflineUnavailable force target={view.target} />
  }

  if (!isPwaEnabled() || isOnline || isProbing) {
    return children
  }
  return <OfflineUnavailable force target={target} />
}

export default memo(OfflineModuleGate)
