'use client'

import { Button } from '@/components/ui/button'
import { useEnvVars } from '@/lib/env-service'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

interface EnvGateProps {
  children: React.ReactNode
}

export function EnvGate({ children }: EnvGateProps) {
  const t = useTranslations('COMMON')
  const { envVars, loading, error, refetch } = useEnvVars()
  const [isRetrying, setIsRetrying] = React.useState(false)

  if (loading && !envVars) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !envVars?.REACT_APP_API_BASE_URL) {
    const handleRetry = async () => {
      setIsRetrying(true)
      try {
        await refetch()
      } catch {
        // error state is updated by useEnvVars
      } finally {
        setIsRetrying(false)
      }
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">
          {t('serviceUnavailable.title.string')}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {t('serviceUnavailable.description.string')}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleRetry()}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t('serviceUnavailable.retry.string')}
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
