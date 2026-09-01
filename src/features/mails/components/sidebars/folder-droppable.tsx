'use client'

import Droppable from '@/components/dnd/droppable'
import { dndId } from '@/components/dnd/ids'
import {
  isFolderDragData,
  isMailDragData,
  type FolderDragData,
} from '@/components/dnd/types'
import { cn } from '@/lib/utils'
import { useDndContext } from '@dnd-kit/core'
import React, { useEffect } from 'react'
import type { ImapFolderType } from '../../mails-types'
import { isVirtualFolder } from '../../utils/folder-type-helpers'
import { getMailDropTargetState } from '../../utils/mail-folder-drop'

export const FOLDER_DWELL_EXPAND_MS = 500
export const FOLDER_DROP_ALLOWED_CLASS = 'folder-drop-target-allowed'
export const FOLDER_DROP_FORBIDDEN_CLASS = 'folder-drop-target-forbidden'

interface FolderDroppableProps {
  folderPath: string
  folderType?: ImapFolderType
  folderName?: string
  selectable?: boolean
  isVirtual?: boolean
  hasSubfolders?: boolean
  onDwellExpand?: () => void
  children: React.ReactNode
}

const FolderDroppable: React.FC<FolderDroppableProps> = ({
  folderPath,
  folderType,
  folderName,
  selectable = true,
  isVirtual = false,
  hasSubfolders = false,
  onDwellExpand,
  children,
}) => {
  const { active, over } = useDndContext()
  const activeData = active?.data.current
  const isMailDrag = isMailDragData(activeData)
  const isUnavailable =
    !selectable || isVirtual || isVirtualFolder({ selectable })
  const disabled = isUnavailable || (active != null && !isMailDrag)

  const data: FolderDragData = {
    type: 'folder',
    folderPath,
    folderType,
    folderName,
  }

  const overData = over?.data.current
  const isOverThis =
    isMailDrag &&
    isFolderDragData(overData) &&
    overData.folderPath === folderPath

  const dropState = isMailDrag
    ? getMailDropTargetState(activeData, {
        folderPath,
        folderType,
      })
    : 'none'
  const canAccept = dropState === 'allowed'

  useEffect(() => {
    if (!hasSubfolders || !isOverThis || disabled) return
    const timer = setTimeout(() => {
      onDwellExpand?.()
    }, FOLDER_DWELL_EXPAND_MS)
    return () => clearTimeout(timer)
  }, [disabled, hasSubfolders, isOverThis, onDwellExpand])

  return (
    <Droppable
      id={dndId.folder(folderPath)}
      data={data}
      disabled={disabled}
      dataDrop={isMailDrag ? dropState : undefined}
      className={cn(
        isMailDrag && dropState === 'forbidden' && !isOverThis && 'opacity-50',
        isOverThis && canAccept && FOLDER_DROP_ALLOWED_CLASS,
        isOverThis && !canAccept && FOLDER_DROP_FORBIDDEN_CLASS
      )}
    >
      {children}
    </Droppable>
  )
}

export default FolderDroppable
