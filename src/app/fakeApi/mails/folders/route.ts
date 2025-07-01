import { ImapFolder } from '@/features/mails/mails-types'
import { NextResponse } from 'next/server'

import folders from './folders.json'

const data = folders as ImapFolder[]

function nestFolders(flatFolders: ImapFolder[]) {
  const folderMap: Record<string, ImapFolder> = {}
  const roots: ImapFolder[] = []

  // First, create a map of all folders
  flatFolders.forEach((folder) => {
    // Only add subfolders array if folder has \HasChildren flag
    if (folder.flags.includes('\\HasChildren')) {
      folder.subfolders = []
    }
    folderMap[folder.path] = folder
  })

  // Sort folders: special folders first, then alphabetically by name
  const specialOrder = ['INBOX', 'Drafts', 'Sent', 'Trash', 'Junk', 'Archive']
  flatFolders.sort((a, b) => {
    const aIdx = specialOrder.indexOf(a.name)
    const bIdx = specialOrder.indexOf(b.name)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return a.name.localeCompare(b.name)
  })

  // Then, assign subfolders to their parent
  flatFolders.forEach((folder) => {
    const parts = folder.path.split(folder.delimiter)
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join(folder.delimiter)
      if (
        folderMap[parentPath] &&
        Array.isArray(folderMap[parentPath].subfolders)
      ) {
        folderMap[parentPath].subfolders.push(folder)
      } else {
        roots.push(folder)
      }
    } else {
      roots.push(folder)
    }
  })

  // Remove duplicates in roots
  return roots.filter(
    (folder, idx, arr) => arr.findIndex((f) => f.path === folder.path) === idx
  )
}

export async function GET() {
  const nestedFolders: ImapFolder[] = nestFolders(data)
  return NextResponse.json(nestedFolders)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
