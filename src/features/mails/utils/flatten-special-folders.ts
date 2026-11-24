import type { ImapFolder } from '../mails-types'
import { isNormalFolderType } from './folder-type-helpers'
import { getFolderSortRank } from './sort-folders'

function childFolders(folder: ImapFolder): ImapFolder[] {
  if (folder.subfolders && folder.subfolders.length > 0)
    return folder.subfolders
  return folder.children ?? []
}

/**
 * Every non-NORMAL folder of the tree, nested ones included, on a single
 * level and ordered by folder type (Inbox, Sent, Drafts, Trash, Junk…).
 */
export function flattenSpecialFolders(folders: ImapFolder[]): ImapFolder[] {
  const special: ImapFolder[] = []
  const visit = (nodes: ImapFolder[]) => {
    for (const folder of nodes) {
      if (!isNormalFolderType(folder.type)) special.push(folder)
      visit(childFolders(folder))
    }
  }
  visit(folders)
  return special.sort(
    (a, b) => getFolderSortRank(a.type) - getFolderSortRank(b.type)
  )
}
