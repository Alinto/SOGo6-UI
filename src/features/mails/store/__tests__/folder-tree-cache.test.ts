import type { ImapFolder } from '../../mails-types'

const mockSelectCachedArgs = jest.fn()
const mockUpdateQueryData = jest.fn()
const mockInitiate = jest.fn()
const mockInvalidateTags = jest.fn((tags: string[]) => ({
  type: 'invalidate',
  tags,
}))

jest.mock('@/lib/redux/api/api-slice', () => ({
  MAILS_FOLDERS_SLICE: 'mails/folders',
  apiSlice: {
    util: {
      invalidateTags: (tags: string[]) => mockInvalidateTags(tags),
      selectCachedArgsForQuery: (...args: unknown[]) =>
        mockSelectCachedArgs(...args),
      updateQueryData: (...args: unknown[]) => mockUpdateQueryData(...args),
    },
    endpoints: {
      getFolder: {
        initiate: (...args: unknown[]) => mockInitiate(...args),
      },
    },
  },
}))

import {
  refreshFolderUnseenCount,
  setFolderUnseenCount,
} from '../folder-tree-cache'

const folder = (path: string, extra: Partial<ImapFolder> = {}): ImapFolder => ({
  name: path.split('/').pop() ?? path,
  path,
  unseen_count: 4,
  messages: 10,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: true,
  ...extra,
})

describe('setFolderUnseenCount', () => {
  it('updates a nested folder', () => {
    const tree = [
      folder('INBOX', { subfolders: [folder('INBOX/Work')] }),
      folder('Trash'),
    ]
    expect(setFolderUnseenCount(tree, 'INBOX/Work', 0)).toBe(true)
    expect(tree[0].subfolders?.[0].unseen_count).toBe(0)
    expect(tree[0].unseen_count).toBe(4)
  })

  it('reports a missing folder', () => {
    const tree = [folder('INBOX')]
    expect(setFolderUnseenCount(tree, 'Archive', 0)).toBe(false)
    expect(tree[0].unseen_count).toBe(4)
  })
})

describe('refreshFolderUnseenCount', () => {
  beforeEach(() => jest.clearAllMocks())

  it('patches the trees cached for the same mailbox only', async () => {
    const dispatch = jest.fn((action: unknown) => action)
    mockInitiate.mockReturnValue({
      unwrap: () => Promise.resolve(folder('INBOX', { unseen_count: 0 })),
    })
    mockSelectCachedArgs.mockReturnValue([
      { accountId: '0' },
      { accountId: '1' },
      undefined,
    ])
    mockUpdateQueryData.mockImplementation(
      (_name: string, arg: unknown, recipe: (d: ImapFolder[]) => void) => ({
        type: 'patch',
        arg,
        recipe,
      })
    )

    await refreshFolderUnseenCount(dispatch, () => ({}), {
      accountId: '0',
      folderPath: 'INBOX',
    })

    expect(mockInitiate).toHaveBeenCalledWith(
      { accountId: '0', folderPath: 'INBOX' },
      { subscribe: false, forceRefetch: true }
    )
    const patchedArgs = mockUpdateQueryData.mock.calls.map((call) => call[1])
    expect(patchedArgs).toEqual([{ accountId: '0' }, undefined])

    const draft = [folder('INBOX')]
    mockUpdateQueryData.mock.calls[0][2](draft)
    expect(draft[0].unseen_count).toBe(0)
  })

  it('reloads the whole tree when the folder request fails', async () => {
    const dispatch = jest.fn((action: unknown) => action)
    mockInitiate.mockReturnValue({
      unwrap: () => Promise.reject(new Error('boom')),
    })

    await refreshFolderUnseenCount(dispatch, () => ({}), {
      accountId: '0',
      folderPath: 'INBOX',
    })

    expect(mockUpdateQueryData).not.toHaveBeenCalled()
    expect(mockInvalidateTags).toHaveBeenCalledWith(['mails/folders'])
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'invalidate',
      tags: ['mails/folders'],
    })
  })
})
