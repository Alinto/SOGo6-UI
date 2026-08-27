'use client'

import { WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

function LoginOfflineBanner() {
  const t = useTranslations('PWA')
  return (
    <div
      role="status"
      data-testid="login-offline-banner"
      className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
    >
      <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{t('login_offline_banner.string')}</p>
    </div>
  )
}

export default memo(LoginOfflineBanner)
