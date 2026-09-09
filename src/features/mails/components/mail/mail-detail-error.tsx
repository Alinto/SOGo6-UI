'use client'

import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/components/store/auth.slice'
import { useRouter } from '@/lib/i18n/navigation'
import {
  getErrorCode,
  getErrorMessage,
  getErrorStatus,
} from '@/lib/redux/api/error-handlers'
import { useAppDispatch } from '@/lib/redux/hooks'
import { MailX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

const MAIL_NOT_FOUND_ERROR_CODE = 'S000303'

interface MailDetailErrorProps {
  error: unknown
  folderPath: string
  accountId: string
  refetch?: () => void
}

export function MailDetailError({
  error,
  folderPath,
  accountId,
  refetch,
}: MailDetailErrorProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.not_found')
  const tList = useTranslations('MAILS_LIST')
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const status = getErrorStatus(error)

  // Consistent with FolderMessagesErrorFallback's handling of the equivalent
  // folder-list error: a 401 here means the session is gone, not that this
  // particular mail failed to load.
  useEffect(() => {
    if (status !== 401) return
    dispatch(logout())
    push('/auth/login')
  }, [status, dispatch, push])

  if (status === 401) {
    return null
  }

  if (status === 503) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
        <MailX className="text-muted-foreground" size={40} strokeWidth={1.5} />
        <p className="text-muted-foreground max-w-md text-sm">
          {tList('list_load_error.mail_unavailable.string')}
        </p>
        <Button type="button" onClick={() => refetch?.()}>
          {tList('list_load_error.retry.string')}
        </Button>
      </div>
    )
  }

  const isNotFound = getErrorCode(error) === MAIL_NOT_FOUND_ERROR_CODE
  const message = getErrorMessage(error)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
      <MailX className="text-muted-foreground" size={40} strokeWidth={1.5} />
      <p className="text-foreground text-base font-medium">
        {isNotFound ? t('title.string') : t('generic_title.string')}
      </p>
      <p className="text-muted-foreground max-w-md text-sm">{message}</p>
      <Button
        type="button"
        onClick={() =>
          push(`/u/${accountId}/${encodeURIComponent(folderPath)}`)
        }
      >
        {t('action.string')}
      </Button>
    </div>
  )
}
