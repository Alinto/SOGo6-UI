'use client'

import { useOnlineStatus } from '@/lib/pwa/hooks/use-online-status'
import { cn } from '@/lib/utils'
import { WifiOff, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const t = useTranslations('PWA')
  const isOnline = useOnlineStatus()
  const [mounted] = useState(() => {
    if (typeof window !== 'undefined') {
      return true
    }
    return false
  })
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (isOnline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDismissed(false)
    }
  }, [isOnline])

  if (!mounted || isOnline || isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'flex animate-in slide-in-from-top duration-300 items-center justify-between gap-2 border-b bg-yellow-50 px-4 py-2 text-sm text-yellow-900',
        'dark:bg-yellow-900/20 dark:text-yellow-100'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 flex-1">
        <WifiOff className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>{t('offline.banner.string')}</span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="flex-shrink-0 rounded p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
        aria-label={t('offline.dismissBanner.string')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
