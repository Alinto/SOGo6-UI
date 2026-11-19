'use client'

import { useProfile } from '@/features/user-profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import React from 'react'
import { selectOpenDraftIds } from '../../store'
import { useLazyGetCurrentDraftsQuery } from '../../store/mail-api'
import { createDraft } from '../../store/mail-compose-slice'
import {
  useLazyGetFoldersQuery,
  useLazyGetMailQuery,
} from '../../store/mails-api'
import { findDraftFolderPath } from '../../utils/folder-type-helpers'
import { apiDataToMailComposeDraft } from '../../utils/mail-compose-from-api'
import FloatingCompose from './floating-compose'

const FloatingComposeContainer = () => {
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const { mainAccount } = useProfile()
  const [triggerGetCurrentDrafts] = useLazyGetCurrentDraftsQuery()
  const isMobile = useIsMobile()

  const [triggerGetMail] = useLazyGetMailQuery()
  const [triggerGetFolders] = useLazyGetFoldersQuery()
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    if (!mainAccount?.id || hasInitialized.current || isMobile) return

    const accountId = String(mainAccount.id)

    const initDrafts = async () => {
      if (accountId) {
        const result = await triggerGetCurrentDrafts({ accountId })
        // A draft whose first save failed keeps an empty server uid: there is
        // nothing to fetch for it.
        const drafts = (result.data?.data ?? []).filter(
          (item) => item.mail_server_uid
        )
        if (!drafts.length) return

        // The drafts folder is not always named "Drafts": use the one the
        // server flags as such, and skip restoring when the account has none.
        const foldersResult = await triggerGetFolders({ accountId }, true)
        const draftFolder = findDraftFolderPath(foldersResult.data ?? [])
        if (!draftFolder) return

        for (const item of drafts) {
          const draftId = createClientId()
          const editResult = await triggerGetMail({
            folder: draftFolder,
            mailId: item.mail_server_uid,
            accountId,
          })
          if (editResult.data) {
            dispatch(
              createDraft({
                draftId,
                initialData: apiDataToMailComposeDraft(draftId, {
                  ...editResult.data,
                  key: item.key,
                }),
              })
            )
          }
        }
      }
    }

    const timer = window.setTimeout(() => {
      hasInitialized.current = true
      void initDrafts()
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [
    dispatch,
    isMobile,
    mainAccount?.id,
    triggerGetCurrentDrafts,
    triggerGetFolders,
    triggerGetMail,
  ])

  if (openDraftIds.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-14 bottom-0 z-(--z-floating-compose) flex flex-row-reverse items-end -space-x-32 space-x-reverse px-4">
      {openDraftIds.map((draftId) => (
        <FloatingCompose key={draftId} draftId={draftId} />
      ))}
    </div>
  )
}

export default FloatingComposeContainer
