'use client'

import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import { deleteLocalDraft } from '@/features/offline/db/drafts-store'
import { deleteOutboxItem } from '@/features/offline/db/outbox-store'
import { isPwaOutboxEnabled } from '@/features/offline/flags'
import { probeNetwork } from '@/features/offline/network/probe'
import { enqueueOutbox } from '@/features/offline/outbox/outbox-coordinator'
import { releaseOutboxForEdit } from '@/features/offline/outbox/outbox-edit-hold'
import { notifyOutboxChanged } from '@/features/offline/outbox/outbox-events'
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MAX_COUNT,
} from '@/features/offline/types'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import React from 'react'
import { toast } from 'sonner'
import { closeDraft } from '../store'
import {
  useSendMailMutation,
  useUploadAttachmentMutation,
} from '../store/mail-api'
import type { MailComposeAttachment } from '../store/mail-compose-slice'
import {
  buildComposeMailPayload,
  type ComposeMailFields,
} from '../utils/build-compose-mail-payload'

export type EmptyContentAlert = 'subject' | 'body' | 'both'

interface UseComposeSendOptions extends ComposeMailFields {
  draftId: string
  accountId: string
  mailKey: string | null
  attachments?: MailComposeAttachment[]
  selectedSignatureKey?: string | null
  sourceOutboxId?: string | null
}

export function useComposeSend({
  draftId,
  accountId,
  mailKey,
  toRecipients,
  subject,
  body,
  attachments = [],
  selectedSignatureKey = null,
  sourceOutboxId = null,
  ...mailFields
}: UseComposeSendOptions) {
  const dispatch = useAppDispatch()
  const t = useTranslations('PWA')
  const [sendMail, { isLoading: isSending }] = useSendMailMutation()
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadAttachmentMutation()

  const [showNoRecipientAlert, setShowNoRecipientAlert] = React.useState(false)
  const [emptyContentAlert, setEmptyContentAlert] =
    React.useState<EmptyContentAlert | null>(null)

  const performSend = async () => {
    if (!mailFields.selectedIdentity?.mail) return

    const online = !isPwaOutboxEnabled() || (await probeNetwork())

    if (!online && isPwaOutboxEnabled()) {
      const userId = getAuthUserId()
      if (!userId) {
        toast.error(t('offline_send_error.string'))
        return
      }

      const fileAttachments = attachments.filter((a) => a.file instanceof File)
      if (fileAttachments.length > ATTACHMENT_MAX_COUNT) {
        toast.error(t('attachment_too_many.string'))
        return
      }
      const totalSize = fileAttachments.reduce((sum, a) => sum + a.size, 0)
      if (totalSize > ATTACHMENT_MAX_BYTES) {
        toast.error(t('attachment_quota.string'))
        return
      }

      await enqueueOutbox({
        userId,
        accountId,
        mailKey,
        identityMail: mailFields.selectedIdentity.mail,
        replyTo: mailFields.selectedIdentity.replyTo || null,
        signatureKey: selectedSignatureKey,
        to: toRecipients,
        cc: mailFields.ccRecipients,
        bcc: mailFields.bccRecipients,
        subject,
        body,
        isPlainText: mailFields.isPlainText,
        priority: mailFields.selectedPriority,
        requestReadReceipt: mailFields.requestReadReceipt,
        attachments: fileAttachments.map((a) => ({
          id: crypto.randomUUID(),
          name: a.name,
          size: a.size,
          type: a.type,
          blob: a.file as Blob,
        })),
        localDraftId: draftId,
        replaceOutboxId: sourceOutboxId ?? undefined,
      })

      if (sourceOutboxId) releaseOutboxForEdit(sourceOutboxId)
      toast.success(t('outbox_queued.string'))
      dispatch(closeDraft({ draftId }))
      return
    }

    // Real SOGo send rejects JSON `attachments`. Local Files must be uploaded
    // as multipart first (same as the online picker) so we get a tmp draft key.
    const localFiles = attachments.filter(
      (a): a is MailComposeAttachment & { file: File } => a.file instanceof File
    )
    let key = mailKey
    for (const attachment of localFiles) {
      const uploaded = await uploadAttachment({
        accountId,
        mailKey: key,
        file: attachment.file,
      })
      if ('error' in uploaded) return
      const nextKey = uploaded.data?.data?.key
      if (nextKey) key = nextKey
    }

    const result = await sendMail({
      accountId,
      mailKey: key,
      mail: buildComposeMailPayload({
        toRecipients,
        subject,
        body,
        ...mailFields,
      }),
    })

    if (!('error' in result)) {
      if (isPwaOutboxEnabled()) {
        const userId = getAuthUserId()
        // The message reached the server — drop the local mirror so it is
        // not rehydrated as a ghost draft on next boot.
        if (userId) void deleteLocalDraft(userId, draftId)
        if (userId && sourceOutboxId) {
          await deleteOutboxItem(userId, sourceOutboxId)
          releaseOutboxForEdit(sourceOutboxId)
          notifyOutboxChanged()
        }
      }
      dispatch(closeDraft({ draftId }))
    }
  }

  const handleSend = async () => {
    if (!mailFields.selectedIdentity?.mail) return

    if (toRecipients.length === 0) {
      setShowNoRecipientAlert(true)
      return
    }

    const isSubjectEmpty = subject.trim().length === 0
    const isBodyEmpty = body.trim().length === 0

    if (isSubjectEmpty && isBodyEmpty) {
      setEmptyContentAlert('both')
      return
    }
    if (isSubjectEmpty) {
      setEmptyContentAlert('subject')
      return
    }
    if (isBodyEmpty) {
      setEmptyContentAlert('body')
      return
    }

    await performSend()
  }

  const handleConfirmSendAnyway = async () => {
    setEmptyContentAlert(null)
    await performSend()
  }

  return {
    isSending: isSending || isUploading,
    handleSend,
    handleConfirmSendAnyway,
    showNoRecipientAlert,
    setShowNoRecipientAlert,
    emptyContentAlert,
    setEmptyContentAlert,
  }
}
