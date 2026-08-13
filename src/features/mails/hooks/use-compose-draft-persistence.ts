'use client'

import { persistLocalDraft } from '@/features/offline'
import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import { deleteLocalDraft } from '@/features/offline/db/drafts-store'
import { isPwaOutboxEnabled } from '@/features/offline/flags'
import { probeNetwork } from '@/features/offline/network/probe'
import { useInterval } from '@/hooks/use-interval'
import { useAppDispatch } from '@/lib/redux/hooks'
import { closeDraft } from '../store'
import { useDeleteMailMutation, useSaveDraftMutation } from '../store/mail-api'
import { markDraftSaved, updateMailKey } from '../store/mail-compose-slice'
import {
  buildComposeMailPayload,
  type ComposeMailFields,
} from '../utils/build-compose-mail-payload'

interface UseComposeDraftPersistenceOptions extends ComposeMailFields {
  draftId: string
  accountId: string
  mailKey: string | null
  isActive: boolean
  isMinimized: boolean
  isDirty: boolean
  hasDraft: boolean
  isSending: boolean
  isUploading: boolean
  autosaveIntervalMs: number
  selectedSignatureKey?: string | null
}

export function useComposeDraftPersistence({
  draftId,
  accountId,
  mailKey,
  isActive,
  isMinimized,
  isDirty,
  hasDraft,
  isSending,
  isUploading,
  autosaveIntervalMs,
  selectedSignatureKey = null,
  ...mailFields
}: UseComposeDraftPersistenceOptions) {
  const dispatch = useAppDispatch()
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation()
  const [deleteMail] = useDeleteMailMutation()

  const persistLocal = async () => {
    if (!isPwaOutboxEnabled()) return
    const userId = getAuthUserId()
    if (!userId) return
    await persistLocalDraft({
      id: draftId,
      userId,
      accountId,
      mailKey,
      identityMail: mailFields.selectedIdentity?.mail ?? null,
      signatureKey: selectedSignatureKey,
      to: mailFields.toRecipients,
      cc: mailFields.ccRecipients,
      bcc: mailFields.bccRecipients,
      subject: mailFields.subject,
      body: mailFields.body,
      isPlainText: mailFields.isPlainText,
      priority: mailFields.selectedPriority,
      requestReadReceipt: mailFields.requestReadReceipt,
      attachments: [],
    })
  }

  const handleSaveDraft = async (
    displayNotificationOnSuccess: boolean,
    displayNotificationOnError: boolean,
    closeOnSave: boolean
  ): Promise<void> => {
    await persistLocal()

    const online = !isPwaOutboxEnabled() || (await probeNetwork())
    if (!online) {
      dispatch(markDraftSaved({ draftId }))
      if (closeOnSave) {
        dispatch(closeDraft({ draftId }))
      }
      return
    }

    const result = await saveDraft({
      accountId,
      mailKey,
      mail: buildComposeMailPayload(mailFields),
      close: closeOnSave,
      displayNotificationOnError,
      displayNotificationOnSuccess,
    })

    if (!('error' in result)) {
      dispatch(markDraftSaved({ draftId }))

      // Server now holds the draft — drop the local mirror so it is not
      // rehydrated as a duplicate compose window on next boot.
      if (isPwaOutboxEnabled()) {
        const userId = getAuthUserId()
        if (userId) void deleteLocalDraft(userId, draftId)
      }

      if ('data' in result && result?.data?.data?.key) {
        dispatch(
          updateMailKey({
            draftId,
            mailKey: result.data.data.key,
          })
        )
      }

      if (closeOnSave) {
        dispatch(closeDraft({ draftId }))
      }
    }
  }

  useInterval(
    () => {
      if (
        isActive &&
        hasDraft &&
        isDirty &&
        !isSavingDraft &&
        !isSending &&
        !isUploading
      ) {
        handleSaveDraft(false, false, false)
      }
    },
    autosaveIntervalMs,
    !isMinimized
  )

  const handleClose = () => {
    if (!isDirty) {
      dispatch(closeDraft({ draftId }))
      return Promise.resolve()
    }
    return handleSaveDraft(true, true, true)
  }

  const handleDiscardDraft = async () => {
    if (mailKey != null) {
      await deleteMail({ accountId, mailKey })
    }

    if (isPwaOutboxEnabled()) {
      const userId = getAuthUserId()
      if (userId) void deleteLocalDraft(userId, draftId)
    }

    dispatch(closeDraft({ draftId }))
  }

  return {
    isSavingDraft,
    handleSaveDraft,
    handleClose,
    handleDiscardDraft,
  }
}
