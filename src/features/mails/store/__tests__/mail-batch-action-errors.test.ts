import { configureStore, type Middleware } from '@reduxjs/toolkit'

const mockBaseQuery = jest.fn()

// Replace the real apiSlice (env lookup, auth, semaphore) with one backed by a mocked base query.
jest.mock('@/lib/redux/api/api-slice', () => {
  const actual = jest.requireActual('@/lib/redux/api/api-slice')
  const { createApi } = jest.requireActual('@reduxjs/toolkit/query/react')
  return {
    ...actual,
    apiSlice: createApi({
      reducerPath: 'api',
      tagTypes: [
        actual.FOLDER_MESSAGES_SLICE,
        actual.SEARCH_MAILS_SLICE,
        actual.MAILS_FOLDERS_SLICE,
        actual.MAIL_SLICE,
      ],
      baseQuery: (...args: unknown[]) => mockBaseQuery(...args),
      endpoints: () => ({}),
    }),
  }
})

// One optimistic patch per folder, so the test can see which folders get restored.
const mockUndo: Record<string, jest.Mock> = {}
const patchFor = (folder: string) => {
  mockUndo[folder] = jest.fn()
  return [{ undo: mockUndo[folder] }]
}
jest.mock('../mails-cache', () => ({
  ...jest.requireActual('../mails-cache'),
  removeMailsFromAllFolderCaches: (
    _dispatch: unknown,
    _state: unknown,
    arg: { folder: string }
  ) => patchFor(arg.folder),
  dispatchSeenPatchOnAllFolderMessageCachesBatch: (
    _dispatch: unknown,
    _state: unknown,
    arg: { folder: string }
  ) => patchFor(arg.folder),
}))

import { apiSlice } from '@/lib/redux/api/api-slice'
import '../mails-api'

type Initiate = (arg: unknown) => unknown
const endpoints = apiSlice.endpoints as unknown as Record<
  string,
  { initiate: Initiate }
>

type Notification = { type: string; title: string; details?: string }

function setup() {
  const notifications: Notification[] = []
  const capture: Middleware = () => (next) => (action) => {
    const typed = action as { type?: string; payload?: Notification }
    if (typed.type?.endsWith('addNotification') && typed.payload) {
      notifications.push(typed.payload)
    }
    return next(action)
  }
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false })
        .concat(apiSlice.middleware)
        .concat(capture),
  })
  return { store, notifications }
}

const serverReply = (errors: Record<string, string>) => ({
  data: {
    data: { action: 'delete', results: {}, errors },
    error_code: 0,
    error_msg: '',
  },
})

const deleteFromTwoFolders = {
  accountId: '0',
  folders: { INBOX: ['1'], Shared: ['2'] },
  action: 'delete',
}

describe('mailBatchAction per-folder errors', () => {
  beforeEach(() => {
    mockBaseQuery.mockReset()
    Object.keys(mockUndo).forEach((key) => delete mockUndo[key])
  })

  it('keeps the success toast when every folder succeeded', async () => {
    mockBaseQuery.mockResolvedValue(serverReply({}))
    const { store, notifications } = setup()

    await store.dispatch(
      endpoints.mailBatchAction.initiate(deleteFromTwoFolders) as never
    )

    expect(mockUndo.INBOX).not.toHaveBeenCalled()
    expect(mockUndo.Shared).not.toHaveBeenCalled()
    expect(notifications).toEqual([
      expect.objectContaining({
        type: 'success',
        title: 'mail_action.bulk_delete.successTitle.string',
      }),
    ])
  })

  it('restores only the failed folders and warns instead of reporting success', async () => {
    mockBaseQuery.mockResolvedValue(serverReply({ Shared: 'S000403' }))
    const { store, notifications } = setup()

    await store.dispatch(
      endpoints.mailBatchAction.initiate(deleteFromTwoFolders) as never
    )

    expect(mockUndo.Shared).toHaveBeenCalledTimes(1)
    expect(mockUndo.INBOX).not.toHaveBeenCalled()
    expect(notifications).toEqual([
      expect.objectContaining({
        type: 'info',
        title: 'mail_action.bulk_partial.title.string',
        details: 'Shared',
      }),
    ])
  })

  it('shows the error toast when every folder failed', async () => {
    mockBaseQuery.mockResolvedValue(
      serverReply({ INBOX: 'S000500', Shared: 'S000403' })
    )
    const { store, notifications } = setup()

    await store.dispatch(
      endpoints.mailBatchAction.initiate(deleteFromTwoFolders) as never
    )

    expect(mockUndo.INBOX).toHaveBeenCalledTimes(1)
    expect(mockUndo.Shared).toHaveBeenCalledTimes(1)
    expect(notifications).toEqual([
      expect.objectContaining({
        type: 'error',
        title: 'mail_action.bulk_delete.errorTitle.string',
      }),
    ])
  })

  it('restores every folder when the request itself fails', async () => {
    mockBaseQuery.mockResolvedValue({
      error: { status: 500, data: { error_code: 'S000001' } },
    })
    const { store, notifications } = setup()

    await store.dispatch(
      endpoints.mailBatchAction.initiate(deleteFromTwoFolders) as never
    )

    expect(mockUndo.INBOX).toHaveBeenCalledTimes(1)
    expect(mockUndo.Shared).toHaveBeenCalledTimes(1)
    expect(notifications).toEqual([expect.objectContaining({ type: 'error' })])
  })

  it('restores the read state of a folder that failed to be marked read', async () => {
    mockBaseQuery.mockResolvedValue(serverReply({ Shared: 'S000403' }))
    const { store, notifications } = setup()

    await store.dispatch(
      endpoints.mailBatchAction.initiate({
        accountId: '0',
        folders: { INBOX: ['1'], Shared: ['2'] },
        action: 'tag',
        data: ['\\Seen'],
      }) as never
    )

    expect(mockUndo.Shared).toHaveBeenCalledTimes(1)
    expect(mockUndo.INBOX).not.toHaveBeenCalled()
    expect(notifications).toEqual([
      expect.objectContaining({
        title: 'mail_action.bulk_partial.title.string',
      }),
    ])
  })
})
