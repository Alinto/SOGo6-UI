'use client'

import { cn } from '@/lib/utils'
import { WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { isPwaEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'

function OfflineBanner() {
  const t = useTranslations('PWA')
  const { isOnline } = useNetworkStatus()

  if (!isPwaEnabled() || isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'bg-amber-600 text-white',
        'flex items-center justify-center gap-2 px-3 py-1.5 text-sm'
      )}
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      <span>{t('offline_banner.string')}</span>
    </div>
  )
}

export default memo(OfflineBanner)
