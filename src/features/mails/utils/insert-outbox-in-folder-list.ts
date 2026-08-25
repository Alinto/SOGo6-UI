import type { ImapFolder } from '../mails-types'
import { isDraftFolderType, isSentFolderType } from './folder-type-helpers'

export type OutboxListSentinel = { readonly kind: 'outbox' }

export const OUTBOX_LIST_SENTINEL: OutboxListSentinel = { kind: 'outbox' }

export type FolderListNode = ImapFolder | OutboxListSentinel

export function isOutboxListSentinel(
  node: FolderListNode
): node is OutboxListSentinel {
  return 'kind' in node && node.kind === 'outbox'
}

/** Place Outbox after Drafts, or before Sent if Drafts is missing. */
export function insertOutboxInFolderList(
  folders: ImapFolder[]
): FolderListNode[] {
  const draftIdx = folders.findIndex((folder) => isDraftFolderType(folder.type))
  const sentIdx = folders.findIndex((folder) => isSentFolderType(folder.type))
  const insertAt =
    draftIdx >= 0 ? draftIdx + 1 : sentIdx >= 0 ? sentIdx : folders.length

  return [
    ...folders.slice(0, insertAt),
    OUTBOX_LIST_SENTINEL,
    ...folders.slice(insertAt),
  ]
}
