'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  useEnableCalendarSubscriptionMutation,
  useRevokeCalendarSubscriptionMutation,
} from '@/features/calendars/store/calendars-api'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'

interface LinkActionProps {
  calendarKey: string
  publicUrl?: string | null
}

const LinkAction: React.FC<LinkActionProps> = ({ calendarKey, publicUrl }) => {
  const t = useTranslations('CALENDARS')
  const [enableSubscription, { isLoading: isEnabling }] =
    useEnableCalendarSubscriptionMutation()
  const [revokeSubscription, { isLoading: isRevoking }] =
    useRevokeCalendarSubscriptionMutation()
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const url = localUrl ?? publicUrl ?? ''

  const busy = isEnabling || isRevoking

  const handleEnable = async () => {
    setError(false)
    try {
      const result = await enableSubscription({ calendarKey }).unwrap()
      setLocalUrl(result.public_url ?? '')
    } catch {
      setError(true)
    }
  }

  const handleRevoke = async () => {
    setError(false)
    try {
      await revokeSubscription({ calendarKey }).unwrap()
      setLocalUrl('')
    } catch {
      setError(true)
    }
  }

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      setError(true)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.link.string')}</DialogTitle>
        <DialogDescription>
          {url
            ? t('sidebar.link.active.string')
            : t('sidebar.link.description.string')}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {url ? (
          <Input
            value={url}
            readOnly
            aria-label={t('sidebar.link.url.string')}
          />
        ) : null}
        {error && (
          <p className="text-destructive text-sm">
            {t('sidebar.link.error.string')}
          </p>
        )}
      </div>
      <DialogFooter>
        {url ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCopy()}
              disabled={busy}
            >
              {t('sidebar.link.copy.string')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleRevoke()}
              disabled={busy}
            >
              {busy && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {t('sidebar.link.revoke.string')}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => void handleEnable()}
            disabled={busy}
          >
            {busy && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            )}
            {t('sidebar.link.enable.string')}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

export default memo(LinkAction)
