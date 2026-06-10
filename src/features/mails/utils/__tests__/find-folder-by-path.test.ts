import type { ImapFolder } from '../../mails-types'
import {
  findFolderByPath,
  isJunkFolderPath,
  isTrashFolderPath,
} from '../find-folder-by-path'

const tree: ImapFolder[] = [
  {
    name: 'INBOX',
    path: 'INBOX',
    type: 'INBOX',
    unseen_count: 0,
    messages: 1,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
    subfolders: [
      {
        name: 'Work',
        path: 'INBOX/Work',
        type: 'NORMAL',
        unseen_count: 0,
        messages: 0,
        flags: [],
        delimiter: '/',
        readOnly: false,
        selectable: true,
      },
    ],
  },
  {
    name: 'Junk',
    path: 'Junk',
    type: 'JUNK',
    unseen_count: 0,
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
]

describe('findFolderByPath', () => {
  it('finds top-level folder by path', () => {
    expect(findFolderByPath(tree, 'Junk')?.type).toBe('JUNK')
  })

  it('finds nested folder', () => {
    expect(findFolderByPath(tree, 'INBOX/Work')?.name).toBe('Work')
  })

  it('returns undefined when not found', () => {
    expect(findFolderByPath(tree, 'Missing')).toBeUndefined()
  })
})

describe('isJunkFolderPath', () => {
  it('detects junk via folder type', () => {
    const junk = findFolderByPath(tree, 'Junk')
    expect(isJunkFolderPath('Junk', junk)).toBe(true)
  })

  it('falls back to path string', () => {
    expect(isJunkFolderPath('junk')).toBe(true)
  })
})

describe('isTrashFolderPath', () => {
  it('detects trash via path string', () => {
    expect(isTrashFolderPath('Trash')).toBe(true)
  })
})
