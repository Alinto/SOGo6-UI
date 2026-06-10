import type { ImapFolder } from '@/features/mails/mails-types'

import { nestImapFolderTree } from '../nest-imap-folders'

function makeFolder(overrides: Partial<ImapFolder> & Pick<ImapFolder, 'name' | 'path'>): ImapFolder {
  return {
    unseen_count: 0,
    messages: 0,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
    ...overrides,
  }
}

describe('nestImapFolderTree', () => {
  it('nests a subfolder under a parent with \\HasNoChildren', () => {
    const flat = [
      makeFolder({ name: 'INBOX', path: 'INBOX', type: 'INBOX' }),
      makeFolder({ name: 'Work', path: 'INBOX/Work' }),
    ]

    const tree = nestImapFolderTree(flat)

    expect(tree).toHaveLength(1)
    expect(tree[0].path).toBe('INBOX')
    expect(tree[0].subfolders?.map((folder) => folder.path)).toEqual(['INBOX/Work'])
  })

  it('does not duplicate children when called repeatedly', () => {
    const flat = [
      makeFolder({ name: 'INBOX', path: 'INBOX' }),
      makeFolder({ name: 'Work', path: 'INBOX/Work' }),
    ]

    const first = nestImapFolderTree(flat)
    const second = nestImapFolderTree(flat)

    expect(first[0].subfolders).toHaveLength(1)
    expect(second[0].subfolders).toHaveLength(1)
  })

  it('keeps orphan subfolders at root when parent is missing', () => {
    const flat = [makeFolder({ name: 'Orphan', path: 'Missing/Orphan' })]

    const tree = nestImapFolderTree(flat)

    expect(tree).toHaveLength(1)
    expect(tree[0].path).toBe('Missing/Orphan')
  })
})
