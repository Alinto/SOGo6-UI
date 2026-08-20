'use client'

import type { MailComposeAttachment } from '@/features/mails/store/mail-compose-slice'
import {
  createDraft,
  MAX_OPEN_DRAFTS,
} from '@/features/mails/store/mail-compose-slice'
import CachedDataIndicator from '@/features/offline/components/cached-data-indicator'
import OutboxList from '@/features/offline/components/outbox-list'
import type {
  OutboxAttachmentRecord,
  OutboxRecord,
} from '@/features/offline/types'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useCallback } from 'react'
import { toast } from 'sonner'

function OutboxPanel() {
  const t = useTranslations('PWA')
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector((s) => s.mailCompose.openDraftIds)

  const handleEdit = useCallback(
    (item: OutboxRecord, attachments: OutboxAttachmentRecord[]): boolean => {
      if (openDraftIds.length >= MAX_OPEN_DRAFTS) {
        toast.error(t('outbox_edit_limit.string'))
        return false
      }

      const restoredAttachments: MailComposeAttachment[] = attachments.map(
        (a) => ({
          draftId: `outbox-${item.id}`,
          name: a.name,
          size: a.size,
          type: a.type,
          file: new File([a.blob], a.name, { type: a.type }),
          uploadStatus: 'completed',
        })
      )

      dispatch(
        createDraft({
          draftId: `outbox-${item.id}`,
          initialData: {
            mailKey: item.mailKey,
            to: item.to,
            cc: item.cc,
            bcc: item.bcc,
            subject: item.subject,
            body: item.body,
            isPlainText: item.isPlainText,
            priority: item.priority as 0 | 1 | 2 | 3 | 4,
            requestReadReceipt: item.requestReadReceipt,
            selectedSignatureKey: item.signatureKey,
            attachments: restoredAttachments,
          },
        })
      )
      toast.success(t('outbox_edit_restored.string'))
      return true
    },
    [dispatch, openDraftIds, t]
  )

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{t('outbox_folder.string')}</h1>
        <CachedDataIndicator className="mt-1" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <OutboxList onEdit={handleEdit} />
      </div>
    </div>
  )
}

export default memo(OutboxPanel)
