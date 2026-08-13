'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'

interface CachedDataIndicatorProps {
  className?: string
}

function CachedDataIndicator({ className }: CachedDataIndicatorProps) {
  const t = useTranslations('PWA')
  const { isOnline } = useNetworkStatus()

  if (!isPwaMailCacheEnabled() || isOnline) return null

  return (
    <p className={cn('text-muted-foreground text-xs', className)} role="status">
      {t('cached_data_indicator.string')}
    </p>
  )
}

export default memo(CachedDataIndicator)
