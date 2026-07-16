import type { ImapFolder, ImapFolderType } from '../mails-types'

/**
 * Backend folder rename (PATCH) is not available in production yet.
 * Set to `true` once `ApiMailFolder` exposes rename.
 */
export const FOLDER_RENAME_API_ENABLED = false

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
  if (!FOLDER_RENAME_API_ENABLED) return false
  if (folder.default) return false
  if (folder.type && NON_RENAMEABLE_TYPES.has(folder.type)) return false
  return true
}
