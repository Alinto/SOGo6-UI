'use client'

import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { memo } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { formatCacheClock } from '../utils/cache-clock'

interface CachedDataIndicatorProps {
  className?: string
  asOf?: number | null
  folder?: string
}

function CachedDataIndicator({
  className,
  asOf,
  folder,
}: CachedDataIndicatorProps) {
  const t = useTranslations('PWA')
  const locale = useLocale()
  const { isOnline } = useNetworkStatus()

  if (!isPwaMailCacheEnabled() || isOnline) return null

  const time = asOf ? formatCacheClock(asOf, locale) : null
  const label =
    time && folder?.trim()
      ? t('cached_data_as_of.string', { folder: folder.trim(), time })
      : time
        ? t('cached_data_as_of_no_folder.string', { time })
        : t('cached_data_indicator.string')

  return (
    <p className={cn('text-muted-foreground text-xs', className)} role="status">
      {label}
    </p>
  )
}

export default memo(CachedDataIndicator)
