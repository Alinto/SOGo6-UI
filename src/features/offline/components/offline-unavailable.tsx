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
  target?: 'mail' | 'folder'
  label?: string
}

/** Empty state shown instead of content that was never cached. */
function OfflineUnavailable({
  className,
  force = false,
  target = 'mail',
  label,
}: OfflineUnavailableProps) {
  const t = useTranslations('PWA')
  const { isOnline } = useNetworkStatus()

  if (!isPwaMailCacheEnabled() || (!force && isOnline)) return null

  let title = t('offline_unavailable_mail_title.string')
  if (target === 'folder') {
    title = label?.trim()
      ? t('offline_unavailable_folder_title.string', { folder: label })
      : t('offline_unavailable_folder_unnamed_title.string')
  }
  const body =
    target === 'folder'
      ? t('offline_unavailable_folder_body.string')
      : t('offline_unavailable_mail_body.string')

  return (
    <div
      role="status"
      data-testid="offline-unavailable"
      data-target={target}
      className={cn(
        'text-muted-foreground flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 p-8 text-center',
        className
      )}
    >
      <WifiOff className="size-8 shrink-0" aria-hidden />
      <p className="text-foreground text-base font-medium">{title}</p>
      <p className="max-w-md text-sm">{body}</p>
    </div>
  )
}

export default memo(OfflineUnavailable)
