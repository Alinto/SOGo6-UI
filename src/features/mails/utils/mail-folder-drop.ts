import { isFolderDragData, isMailDragData } from '@/components/dnd/types'
import type { DragEndEvent } from '@dnd-kit/core'
import type { ImapFolderType } from '../mails-types'
import {
  isDraftFolderType,
  isInboxFolderType,
  isJunkFolderType,
  isSentFolderType,
  isTemplateFolderType,
  isTrashFolderType,
  normalizeFolderType,
} from './folder-type-helpers'

export type MailDropTargetState = 'none' | 'allowed' | 'forbidden'

function isReceivedMailSource(sourceType?: ImapFolderType): boolean {
  const source = normalizeFolderType(sourceType)
  if (source == null) return true
  return (
    isInboxFolderType(source) ||
    source === 'NORMAL' ||
    isTrashFolderType(source) ||
    isJunkFolderType(source)
  )
}

/**
 * IMAP special folders are not generic buckets.
 * Inbox holds received mail (including junk restored as ham);
 * Sent / Drafts / Templates only accept their own kind.
 */
export function canDropMailOnFolder({
  sourcePath,
  sourceType,
  destPath,
  destType,
  destSelectable = true,
}: {
  sourcePath: string
  sourceType?: ImapFolderType
  destPath: string
  destType?: ImapFolderType
  destSelectable?: boolean
}): boolean {
  if (!destPath || destPath === sourcePath) return false
  if (destSelectable === false) return false

  const source = normalizeFolderType(sourceType)
  const dest = normalizeFolderType(destType)

  if (isSentFolderType(dest) && !isSentFolderType(source)) return false
  if (isDraftFolderType(dest) && !isDraftFolderType(source)) return false
  if (isTemplateFolderType(dest) && !isTemplateFolderType(source)) return false

  if (isJunkFolderType(dest) || isInboxFolderType(dest)) {
    return isReceivedMailSource(source)
  }

  return true
}

export function getMailDropTargetState(
  source: { folder: string; folderType?: ImapFolderType } | null | undefined,
  dest: {
    folderPath: string
    folderType?: ImapFolderType
  } | null
): MailDropTargetState {
  if (!source || !dest) return 'none'
  return canDropMailOnFolder({
    sourcePath: source.folder,
    sourceType: source.folderType,
    destPath: dest.folderPath,
    destType: dest.folderType,
  })
    ? 'allowed'
    : 'forbidden'
}

export function resolveDraggedMailIds(
  mailId: string,
  selectedIds: string[]
): string[] {
  return selectedIds.includes(mailId) ? selectedIds : [mailId]
}

export type MailFolderDropAction =
  | { kind: 'noop' }
  | {
      kind: 'spam'
      mailIds: string[]
      accountId: string
      folder: string
    }
  | {
      kind: 'delete'
      mailIds: string[]
      accountId: string
      folder: string
    }
  | {
      kind: 'move'
      mailIds: string[]
      accountId: string
      folder: string
      destination: string
    }

export function resolveMailFolderDrop(
  event: Pick<DragEndEvent, 'active' | 'over'>,
  selectedIds: string[]
): MailFolderDropAction {
  const activeData = event.active.data.current
  const overData = event.over?.data.current
  if (!isMailDragData(activeData) || !isFolderDragData(overData)) {
    return { kind: 'noop' }
  }
  if (
    !canDropMailOnFolder({
      sourcePath: activeData.folder,
      sourceType: activeData.folderType,
      destPath: overData.folderPath,
      destType: overData.folderType,
    })
  ) {
    return { kind: 'noop' }
  }

  const mailIds = resolveDraggedMailIds(activeData.mailId, selectedIds)
  const base = {
    mailIds,
    accountId: activeData.accountId,
    folder: activeData.folder,
  }

  if (isJunkFolderType(overData.folderType)) {
    return { kind: 'spam', ...base }
  }
  if (isTrashFolderType(overData.folderType)) {
    return { kind: 'delete', ...base }
  }
  return {
    kind: 'move',
    ...base,
    destination: overData.folderPath,
  }
}
