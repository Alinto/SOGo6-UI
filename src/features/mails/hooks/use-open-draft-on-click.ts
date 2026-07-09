'use client'

import {
  createDraft,
  selectAllDrafts,
  selectOpenDraftIds,
  setActiveDraft,
} from '@/features/mails/store/mail-compose-slice'
import { useLazyGetEditMessageQuery } from '@/features/mails/store/mails-api'
import { apiDataToMailComposeDraft } from '@/features/mails/utils/mail-compose-from-api'
import { isDraftFolderType } from '@/features/mails/utils/folder-type-helpers'
import type { ImapFolderType } from '@/features/mails/mails-types'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import { useCallback } from 'react'

interface OpenDraftOptions {
  folderType?: ImapFolderType
  folderPath: string
  accountId: string
  mailId: string
}

export function useOpenDraftOnClick() {
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const allDrafts = useAppSelector(selectAllDrafts)
  const [triggerGetEditMessage] = useLazyGetEditMessageQuery()

  const openDraftIfNeeded = useCallback(
    async ({ folderType, folderPath, accountId, mailId }: OpenDraftOptions) => {
      if (!isDraftFolderType(folderType)) return false

      const existingDraftId = openDraftIds.find(
        (draftId) => allDrafts[draftId]?.mailKey === mailId
      )
      if (existingDraftId) {
        dispatch(setActiveDraft(existingDraftId))
        return true
      }

      const result = await triggerGetEditMessage({
        folder: folderPath,
        mailId,
        accountId,
      })
      const draftId = createClientId()
      dispatch(
        createDraft({
          draftId,
          initialData: apiDataToMailComposeDraft(draftId, {
            ...result.data,
          }),
        })
      )
      return true
    },
    [allDrafts, dispatch, openDraftIds, triggerGetEditMessage]
  )

  return { openDraftIfNeeded, isDraftFolderType }
}
