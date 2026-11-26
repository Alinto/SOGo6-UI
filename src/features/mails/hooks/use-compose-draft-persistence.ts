'use client'

import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import {
  deleteLocalDraft,
  deleteLocalDraftIfNotNewer,
} from '@/features/offline/db/drafts-store'
import { isPwaOutboxEnabled } from '@/features/offline/flags'
import { persistLocalDraft } from '@/features/offline/hooks/use-offline-draft-sync'
import { probeNetwork } from '@/features/offline/network/probe'
import { releaseOutboxForEdit } from '@/features/offline/outbox/outbox-edit-hold'
import { useInterval } from '@/hooks/use-interval'
import { useAppDispatch } from '@/lib/redux/hooks'
import { closeDraft } from '../store'
import { useDeleteMailMutation, useSaveDraftMutation } from '../store/mail-api'
import type { MailComposeAttachment } from '../store/mail-compose-slice'
import { markDraftSaved, updateMailKey } from '../store/mail-compose-slice'
import {
  buildComposeMailPayload,
  type ComposeMailFields,
} from '../utils/build-compose-mail-payload'
import { trackDraftSave } from '../utils/draft-save-tracker'

/** Drafts whose local mirror failed already (warn once per draft). */
const warnedLocalMirrorFailures = new Set<string>()

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
  sourceOutboxId?: string | null
  attachments?: MailComposeAttachment[]
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
  sourceOutboxId = null,
  attachments = [],
  ...mailFields
}: UseComposeDraftPersistenceOptions) {
  const dispatch = useAppDispatch()
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation()
  const [deleteMail] = useDeleteMailMutation()

  /** Local mirror write; resolves with its `updatedAt`, or null. */
  const persistLocal = async (): Promise<number | null> => {
    if (sourceOutboxId) return null
    if (!isPwaOutboxEnabled()) return null
    const userId = getAuthUserId()
    if (!userId) return null
    return persistLocalDraft({
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
      attachments: attachments
        .filter((attachment) => attachment.file)
        .map((attachment, index) => ({
          id: `${attachment.name}-${attachment.size}-${index}`,
          name: attachment.name,
          size: attachment.size,
          type: attachment.type,
          blob: attachment.file,
          uploaded: mailKey != null && attachment.uploadStatus === 'completed',
        })),
    })
  }

  const handleSaveDraft = async (
    displayNotificationOnSuccess: boolean,
    displayNotificationOnError: boolean,
    closeOnSave: boolean
  ): Promise<void> => {
    if (sourceOutboxId) {
      if (closeOnSave) {
        releaseOutboxForEdit(sourceOutboxId)
        dispatch(closeDraft({ draftId }))
      }
      return
    }

    await trackDraftSave(
      draftId,
      saveToServer(
        displayNotificationOnSuccess,
        displayNotificationOnError,
        closeOnSave
      )
    )
  }

  /** Best-effort: a failing local mirror must never block the server save. */
  const persistLocalSafely = async (): Promise<number | null> => {
    try {
      return await persistLocal()
    } catch (error) {
      if (!warnedLocalMirrorFailures.has(draftId)) {
        warnedLocalMirrorFailures.add(draftId)
        console.warn('[offline] local draft copy not saved', error)
      }
      return null
    }
  }

  /** Resolves with the server mail key once saved, or null. */
  const saveToServer = async (
    displayNotificationOnSuccess: boolean,
    displayNotificationOnError: boolean,
    closeOnSave: boolean
  ): Promise<string | null> => {
    const localSavedAt = await persistLocalSafely()
    // Anything written locally after this point is newer than what the
    // server is about to store.
    const snapshotAt = localSavedAt ?? Date.now()

    const online = !isPwaOutboxEnabled() || (await probeNetwork())
    if (!online) {
      // Only the local copy exists: keep the draft dirty so the autosave
      // pushes it to the server once the network is back (and closing it
      // keeps the local copy, rehydrated dirty on next boot).
      if (closeOnSave) {
        dispatch(closeDraft({ draftId }))
      }
      return null
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
      // rehydrated as a duplicate compose window on next boot, unless a
      // newer local copy was written while this save was in flight.
      if (isPwaOutboxEnabled()) {
        const userId = getAuthUserId()
        if (userId) {
          await deleteLocalDraftIfNotNewer(userId, draftId, snapshotAt).catch(
            () => false
          )
        }
      }

      const savedKey = result.data?.data?.key ?? null
      if (savedKey) {
        dispatch(
          updateMailKey({
            draftId,
            mailKey: savedKey,
          })
        )
      }

      if (closeOnSave) {
        dispatch(closeDraft({ draftId }))
      }
      return savedKey
    }
    return null
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
    if (sourceOutboxId) {
      releaseOutboxForEdit(sourceOutboxId)
      dispatch(closeDraft({ draftId }))
      return Promise.resolve()
    }
    if (!isDirty) {
      dispatch(closeDraft({ draftId }))
      return Promise.resolve()
    }
    return handleSaveDraft(true, true, true)
  }

  const handleDiscardDraft = async () => {
    if (sourceOutboxId) {
      releaseOutboxForEdit(sourceOutboxId)
      dispatch(closeDraft({ draftId }))
      return
    }

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
