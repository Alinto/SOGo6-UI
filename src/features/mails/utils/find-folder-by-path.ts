import type { ImapFolder } from '../mails-types'

function matchesFolderPath(folder: ImapFolder, path: string): boolean {
  if (folder.path.toLowerCase() === path.toLowerCase()) return true
  // A single segment ("Junk", "INBOX") may match the folder name.
  // A full path must match folder.path only, so two folders that share a
  // name (a personal "Lecture" and shared/.../Lecture) are not confused.
  if (path.includes('/')) return false
  return folder.name.toLowerCase() === path.toLowerCase()
}

/**
 * Finds a folder in the IMAP tree by URL path (e.g. "INBOX", "Junk", "INBOX/Work").
 */
export function findFolderByPath(
  folders: ImapFolder[],
  path: string
): ImapFolder | undefined {
  for (const folder of folders) {
    if (matchesFolderPath(folder, path)) {
      return folder
    }
    const nested = folder.subfolders ?? folder.children ?? []
    const found = findFolderByPath(nested, path)
    if (found) return found
  }
  return undefined
}

export function isJunkFolderPath(
  _folderPath: string,
  folder?: ImapFolder
): boolean {
  return folder?.type === 'JUNK'
}

export function isTrashFolderPath(
  _folderPath: string,
  folder?: ImapFolder
): boolean {
  return folder?.type === 'TRASH'
}
