'use client'

import { addNotification } from '@/features/notifications'
import type { ImapMessages } from '@/features/mails/mails-types'
import { buildPrintDocument } from '@/features/mails/utils/build-print-document'
import { formatEmailContact } from '@/features/mails/utils/format-mail-contact'
import { formatMailPrintDate } from '@/features/mails/utils/format-mail-print-date'
import { getMailAttachmentNames } from '@/features/mails/utils/get-mail-attachment-names'
import { openPrintWindow } from '@/features/mails/utils/open-print-window'
import { prepareMailBodyHtml } from '@/features/mails/utils/prepare-mail-body-html'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

export type UsePrintMailOptions = {
  includeExternalImages?: boolean
}

export function usePrintMail(
  mail: ImapMessages | undefined,
  options?: UsePrintMailOptions
) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const dispatch = useAppDispatch()

  const isPrintDisabled = !mail?.body

  const handlePrint = useCallback(() => {
    if (!mail?.body) return

    const includeExternalImages =
      options?.includeExternalImages ?? mail.imageBlocked === false

    const preparedBody = prepareMailBodyHtml(mail.body, {
      includeExternalImages,
    })

    const html = buildPrintDocument({
      subject: mail.subject,
      from: formatEmailContact(mail.from),
      to: mail.to.map(formatEmailContact),
      cc: mail.cc?.length ? mail.cc.map(formatEmailContact) : undefined,
      date: formatMailPrintDate(mail.date),
      body: preparedBody,
      attachmentNames: getMailAttachmentNames(mail.attachments),
      labels: {
        from: t('print_labels.from.string'),
        to: t('print_labels.to.string'),
        cc: t('print_labels.cc.string'),
        date: t('print_labels.date.string'),
        attachments: t('print_labels.attachments.string'),
      },
    })

    const opened = openPrintWindow(html)
    if (!opened) {
      dispatch(
        addNotification({
          type: 'info',
          title: 'mail_print.popup_blocked.title.string',
          message: 'mail_print.popup_blocked.message.string',
        })
      )
    }
  }, [mail, options?.includeExternalImages, t, dispatch])

  return { handlePrint, isPrintDisabled }
}
