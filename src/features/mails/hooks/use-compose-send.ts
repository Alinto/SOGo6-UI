'use client'

import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import { deleteLocalDraft } from '@/features/offline/db/drafts-store'
import {
  deleteOutboxItem,
  getOutboxItem,
} from '@/features/offline/db/outbox-store'
import { isPwaOutboxEnabled } from '@/features/offline/flags'
import { probeNetwork } from '@/features/offline/network/probe'
import {
  enqueueOutbox,
  isOutboxItemGoneError,
} from '@/features/offline/outbox/outbox-coordinator'
import { releaseOutboxForEdit } from '@/features/offline/outbox/outbox-edit-hold'
import { notifyOutboxChanged } from '@/features/offline/outbox/outbox-events'
import { isQuotaExceededError } from '@/features/offline/storage/quota'
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
import { waitForPendingDraftSave } from '../utils/draft-save-tracker'

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

  // Synchronous guard: isSending only flips once the mutation starts, after
  // the network probe and the uploads, so a second click/Ctrl+Enter in that
  // window would send the message twice.
  const sendLockRef = React.useRef(false)
  const [isPreparingSend, setIsPreparingSend] = React.useState(false)

  /**
   * `detachFromOutbox`: the edited Outbox item vanished (sent or deleted,
   * maybe from another tab) and the user confirmed sending this copy as a
   * new message.
   */
  const performSend = async (options?: { detachFromOutbox?: boolean }) => {
    if (!mailFields.selectedIdentity?.mail) return
    if (sendLockRef.current) return
    sendLockRef.current = true
    setIsPreparingSend(true)
    try {
      await sendNow(
        mailFields.selectedIdentity,
        options?.detachFromOutbox ? null : sourceOutboxId
      )
    } finally {
      sendLockRef.current = false
      setIsPreparingSend(false)
    }
  }

  // The "send anyway" toast action must use the latest field values.
  const performSendRef = React.useRef(performSend)
  React.useEffect(() => {
    performSendRef.current = performSend
  })

  /**
   * Never re-create a vanished Outbox item silently: it was most likely
   * already sent, so a resend would duplicate it. Ask via a toast action.
   */
  const warnOutboxItemGone = () => {
    toast.warning(t('outbox_item_gone.string'), {
      action: {
        label: t('outbox_send_anyway.string'),
        onClick: () => {
          if (sourceOutboxId) releaseOutboxForEdit(sourceOutboxId)
          void performSendRef.current({ detachFromOutbox: true })
        },
      },
    })
  }

  const sendNow = async (
    identity: { mail: string; replyTo?: string },
    outboxId: string | null
  ) => {
    const identityMail = identity.mail
    // An autosave started before the click may still be creating the draft:
    // wait for it and reuse its key, or the send would leave it orphaned.
    const savedKey = await waitForPendingDraftSave(draftId)
    const draftKey = savedKey ?? mailKey

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

      try {
        await enqueueOutbox({
          userId,
          accountId,
          mailKey: draftKey,
          identityMail,
          replyTo: identity.replyTo || null,
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
            // PWA keeps the File of uploaded attachments: flag them so the
            // flush does not upload them to the server draft a second time.
            uploaded: a.uploadStatus === 'completed' && draftKey != null,
          })),
          localDraftId: draftId,
          replaceOutboxId: outboxId ?? undefined,
        })
      } catch (error) {
        if (isOutboxItemGoneError(error)) {
          warnOutboxItemGone()
          return
        }
        toast.error(
          isQuotaExceededError(error)
            ? t('storage_quota_exceeded.string')
            : t('offline_send_error.string')
        )
        return
      }

      if (outboxId) releaseOutboxForEdit(outboxId, userId)
      toast.success(t('outbox_queued.string'))
      dispatch(closeDraft({ draftId }))
      return
    }

    if (outboxId && isPwaOutboxEnabled()) {
      const userId = getAuthUserId()
      const stillQueued = userId
        ? await getOutboxItem(userId, outboxId).catch(() => undefined)
        : undefined
      if (!stillQueued) {
        warnOutboxItemGone()
        return
      }
    }

    // Real SOGo send rejects JSON `attachments`. Local Files must be uploaded
    // as multipart first (same as the online picker) so we get a tmp draft key.
    // Attachments already uploaded keep their File in PWA mode (for the
    // outbox): sending them again would attach them twice. Outbox items
    // restored for editing mark only server-side files as 'completed'.
    const localFiles = attachments.filter(
      (a): a is MailComposeAttachment & { file: File } =>
        a.file instanceof File && a.uploadStatus !== 'completed'
    )
    let key = draftKey
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
        if (userId && outboxId) {
          try {
            await deleteOutboxItem(userId, outboxId)
          } catch {
            // Sent anyway: never keep the window open for a resend.
          }
          releaseOutboxForEdit(outboxId, userId)
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
    isSending: isPreparingSend || isSending || isUploading,
    handleSend,
    handleConfirmSendAnyway,
    showNoRecipientAlert,
    setShowNoRecipientAlert,
    emptyContentAlert,
    setEmptyContentAlert,
  }
}
