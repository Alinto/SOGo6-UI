'use client'

import OfflineCalendarAgenda from '@/features/offline/components/offline-calendar-agenda'
import OfflineUnavailable from '@/features/offline/components/offline-unavailable'
import {
  isPwaCalendarCacheEnabled,
  isPwaEnabled,
} from '@/features/offline/flags'
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

function offlineBody(target: OfflineModuleId) {
  if (target === 'calendar' && isPwaCalendarCacheEnabled()) {
    return <OfflineCalendarAgenda />
  }
  return <OfflineUnavailable force target={target} />
}

function OfflineModuleGate({ target, children }: OfflineModuleGateProps) {
  const { view } = useOfflineNav()
  const { isOnline, isProbing } = useNetworkStatus()

  if (
    isPwaEnabled() &&
    view.kind === 'unavailable' &&
    !isMailFolderUnavailableTarget(view.target)
  ) {
    return offlineBody(view.target as OfflineModuleId)
  }

  if (!isPwaEnabled() || isOnline || isProbing) {
    return children
  }
  return offlineBody(target)
}

export default memo(OfflineModuleGate)
