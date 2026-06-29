'use client'

import { useProfile } from '@/features/user-profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import React from 'react'
import { selectOpenDraftIds } from '../../store'
import { useLazyGetCurrentDraftsQuery } from '../../store/mail-api'
import { createDraft } from '../../store/mail-compose-slice'
import { useLazyGetMailQuery } from '../../store/mails-api'
import { apiDataToMailComposeDraft } from '../../utils/mail-compose-from-api'
import { FOLDERS_NAME } from '../constants'
import FloatingCompose from './floating-compose'

const FloatingComposeContainer = () => {
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const { mainAccount } = useProfile()
  const [triggerGetCurrentDrafts] = useLazyGetCurrentDraftsQuery()
  const isMobile = useIsMobile()

  const [triggerGetMail] = useLazyGetMailQuery()
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    if (!mainAccount?.id || hasInitialized.current || isMobile) return

    const accountId = String(mainAccount.id)

    const initDrafts = async () => {
      if (accountId) {
        const result = await triggerGetCurrentDrafts({ accountId })
        if (!result.data?.data?.length) return

        for (const item of result.data.data) {
          const draftId = crypto.randomUUID()
          const editResult = await triggerGetMail({
            folder: FOLDERS_NAME.DRAFT,
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
  }, [dispatch, isMobile, mainAccount?.id, triggerGetCurrentDrafts, triggerGetMail])

  if (openDraftIds.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-14 bottom-0 z-100 flex flex-row-reverse items-end -space-x-32 space-x-reverse px-4">
      {openDraftIds.map((draftId) => (
        <FloatingCompose key={draftId} draftId={draftId} />
      ))}
    </div>
  )
}

export default FloatingComposeContainer
