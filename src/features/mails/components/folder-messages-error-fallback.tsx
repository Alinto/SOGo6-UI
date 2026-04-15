'use client'

import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/components/store/auth.slice'
import { useRouter } from '@/lib/i18n/navigation'
import { getErrorStatus } from '@/lib/redux/api/error-handlers'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

interface FolderMessagesErrorFallbackProps {
  error: unknown
  refetch: () => void
  accountId: string
  className?: string
}

export function FolderMessagesErrorFallback({
  error,
  refetch,
  accountId,
  className,
}: FolderMessagesErrorFallbackProps) {
  const t = useTranslations('MAILS_LIST')
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const status = getErrorStatus(error)

  useEffect(() => {
    if (status !== 401) return
    dispatch(logout())
    push('/auth/login')
  }, [status, dispatch, push])

  if (status === 401) {
    return null
  }

  if (status === 404) {
    return (
      <div className={cn('p-4', className)}>
        <p className="text-muted-foreground mb-3">
          {t('list_load_error.folder_not_found.string')}
        </p>
        <Button type="button" onClick={() => push(`/u/${accountId}/INBOX`)}>
          {t('list_load_error.open_inbox.string')}
        </Button>
      </div>
    )
  }

  if (status === 503) {
    return (
      <div className={cn('p-4', className)}>
        <p className="text-muted-foreground mb-3">
          {t('list_load_error.mail_unavailable.string')}
        </p>
        <Button type="button" onClick={() => refetch()}>
          {t('list_load_error.retry.string')}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('p-4', className)}>
      <p className="text-muted-foreground">
        {t('list_load_error.generic.string')}
      </p>
    </div>
  )
}
