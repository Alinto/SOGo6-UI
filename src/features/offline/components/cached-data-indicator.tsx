'use client'

import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { estimateStorage, formatBytes } from '../storage/quota'
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
  const [quotaLabel, setQuotaLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!isPwaMailCacheEnabled()) return
    let cancelled = false
    void estimateStorage().then((estimate) => {
      if (cancelled || !estimate) return
      setQuotaLabel(
        t('storage_quota.string', {
          used: formatBytes(estimate.usage),
          quota: formatBytes(estimate.quota),
        })
      )
    })
    return () => {
      cancelled = true
    }
  }, [t])

  if (!isPwaMailCacheEnabled() || isOnline) return null

  const time = asOf ? formatCacheClock(asOf, locale) : null
  const label =
    time && folder?.trim()
      ? t('cached_data_as_of.string', { folder: folder.trim(), time })
      : time
        ? t('cached_data_as_of_no_folder.string', { time })
        : t('cached_data_indicator.string')

  return (
    <p
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs',
        className
      )}
      role="status"
    >
      <span>{label}</span>
      {quotaLabel ? <span>{quotaLabel}</span> : null}
    </p>
  )
}

export default memo(CachedDataIndicator)
