'use client'

import Draggable from '@/components/dnd/draggable'
import { dndId } from '@/components/dnd/ids'
import { isMailDragData, type MailDragData } from '@/components/dnd/types'
import { cn } from '@/lib/utils'
import { useDndContext } from '@dnd-kit/core'
import React, { memo } from 'react'
import type { ImapFolderType, ImapMessagesList } from '../mails-types'
import { getListDisplayContact } from '../utils/folder-type-helpers'
import { resolveDraggedMailIds } from '../utils/mail-folder-drop'

interface MailListDraggableProps {
  item: ImapMessagesList
  accountId: string
  folder: string
  folderType?: ImapFolderType
  selectedIds: string[]
  children: React.ReactNode
}

const MailListDraggable: React.FC<MailListDraggableProps> = ({
  item,
  accountId,
  folder,
  folderType,
  selectedIds,
  children,
}) => {
  const { active } = useDndContext()
  const mailId = String(item.id)
  const activeData = active?.data.current
  const draggedIds = isMailDragData(activeData)
    ? resolveDraggedMailIds(activeData.mailId, selectedIds)
    : []
  const isSource = draggedIds.includes(mailId)

  const data: MailDragData = {
    type: 'mail',
    mailId,
    accountId,
    folder,
    folderType,
    subject: item.subject,
    from: getListDisplayContact(item, folderType),
    count: 1,
  }

  return (
    <Draggable id={dndId.mail(mailId)} data={data} className="cursor-grab">
      <div className={cn(isSource && 'opacity-40')}>{children}</div>
    </Draggable>
  )
}

export default memo(MailListDraggable)
