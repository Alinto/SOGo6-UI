'use client'

import { retryOfflineNavigation } from '@/features/offline/network/retry-offline-navigation'
import { useTranslations } from 'next-intl'

export default function OfflineFallbackPage() {
  const t = useTranslations('PWA')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">
        {t('offline_fallback_title.string')}
      </h1>
      <p className="text-muted-foreground max-w-md text-sm">
        {t('offline_fallback_body.string')}
      </p>
      <button
        type="button"
        onClick={retryOfflineNavigation}
        className="text-primary cursor-pointer text-sm underline"
      >
        {t('offline_fallback_retry.string')}
      </button>
    </main>
  )
}
