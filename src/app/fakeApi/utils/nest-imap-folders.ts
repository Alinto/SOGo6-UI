import type { ImapFolder } from '@/features/mails/mails-types'

const SPECIAL_FOLDER_ORDER = [
  'INBOX',
  'Sent',
  'Drafts',
  'Trash',
  'Junk',
  'Templates',
]

function sortFlatFolders(flatFolderList: ImapFolder[]): ImapFolder[] {
  return [...flatFolderList].sort((a, b) => {
    const aIdx = SPECIAL_FOLDER_ORDER.indexOf(a.name)
    const bIdx = SPECIAL_FOLDER_ORDER.indexOf(b.name)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return a.name.localeCompare(b.name)
  })
}

/** Builds a nested folder tree from a flat IMAP folder list. */
export function nestImapFolderTree(flatFolderList: ImapFolder[]): ImapFolder[] {
  const folderMap: Record<string, ImapFolder> = {}
  const roots: ImapFolder[] = []

  const clones = flatFolderList.map(
    ({ subfolders: _subfolders, children: _children, ...folder }) => ({
      ...folder,
    })
  )

  clones.forEach((folder) => {
    folderMap[folder.path] = folder
  })

  sortFlatFolders(clones).forEach((folder) => {
    const parts = folder.path.split(folder.delimiter)
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join(folder.delimiter)
      const parent = folderMap[parentPath]
      if (parent) {
        parent.subfolders ??= []
        parent.subfolders.push(folder)
      } else {
        roots.push(folder)
      }
    } else {
      roots.push(folder)
    }
  })

  return roots.filter(
    (folder, idx, arr) => arr.findIndex((f) => f.path === folder.path) === idx
  )
}
