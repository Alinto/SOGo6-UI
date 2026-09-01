'use client'

import { isFolderDragData, isMailDragData } from '@/components/dnd/types'
import { useDndContext } from '@dnd-kit/core'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { getMailDropTargetState } from '../utils/mail-folder-drop'

interface MailDragOverlayProps {
  from: string
  subject: string
  count: number
}

const MailDragOverlay: React.FC<MailDragOverlayProps> = ({
  from,
  subject,
  count,
}) => {
  const t = useTranslations('MAILS_LIST')
  const { active, over } = useDndContext()
  const activeData = active?.data.current
  const overData = over?.data.current
  const source = isMailDragData(activeData) ? activeData : null
  const dest = isFolderDragData(overData) ? overData : null
  const dropState = getMailDropTargetState(source, dest)

  return (
    <div className="bg-background pointer-events-none max-w-60 rounded-lg border px-3 py-2 shadow-lg">
      <p className="truncate text-sm font-medium">{from}</p>
      <p className="text-muted-foreground truncate text-xs">{subject}</p>
      {count > 1 ? (
        <span className="bg-primary text-primary-foreground mt-1 inline-flex rounded-full px-2 py-0.5 text-xs">
          {t('messages_number.string', { number: count })}
        </span>
      ) : null}
      {dropState === 'allowed' && dest?.folderName ? (
        <p className="text-primary mt-1 truncate text-xs font-medium">
          {t('drag_overlay.move_to.string', { folder: dest.folderName })}
        </p>
      ) : null}
      {dropState === 'forbidden' ? (
        <p className="text-destructive mt-1 truncate text-xs font-medium">
          {t('drag_overlay.cannot_drop.string')}
        </p>
      ) : null}
    </div>
  )
}

export default memo(MailDragOverlay)
