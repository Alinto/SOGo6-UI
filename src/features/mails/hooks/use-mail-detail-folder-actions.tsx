'use client'

import {
  createDraft,
  setActiveDraft,
} from '@/features/mails/store/mail-compose-slice'
import {
  selectAllDrafts,
  selectOpenDraftIds,
} from '@/features/mails/store/mail-compose-selectors'
import { useLazyGetEditMessageQuery } from '@/features/mails/store/mails-api'
import type { ImapMessages, ImapFolderType } from '@/features/mails/mails-types'
import { apiDataToMailComposeDraft } from '@/features/mails/utils/mail-compose-from-api'
import {
  isDraftFolderType,
  isTemplateFolderType,
} from '@/features/mails/utils/folder-type-helpers'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import { FilePen, LayoutTemplate } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import type { Action } from '../components/mail/types'
import { ActionId } from '../components/mail/types'

interface UseMailDetailFolderActionsOptions {
  folderType?: ImapFolderType
  folder: string
  accountId: string
  mailId: string
  mail?: ImapMessages
}

export function useMailDetailFolderActions({
  folderType,
  folder,
  accountId,
  mailId,
  mail,
}: UseMailDetailFolderActionsOptions) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const allDrafts = useAppSelector(selectAllDrafts)
  const [triggerGetEditMessage] = useLazyGetEditMessageQuery()

  const openDraftEditor = useCallback(async () => {
    const existingDraftId = openDraftIds.find(
      (draftId) => allDrafts[draftId]?.mailKey === mailId
    )
    if (existingDraftId) {
      dispatch(setActiveDraft(existingDraftId))
      return
    }

    const result = await triggerGetEditMessage({
      folder,
      mailId,
      accountId,
    })
    const draftId = createClientId()
    dispatch(
      createDraft({
        draftId,
        initialData: apiDataToMailComposeDraft(draftId, {
          ...mail,
          ...result.data,
        }),
      })
    )
  }, [
    accountId,
    allDrafts,
    dispatch,
    folder,
    mail,
    mailId,
    openDraftIds,
    triggerGetEditMessage,
  ])

  const createDraftFromTemplate = useCallback(async () => {
    const result = await triggerGetEditMessage({
      folder,
      mailId,
      accountId,
    })
    const draftId = createClientId()
    const mailData = { ...mail, ...result.data }
    dispatch(
      createDraft({
        draftId,
        initialData: apiDataToMailComposeDraft(draftId, mailData),
      })
    )
  }, [accountId, dispatch, folder, mail, mailId, triggerGetEditMessage])

  const folderSpecificActions: Action[] = []

  if (isDraftFolderType(folderType)) {
    folderSpecificActions.push({
      id: ActionId.EDIT_DRAFT,
      icon: <FilePen size={18} />,
      title: t('edit_draft.string'),
    })
  }

  if (isTemplateFolderType(folderType)) {
    folderSpecificActions.push({
      id: ActionId.USE_TEMPLATE,
      icon: <LayoutTemplate size={18} />,
      title: t('use_template.string'),
    })
  }

  const handleFolderSpecificAction = useCallback(
    (action: Action) => {
      if (action.id === ActionId.EDIT_DRAFT) {
        void openDraftEditor()
        return true
      }
      if (action.id === ActionId.USE_TEMPLATE) {
        void createDraftFromTemplate()
        return true
      }
      return false
    },
    [createDraftFromTemplate, openDraftEditor]
  )

  const hideReplyActions =
    isDraftFolderType(folderType) || isTemplateFolderType(folderType)

  return {
    folderSpecificActions,
    handleFolderSpecificAction,
    hideReplyActions,
  }
}
