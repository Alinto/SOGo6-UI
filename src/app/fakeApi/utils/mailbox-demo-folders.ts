import type { ImapFolder } from '@/features/mails/mails-types'

import folders from '@/app/fakeApi/mails/folders/folders.json'

const baseFlatFolders = folders as ImapFolder[]

/** Dossiers créés en session (perdus au redémarrage du serveur Next). */
const createdFlatFolders: ImapFolder[] = []

function nestFolders(flatFolderList: ImapFolder[]) {
  const folderMap: Record<string, ImapFolder> = {}
  const roots: ImapFolder[] = []

  flatFolderList.forEach((folder) => {
    if (folder.flags.includes('\\HasChildren')) {
      folder.subfolders = []
    }
    folderMap[folder.path] = folder
  })

  const specialOrder = ['INBOX', 'Sent', 'Drafts', 'Trash', 'Junk', 'Templates']
  const sorted = [...flatFolderList].sort((a, b) => {
    const aIdx = specialOrder.indexOf(a.name)
    const bIdx = specialOrder.indexOf(b.name)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return a.name.localeCompare(b.name)
  })

  sorted.forEach((folder) => {
    const parts = folder.path.split(folder.delimiter)
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join(folder.delimiter)
      if (
        folderMap[parentPath] &&
        Array.isArray(folderMap[parentPath].subfolders)
      ) {
        folderMap[parentPath].subfolders!.push(folder)
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

function getEffectiveFlatFolders(): ImapFolder[] {
  return [...baseFlatFolders, ...createdFlatFolders]
}

export function getMailboxDemoFolderTree(): ImapFolder[] {
  return nestFolders(getEffectiveFlatFolders())
}

export function addMailboxDemoFolder(folder: ImapFolder): void {
  createdFlatFolders.push(folder)
}

/** Supprime uniquement un dossier créé en session (les dossiers du seed sont protégés). */
export function removeMailboxDemoFolder(path: string): boolean {
  const idx = createdFlatFolders.findIndex((f) => f.path === path)
  if (idx === -1) return false
  createdFlatFolders.splice(idx, 1)
  return true
}
