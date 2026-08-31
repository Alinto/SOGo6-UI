import type { ImapFolder, ImapFolderType } from '@/features/mails/mails-types'
import {
  isInboxFolderType,
  isSentFolderType,
} from '@/features/mails/utils/folder-type-helpers'

export function findFolderByType(
  folders: ImapFolder[],
  type: ImapFolderType
): ImapFolder | undefined {
  for (const folder of folders) {
    if (
      type === 'SENT'
        ? isSentFolderType(folder.type)
        : type === 'INBOX'
          ? isInboxFolderType(folder.type)
          : folder.type === type
    ) {
      return folder
    }
    const nested = folder.subfolders ?? folder.children ?? []
    const found = findFolderByType(nested, type)
    if (found) return found
  }
  return undefined
}

export function scheduleIdle(callback: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(() => callback())
    return () => cancelIdleCallback(id)
  }
  const id = window.setTimeout(callback, 1)
  return () => window.clearTimeout(id)
}
