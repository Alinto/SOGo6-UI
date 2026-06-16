import type { ImapFolder, ImapFolderType } from '../mails-types'

const NON_RENAMEABLE_TYPES = new Set<ImapFolderType>([
  'INBOX',
  'SENT',
  'DRAFT',
  'DRAFTS',
  'TRASH',
  'JUNK',
  'TEMPLATE',
])

export function canRenameFolder(
  folder: Pick<ImapFolder, 'default' | 'type'>
): boolean {
  if (folder.default) return false
  if (folder.type && NON_RENAMEABLE_TYPES.has(folder.type)) return false
  return true
}
