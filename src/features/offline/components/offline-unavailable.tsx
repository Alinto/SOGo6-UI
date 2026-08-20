'use client'

import { cn } from '@/lib/utils'
import { WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'

interface OfflineUnavailableProps {
  className?: string
  /** Show even if the network probe still reports online (e.g. failed RSC). */
  force?: boolean
}

/** Shown in place of content that was never cached ("Indisponible hors ligne"). */
function OfflineUnavailable({
  className,
  force = false,
}: OfflineUnavailableProps) {
  const t = useTranslations('PWA')
  const { isOnline } = useNetworkStatus()

  if (!isPwaMailCacheEnabled() || (!force && isOnline)) return null

  return (
    <div
      role="status"
      className={cn(
        'text-muted-foreground flex flex-col items-center gap-2 p-8 text-center text-sm',
        className
      )}
    >
      <WifiOff className="size-6" aria-hidden />
      <p>{t('offline_unavailable.string')}</p>
    </div>
  )
}

export default memo(OfflineUnavailable)
