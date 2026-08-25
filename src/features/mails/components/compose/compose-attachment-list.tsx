'use client'

import { formatFileSize } from '@/features/mails/components/utils'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { Download, Paperclip, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  useDeleteAttachmentMutation,
  useLazyDownloadAttachmentQuery,
} from '../../store/mail-api'
import type { MailComposeAttachment } from '../../store/mail-compose-slice'
import { removeAttachment } from '../../store/mail-compose-slice'

interface ComposeAttachmentListProps {
  draftId: string
  accountId: string
  mailKey: string | null
  attachments: MailComposeAttachment[]
}

export function ComposeAttachmentList({
  draftId,
  accountId,
  mailKey,
  attachments,
}: ComposeAttachmentListProps) {
  const t = useTranslations('COMPOSE')
  const dispatch = useAppDispatch()
  const [deleteAttachment] = useDeleteAttachmentMutation()
  const [triggerDownloadAttachment] = useLazyDownloadAttachmentQuery()

  if (attachments.length === 0) return null

  const handleDeleteAttachment = async (attachment: MailComposeAttachment) => {
    // Local-only blobs never hit the server attachment API.
    if (
      attachment.file instanceof File ||
      attachment.uploadStatus !== 'completed' ||
      mailKey == null
    ) {
      dispatch(removeAttachment({ draftId, attachmentId: attachment.draftId }))
      return
    }
    const result = await deleteAttachment({
      accountId,
      mailKey,
      filename: attachment.name,
    })

    if (!('error' in result)) {
      dispatch(removeAttachment({ draftId, attachmentId: attachment.draftId }))
    }
  }

  const handleDownloadAttachment = async (
    attachment: MailComposeAttachment
  ) => {
    if (attachment.file instanceof File) {
      const url = URL.createObjectURL(attachment.file)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return
    }
    if (attachment.uploadStatus !== 'completed' || mailKey == null) return

    try {
      const blob = await triggerDownloadAttachment({
        accountId,
        mailKey,
        filename: attachment.name,
      }).unwrap()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download attachment:', error)
    }
  }

  return (
    <div className="flex flex-col gap-1 border-t px-4 py-2">
      {attachments.map((att) => {
        const progressLabel = `${att.uploadProgress ?? 0}%`
        return (
          <div
            key={att.draftId}
            className={cn(
              'bg-muted flex flex-col rounded px-2 py-1.5 text-xs',
              att.uploadStatus === 'error' && 'border-destructive border'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip
                  className={cn(
                    'h-3 w-3 shrink-0',
                    att.uploadStatus === 'uploading' && 'animate-pulse'
                  )}
                />
                <span className="truncate">{att.name}</span>
                <span className="text-muted-foreground shrink-0">
                  {formatFileSize(att.size)}
                </span>
                {att.uploadStatus === 'error' && (
                  <span className="text-destructive shrink-0">
                    {t('attachment_error.string')}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {(att.uploadStatus === 'completed' ||
                  att.file instanceof File) && (
                  <button
                    className="hover:text-primary ml-2 shrink-0 cursor-pointer"
                    onClick={() => void handleDownloadAttachment(att)}
                    title={t('attachment.download.string')}
                  >
                    <Download className="h-3 w-3" />
                  </button>
                )}
                <button
                  className="hover:text-destructive shrink-0 cursor-pointer"
                  onClick={() => void handleDeleteAttachment(att)}
                  disabled={att.uploadStatus === 'uploading'}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {att.uploadStatus === 'uploading' && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="bg-muted-foreground/20 h-1 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: progressLabel }}
                  />
                </div>
                <span className="text-muted-foreground w-7 shrink-0 text-right">
                  {progressLabel}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ComposeAttachmentList
