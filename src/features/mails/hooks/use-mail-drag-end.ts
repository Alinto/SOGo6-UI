'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import type { DragEndEvent } from '@dnd-kit/core'
import { useCallback } from 'react'
import { clearSelectedMails } from '../store/mail-layout-slice'
import { useMailBatchActionMutation } from '../store/mails-api'
import { resolveMailFolderDrop } from '../utils/mail-folder-drop'

export function useMailDragEnd() {
  const dispatch = useAppDispatch()
  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout?.selectedMailIds ?? []
  )
  const [mailBatchAction] = useMailBatchActionMutation()

  return useCallback(
    (event: DragEndEvent) => {
      const action = resolveMailFolderDrop(event, selectedIds)
      if (action.kind === 'noop') return

      const payload = {
        accountId: action.accountId,
        folder: action.folder,
        uids: action.mailIds,
      }

      if (action.kind === 'spam') {
        void mailBatchAction({ ...payload, action: 'spam' })
      } else if (action.kind === 'delete') {
        void mailBatchAction({ ...payload, action: 'delete' })
      } else {
        void mailBatchAction({
          ...payload,
          action: 'move',
          data: action.destination,
        })
      }

      if (action.mailIds.some((id) => selectedIds.includes(id))) {
        dispatch(clearSelectedMails())
      }
    },
    [dispatch, mailBatchAction, selectedIds]
  )
}
