'use client'

import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useMailReceivedListener } from '@/lib/redux/sse/hooks/use-mail-received-listener'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export default function MailSSEListener() {
  const { folderPath } = useCurrentFolder()
  const t = useTranslations('MAILS_COMMONS')

  const fallbacks = useMemo(
    () => ({
      defaultSubject: t('sse.defaultSubject.string'),
      defaultSenderName: t('sse.defaultSender.string'),
    }),
    [t]
  )

  useMailReceivedListener(folderPath, undefined, fallbacks)

  return null
}
