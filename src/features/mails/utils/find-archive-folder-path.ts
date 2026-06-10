import type { ImapFolder } from '../mails-types'

export const ARCHIVE_FOLDER_FALLBACK = 'Archive'

export function findArchiveFolderPath(
  folders: ImapFolder[] | undefined
): string | null {
  if (!folders?.length) return null
  for (const node of folders) {
    if (node.name.toLowerCase() === 'archive') {
      return node.path
    }
    const nested = node.subfolders ?? node.children ?? []
    const found = findArchiveFolderPath(nested)
    if (found) return found
  }
  return null
}
