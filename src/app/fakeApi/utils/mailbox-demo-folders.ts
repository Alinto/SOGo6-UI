import type { ImapFolder } from '@/features/mails/mails-types'

import folders from '@/app/fakeApi/mails/folders/folders.json'

import { nestImapFolderTree } from './nest-imap-folders'

const baseFlatFolders = folders as ImapFolder[]

/** Dossiers créés en session (perdus au redémarrage du serveur Next). */
const createdFlatFolders: ImapFolder[] = []

function getEffectiveFlatFolders(): ImapFolder[] {
  return [...baseFlatFolders, ...createdFlatFolders]
}

function findFlatFolderByPath(path: string): ImapFolder | undefined {
  return (
    createdFlatFolders.find((folder) => folder.path === path) ??
    baseFlatFolders.find((folder) => folder.path === path)
  )
}

function markFolderAsHavingChildren(folder: ImapFolder): void {
  if (folder.flags.includes('\\HasNoChildren')) {
    folder.flags = folder.flags.filter((flag) => flag !== '\\HasNoChildren')
  }
  if (!folder.flags.includes('\\HasChildren')) {
    folder.flags.push('\\HasChildren')
  }
}

export function getMailboxDemoFolderTree(): ImapFolder[] {
  return nestImapFolderTree(getEffectiveFlatFolders())
}

export function addMailboxDemoFolder(folder: ImapFolder): void {
  createdFlatFolders.push(folder)

  const parts = folder.path.split(folder.delimiter)
  if (parts.length <= 1) {
    return
  }

  const parentPath = parts.slice(0, -1).join(folder.delimiter)
  const parent = findFlatFolderByPath(parentPath)
  if (parent) {
    markFolderAsHavingChildren(parent)
  }
}

/** Supprime uniquement un dossier créé en session (les dossiers du seed sont protégés). */
export function removeMailboxDemoFolder(path: string): boolean {
  const idx = createdFlatFolders.findIndex((f) => f.path === path)
  if (idx === -1) return false
  createdFlatFolders.splice(idx, 1)
  return true
}

function folderPathExists(path: string): boolean {
  return getEffectiveFlatFolders().some((folder) => folder.path === path)
}

/** Renomme ou déplace un dossier (seed ou créé en session). */
export function updateMailboxDemoFolder(
  oldPath: string,
  updates: { name?: string; type?: string }
): ImapFolder | null {
  const folder =
    findFlatFolderByPath(oldPath) ??
    createdFlatFolders.find((item) => item.path === oldPath)

  if (!folder) return null

  if (updates.type) {
    folder.type = updates.type as ImapFolder['type']
  }

  if (updates.name) {
    const newPath = updates.name.includes(folder.delimiter)
      ? updates.name
      : (() => {
          const parts = oldPath.split(folder.delimiter)
          parts[parts.length - 1] = updates.name!
          return parts.join(folder.delimiter)
        })()

    if (newPath !== oldPath) {
      if (folderPathExists(newPath) && newPath !== oldPath) {
        return null
      }

      const childPrefix = `${oldPath}${folder.delimiter}`
      for (const child of [...baseFlatFolders, ...createdFlatFolders]) {
        if (child.path.startsWith(childPrefix)) {
          child.path = newPath + child.path.slice(oldPath.length)
          const childParts = child.path.split(child.delimiter)
          child.name = childParts[childParts.length - 1] ?? child.name
        }
      }

      folder.path = newPath
      const pathParts = newPath.split(folder.delimiter)
      folder.name = pathParts[pathParts.length - 1] ?? folder.name
    }
  }

  return folder
}

/** Renomme uniquement un dossier créé en session (les dossiers du seed sont protégés). */
export function renameMailboxDemoFolder(
  oldPath: string,
  newName: string
): ImapFolder | null {
  return updateMailboxDemoFolder(oldPath, { name: newName })
}
