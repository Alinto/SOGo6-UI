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
