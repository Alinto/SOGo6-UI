'use client'

import { cn } from '@/lib/utils'
import { WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { isPwaEnabled, isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import {
  isMailFolderUnavailableTarget,
  type OfflineUnavailableTarget,
} from '../offline-modules'

interface OfflineUnavailableProps {
  className?: string
  /** Show even if the network probe still reports online (e.g. failed RSC). */
  force?: boolean
  target?: OfflineUnavailableTarget
  label?: string
}

function copyForTarget(
  t: (key: string, values?: { folder: string }) => string,
  target: OfflineUnavailableTarget,
  label?: string
): { title: string; body: string } {
  if (target === 'folder') {
    return {
      title: label?.trim()
        ? t('offline_unavailable_folder_title.string', { folder: label })
        : t('offline_unavailable_folder_unnamed_title.string'),
      body: t('offline_unavailable_folder_body.string'),
    }
  }
  if (target === 'calendar') {
    return {
      title: t('offline_unavailable_calendar_title.string'),
      body: t('offline_unavailable_calendar_body.string'),
    }
  }
  if (target === 'contacts') {
    return {
      title: t('offline_unavailable_contacts_title.string'),
      body: t('offline_unavailable_contacts_body.string'),
    }
  }
  if (target === 'tasks') {
    return {
      title: t('offline_unavailable_tasks_title.string'),
      body: t('offline_unavailable_tasks_body.string'),
    }
  }
  if (target === 'settings') {
    return {
      title: t('offline_unavailable_settings_title.string'),
      body: t('offline_unavailable_settings_body.string'),
    }
  }
  if (target === 'notes') {
    return {
      title: t('offline_unavailable_notes_title.string'),
      body: t('offline_unavailable_notes_body.string'),
    }
  }
  if (target === 'admin') {
    return {
      title: t('offline_unavailable_admin_title.string'),
      body: t('offline_unavailable_admin_body.string'),
    }
  }
  return {
    title: t('offline_unavailable_mail_title.string'),
    body: t('offline_unavailable_mail_body.string'),
  }
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

  const allowed = isMailFolderUnavailableTarget(target)
    ? isPwaMailCacheEnabled()
    : isPwaEnabled()
  if (!allowed || (!force && isOnline)) return null

  const { title, body } = copyForTarget(t, target, label)

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
