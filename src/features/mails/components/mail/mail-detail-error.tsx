'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/lib/i18n/navigation'
import { getErrorCode, getErrorMessage } from '@/lib/redux/api/error-handlers'
import { MailX } from 'lucide-react'
import { useTranslations } from 'next-intl'

const MAIL_NOT_FOUND_ERROR_CODE = 'S000303'

interface MailDetailErrorProps {
  error: unknown
  folderPath: string
  accountId: string
}

export function MailDetailError({
  error,
  folderPath,
  accountId,
}: MailDetailErrorProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.not_found')
  const { push } = useRouter()
  const isNotFound = getErrorCode(error) === MAIL_NOT_FOUND_ERROR_CODE
  const message = getErrorMessage(error)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
      <MailX className="text-muted-foreground" size={40} strokeWidth={1.5} />
      <p className="text-base font-medium text-foreground">
        {isNotFound ? t('title.string') : t('generic_title.string')}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Button
        type="button"
        onClick={() => push(`/u/${accountId}/${encodeURIComponent(folderPath)}`)}
      >
        {t('action.string')}
      </Button>
    </div>
  )
}
