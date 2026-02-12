'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'

/**
 * Offline fallback page
 * Displayed when user tries to access a page that is not cached
 * Provides options to retry or go back home
 */
export default function OfflinePage() {
  const t = useTranslations('PWA')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <WifiOff className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">
            {t('offline.pageTitle.string')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t('offline.pageDescription.string')}
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              {t('offline.retryButton.string')}
            </Button>

            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                {t('offline.goHomeButton.string')}
              </Link>
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('offline.cachedPagesHint.string')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
