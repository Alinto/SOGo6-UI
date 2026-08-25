'use client'

import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailContent from '@/features/mails/components/mail/mail-content'
import MailHeaderMobile from '@/features/mails/components/mail/mail-header-mobile'
import { MailReturnButton } from '@/features/mails/components/mail/mail-return-button'
import MailSubject from '@/features/mails/components/mail/mail-subject'
import { ActionId } from '@/features/mails/components/mail/types'
import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import { getOutboxAttachments } from '@/features/offline/db/outbox-store'
import type {
  OutboxAttachmentRecord,
  OutboxRecord,
} from '@/features/offline/types'
import { FilePen, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useState } from 'react'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface OutboxMailViewProps {
  item: OutboxRecord
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function OutboxMailView({
  item,
  onBack,
  onEdit,
  onDelete,
}: OutboxMailViewProps) {
  const t = useTranslations('PWA')
  const [attachments, setAttachments] = useState<OutboxAttachmentRecord[]>([])

  useEffect(() => {
    let cancelled = false
    const userId = getAuthUserId()
    if (!userId) return
    void getOutboxAttachments(userId, item.id).then((rows) => {
      if (!cancelled) setAttachments(rows)
    })
    return () => {
      cancelled = true
    }
  }, [item.id])

  const blobUrls = useMemo(
    () =>
      attachments.map((attachment) => ({
        name: attachment.name,
        url: URL.createObjectURL(attachment.blob),
      })),
    [attachments]
  )

  useEffect(() => {
    return () => {
      blobUrls.forEach((row) => URL.revokeObjectURL(row.url))
    }
  }, [blobUrls])

  const bodyHtml = item.isPlainText
    ? `<pre style="white-space:pre-wrap;font:inherit">${escapeHtml(item.body)}</pre>`
    : item.body

  const from = { name: '', email: item.identityMail }
  const to = item.to.map((recipient) => ({
    name: recipient.name ?? '',
    email: recipient.email,
  }))
  const cc = item.cc.map((recipient) => ({
    name: recipient.name ?? '',
    email: recipient.email,
  }))
  const sending = item.status === 'sending'

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto p-2">
      <div className="mb-4 flex items-center gap-2">
        <MailReturnButton folderPath="outbox" onBack={onBack} />
        <div className="ml-auto">
          <MailActionsBar
            actions={[
              {
                id: ActionId.EDIT_DRAFT,
                icon: <FilePen size={16} />,
                title: t('outbox_edit.string'),
                disabled: sending,
              },
              {
                id: ActionId.DELETE,
                icon: <Trash2 size={16} />,
                title: t('outbox_delete.string'),
                disabled: sending,
              },
            ]}
            onAction={(_idx, action) => {
              if (action.id === ActionId.EDIT_DRAFT) onEdit()
              if (action.id === ActionId.DELETE) onDelete()
            }}
          />
        </div>
      </div>
      <MailSubject
        subject={item.subject || t('outbox_no_subject.string')}
        className="h-auto min-h-fit"
      />
      <p className="text-muted-foreground px-2 pb-2 text-sm sm:px-6">
        {item.status === 'failed'
          ? t('outbox_status_failed.string')
          : item.status === 'sending'
            ? t('outbox_status_sending.string')
            : t('outbox_status_pending.string')}
        {item.lastError ? ` — ${item.lastError}` : ''}
      </p>
      <div className="w-full overflow-hidden rounded-lg border p-4 shadow">
        <MailHeaderMobile from={from} to={to} cc={cc} date={item.createdAt} />
        {blobUrls.length > 0 ? (
          <div className="mb-2 flex flex-row flex-wrap items-center gap-2">
            {blobUrls.map((attachment) => (
              <a
                key={attachment.url}
                href={attachment.url}
                download={attachment.name}
                className="bg-muted/50 max-w-md truncate rounded px-2 py-1 text-xs underline"
              >
                {attachment.name}
              </a>
            ))}
          </div>
        ) : null}
        <MailContent
          body={bodyHtml}
          attachments={{ count: 0 }}
          attachmentsUrl=""
        />
      </div>
    </div>
  )
}

export default memo(OutboxMailView)
