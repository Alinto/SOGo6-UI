'use client'

import { memo } from 'react'
import { useNetworkStatus } from '../network/use-network-status'
import InstallPwaPrompt from './install-pwa-prompt'
import OfflineBanner from './offline-banner'

/** One status slot: offline takes priority over the install prompt. */
function PwaStatusBar() {
  const { isOnline } = useNetworkStatus()
  return isOnline ? <InstallPwaPrompt /> : <OfflineBanner />
}

export default memo(PwaStatusBar)
