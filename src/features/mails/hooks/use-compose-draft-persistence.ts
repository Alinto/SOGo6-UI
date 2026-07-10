'use client'

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
  ...mailFields
}: UseComposeDraftPersistenceOptions) {
  const dispatch = useAppDispatch()
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation()
  const [deleteMail] = useDeleteMailMutation()

  const handleSaveDraft = async (
    displayNotificationOnSuccess: boolean,
    displayNotificationOnError: boolean,
    closeOnSave: boolean
  ): Promise<void> => {
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
    //if no save needed
    if (!isDirty) {
      dispatch(closeDraft({ draftId }))
    } else {
      //else save then close
      handleSaveDraft(true, true, true)
    }
  }

  const handleDiscardDraft = async () => {
    if (mailKey != null) {
      await deleteMail({ accountId, mailKey })
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
