'use client'

import { isFolderDragData, isMailDragData } from '@/components/dnd/types'
import { useDndContext } from '@dnd-kit/core'
import { useEffect } from 'react'
import { getMailDropTargetState } from '../utils/mail-folder-drop'

export const MAIL_DRAGGING_CLASS = 'mail-dragging'
export const MAIL_DROP_FORBIDDEN_CLASS = 'mail-drop-forbidden'

/** Sets grabbing / not-allowed cursor on the document while a mail is dragged. */
export function useMailDragPointer() {
  const { active, over } = useDndContext()
  const activeData = active?.data.current
  const overData = over?.data.current
  const source = isMailDragData(activeData) ? activeData : null
  const dest = isFolderDragData(overData) ? overData : null
  const dropState = getMailDropTargetState(source, dest)

  useEffect(() => {
    const root = document.documentElement
    if (!source) {
      root.classList.remove(MAIL_DRAGGING_CLASS, MAIL_DROP_FORBIDDEN_CLASS)
      return
    }

    root.classList.add(MAIL_DRAGGING_CLASS)
    root.classList.toggle(MAIL_DROP_FORBIDDEN_CLASS, dropState === 'forbidden')

    return () => {
      root.classList.remove(MAIL_DRAGGING_CLASS, MAIL_DROP_FORBIDDEN_CLASS)
    }
  }, [dropState, source])
}
