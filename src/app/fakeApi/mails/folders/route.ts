import { ImapFolder } from '@/features/mails/mails-types'
import { NextResponse } from 'next/server'

const data = [
  {
    name: 'INBOX',
    path: 'INBOX',
    unseen: 3,
    messages: 150,
    flags: ['\\HasNoChildren', '\\Inbox'],
    delimiter: '/',
    readOnly: true,
    selectable: true,
  },
  {
    name: 'Sent',
    path: 'Sent',
    unseen: 0,
    messages: 150,
    flags: ['\\HasNoChildren', '\\Sent'],
    delimiter: '/',
    readOnly: true,
    selectable: false,
  },
  {
    name: 'Drafts',
    path: 'Drafts',
    unseen: 0,
    messages: 150,
    flags: ['\\HasNoChildren', '\\Drafts'],
    delimiter: '/',
    readOnly: true,
    selectable: false,
  },
  {
    name: 'Trash',
    path: 'Trash',
    unseen: 0,
    messages: 150,
    flags: ['\\HasNoChildren', '\\Trash'],
    delimiter: '/',
    readOnly: true,
    selectable: false,
  },
  {
    name: 'Junk',
    path: 'Junk',
    unseen: 0,
    messages: 150,
    flags: ['\\HasNoChildren', '\\Junk'],
    delimiter: '/',
    readOnly: true,
    selectable: false,
  },
  {
    name: 'Archive',
    path: 'Archive',
    unseen: 0,
    messages: 150,
    flags: ['\\HasNoChildren', '\\Archive'],
    delimiter: '/',
    readOnly: true,
    selectable: false,
  },
  {
    name: 'Projects',
    path: 'Projects',
    unseen: 0,
    messages: 0,
    flags: ['\\HasChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: '2024',
    path: 'Projects/2024',
    unseen: 1,
    messages: 20,
    flags: ['\\HasChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'Frontend',
    path: 'Projects/2024/Frontend',
    unseen: 0,
    messages: 5,
    flags: ['\\HasChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'React',
    path: 'Projects/2024/Frontend/React',
    unseen: 0,
    messages: 2,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'Backend',
    path: 'Projects/2024/Backend',
    unseen: 0,
    messages: 3,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: '2023',
    path: 'Projects/2023',
    unseen: 0,
    messages: 10,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'Personal',
    path: 'Personal',
    unseen: 0,
    messages: 0,
    flags: ['\\HasChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'Receipts',
    path: 'Personal/Receipts',
    unseen: 1,
    messages: 12,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'Travel',
    path: 'Personal/Travel',
    unseen: 0,
    messages: 5,
    flags: ['\\HasChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: '2024',
    path: 'Personal/Travel/2024',
    unseen: 0,
    messages: 2,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
]

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
