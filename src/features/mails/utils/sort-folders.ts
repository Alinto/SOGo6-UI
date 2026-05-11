import type { ImapFolder } from '../mails-types'

export const FOLDER_TYPE_ORDER: Record<string, number> = {
  INBOX: 0,
  SENT: 1,
  DRAFT: 2,
  DRAFTS: 2,
  TRASH: 3,
  JUNK: 4,
  TEMPLATE: 5,
  NORMAL: 6,
}

export function getFolderSortRank(type: string | undefined): number {
  if (type === undefined || type === '') {
    return 6
  }
  const key = type.toUpperCase()
  return FOLDER_TYPE_ORDER[key] ?? 6
}

function getChildFoldersSource(folder: ImapFolder): ImapFolder[] {
  if (folder.children && folder.children.length > 0) {
    return folder.children
  }
  return folder.subfolders ?? []
}

export function sortImapFoldersTree(folders: ImapFolder[]): ImapFolder[] {
  return [...folders]
    .sort((a, b) => {
      const rankA = getFolderSortRank(a.type)
      const rankB = getFolderSortRank(b.type)
      if (rankA !== rankB) {
        return rankA - rankB
      }
      return a.name.localeCompare(b.name)
    })
    .map((folder) => {
      const rawChildren = getChildFoldersSource(folder)
      const sortedSubfolders =
        rawChildren.length > 0 ? sortImapFoldersTree(rawChildren) : []
      return {
        ...folder,
        subfolders: sortedSubfolders,
      }
    })
}
