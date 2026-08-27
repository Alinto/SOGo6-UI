'use client'

import OfflineFallbackShell from '@/features/offline/components/offline-fallback-shell'
import { retryOfflineNavigation } from '@/features/offline/network/retry-offline-navigation'
import { pwaStartUrl } from '@/features/offline/pwa-start-url'
import { useLocale, useTranslations } from 'next-intl'

export default function OfflineFallbackPage() {
  const t = useTranslations('PWA')
  const locale = useLocale()

  return (
    <OfflineFallbackShell showThemeSwitcher>
      <h1 className="text-xl font-semibold">
        {t('offline_fallback_title.string')}
      </h1>
      <p className="text-muted-foreground max-w-md text-sm">
        {t('offline_fallback_body.string')}
      </p>
      <button
        type="button"
        onClick={() => retryOfflineNavigation(pwaStartUrl(locale))}
        className="text-primary cursor-pointer text-sm underline"
      >
        {t('offline_fallback_retry.string')}
      </button>
    </OfflineFallbackShell>
  )
}
