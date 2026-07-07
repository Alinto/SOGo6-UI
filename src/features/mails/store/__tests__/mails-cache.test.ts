import type { ImapMessagesBackendResponse } from '../../mails-types'

type QueryArg = {
  accountId?: string
  folder: string
  params?: Record<string, string | number | boolean>
}

const cacheStore = new Map<string, ImapMessagesBackendResponse>()
let cachedArgs: QueryArg[] = []

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    util: {
      selectCachedArgsForQuery: () => cachedArgs,
      updateQueryData: (
        _name: string,
        arg: QueryArg,
        recipe: (draft: ImapMessagesBackendResponse) => void
      ) => {
        const key = JSON.stringify(arg)
        const draft = cacheStore.get(key)
        if (draft) recipe(draft)
        return { type: 'patch', key }
      },
    },
    endpoints: {
      getFolderMessages: {
        select: (arg: QueryArg) => () => ({
          data: cacheStore.get(JSON.stringify(arg)),
        }),
      },
    },
  },
  FOLDER_MESSAGES_SLICE: 'mails/folder-messages',
}))

import {
  isFolderRemovingAction,
  isMailActionSeenFlagToggle,
  normalizeMailActionDataArray,
  removeMailFromAllFolderCaches,
} from '../mails-cache'

describe('mail action predicates', () => {
  it('normalizeMailActionDataArray coerces to array', () => {
    expect(normalizeMailActionDataArray(null)).toEqual([])
    expect(normalizeMailActionDataArray('\\Seen')).toEqual(['\\Seen'])
    expect(normalizeMailActionDataArray(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('isMailActionSeenFlagToggle only matches tag/untag \\Seen', () => {
    expect(isMailActionSeenFlagToggle({ action: 'tag', data: ['\\Seen'] })).toBe(
      true
    )
    expect(
      isMailActionSeenFlagToggle({ action: 'untag', data: ['\\Seen'] })
    ).toBe(true)
    expect(isMailActionSeenFlagToggle({ action: 'tag', data: ['work'] })).toBe(
      false
    )
    expect(isMailActionSeenFlagToggle({ action: 'move', data: 'Archive' })).toBe(
      false
    )
  })

  it('isFolderRemovingAction matches move/spam/ham only', () => {
    expect(isFolderRemovingAction('move')).toBe(true)
    expect(isFolderRemovingAction('spam')).toBe(true)
    expect(isFolderRemovingAction('ham')).toBe(true)
    expect(isFolderRemovingAction('tag')).toBe(false)
    expect(isFolderRemovingAction('copy')).toBe(false)
  })
})

describe('removeMailFromAllFolderCaches', () => {
  const dispatch = jest.fn((action) => ({ ...action, undo: jest.fn() }))

  beforeEach(() => {
    cacheStore.clear()
    dispatch.mockClear()
  })

  it('removes the mail from every cached page and adjusts totals', () => {
    const page1: QueryArg = {
      accountId: '0',
      folder: 'INBOX',
      params: { page_size: 20 },
    }
    cacheStore.set(JSON.stringify(page1), {
      mails: [
        { id: '10' } as never,
        { id: '11' } as never,
        { id: '12' } as never,
      ],
      total: 41,
      page: 1,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    })
    cachedArgs = [page1]

    const patches = removeMailFromAllFolderCaches(
      dispatch as never,
      {} as never,
      { accountId: '0', folder: 'INBOX', mailId: '11' }
    )

    const draft = cacheStore.get(JSON.stringify(page1))!
    expect(draft.mails.map((m) => m.id)).toEqual(['10', '12'])
    expect(draft.total).toBe(40)
    expect(draft.totalPages).toBe(2)
    expect(patches).toHaveLength(1)
  })

  it('ignores caches for other folders/accounts', () => {
    const otherFolder: QueryArg = { accountId: '0', folder: 'Sent' }
    cacheStore.set(JSON.stringify(otherFolder), {
      mails: [{ id: '99' } as never],
      total: 1,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
    cachedArgs = [otherFolder]

    const patches = removeMailFromAllFolderCaches(
      dispatch as never,
      {} as never,
      { accountId: '0', folder: 'INBOX', mailId: '99' }
    )

    expect(cacheStore.get(JSON.stringify(otherFolder))!.mails).toHaveLength(1)
    expect(patches).toHaveLength(0)
  })

  it('is a no-op when the mail is not in the cached page', () => {
    const page1: QueryArg = { accountId: '0', folder: 'INBOX' }
    cacheStore.set(JSON.stringify(page1), {
      mails: [{ id: '1' } as never],
      total: 1,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
    cachedArgs = [page1]

    removeMailFromAllFolderCaches(dispatch as never, {} as never, {
      accountId: '0',
      folder: 'INBOX',
      mailId: 'does-not-exist',
    })

    const draft = cacheStore.get(JSON.stringify(page1))!
    expect(draft.mails).toHaveLength(1)
    expect(draft.total).toBe(1)
  })
})
