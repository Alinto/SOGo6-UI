import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import type { ImapFolder } from '../../mails-types'

const mockMailBatchAction = jest.fn()
const mockUseGetFoldersQuery = jest.fn()

jest.mock('../../store/mails-api', () => ({
  useGetFoldersQuery: (...args: unknown[]) => mockUseGetFoldersQuery(...args),
  useMailBatchActionMutation: jest.fn(() => [
    mockMailBatchAction,
    { isLoading: false },
  ]),
}))

import { useMailBatchActions } from '../use-mail-batch-actions'

const folders: ImapFolder[] = [
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
  },
  {
    name: 'Archive',
    path: 'Archive',
    type: 'NORMAL',
    unseen_count: 0,
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
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

const defaultArgs = {
  accountId: '0',
  folder: 'INBOX',
}

describe('useMailBatchActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetFoldersQuery.mockReturnValue({ data: folders })
    mockMailBatchAction.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  describe('configuration', () => {
    it('detects junk folder state', () => {
      const { result } = renderHook(() =>
        useMailBatchActions({ ...defaultArgs, folder: 'Junk' })
      )
      expect(result.current.isJunk).toBe(true)
    })
  })

  describe('batchDelete', () => {
    it('sends a delete batch action for the given ids', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchDelete(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith({
        accountId: '0',
        folders: { INBOX: ['1', '2'] },
        action: 'delete',
        data: undefined,
      })
    })

    it('does nothing when no ids are given', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchDelete([])
      })
      expect(mockMailBatchAction).not.toHaveBeenCalled()
    })

    it('groups ids by their source folder in a single request when the selection spans multiple folders (e.g. search results)', async () => {
      const { result } = renderHook(() =>
        useMailBatchActions({
          ...defaultArgs,
          folderById: { '1': 'INBOX', '2': 'Trash', '3': 'INBOX' },
        })
      )
      await act(async () => {
        await result.current.batchDelete(['1', '2', '3'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledTimes(1)
      expect(mockMailBatchAction).toHaveBeenCalledWith({
        accountId: '0',
        folders: { INBOX: ['1', '3'], Trash: ['2'] },
        action: 'delete',
        data: undefined,
      })
    })
  })

  describe('batchMarkRead and batchMarkUnread', () => {
    it('tags \\Seen for read', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchMarkRead(['1'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'tag', data: ['\\Seen'] })
      )
    })

    it('untags \\Seen for unread', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchMarkUnread(['1'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'untag', data: ['\\Seen'] })
      )
    })
  })

  describe('batchSpam and batchHam', () => {
    it('marks the given ids as spam', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchSpam(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'spam',
        })
      )
    })

    it('marks the given ids as ham', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchHam(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'ham',
        })
      )
    })
  })

  describe('batchToggleSpam', () => {
    it('splits a cross-folder selection: hams mails already in Junk, spams the rest', async () => {
      const { result } = renderHook(() =>
        useMailBatchActions({
          ...defaultArgs,
          folder: 'INBOX',
          folderById: { '1': 'INBOX', '2': 'Junk', '3': 'INBOX' },
        })
      )
      await act(async () => {
        await result.current.batchToggleSpam(['1', '2', '3'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledTimes(2)
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { Junk: ['2'] },
          action: 'ham',
        })
      )
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '3'] },
          action: 'spam',
        })
      )
    })

    it('spams everything when browsing a non-junk folder with no folderById override', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchToggleSpam(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledTimes(1)
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'spam',
        })
      )
    })

    it('hams everything when browsing the Junk folder with no folderById override', async () => {
      const { result } = renderHook(() =>
        useMailBatchActions({ ...defaultArgs, folder: 'Junk' })
      )
      await act(async () => {
        await result.current.batchToggleSpam(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledTimes(1)
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { Junk: ['1', '2'] },
          action: 'ham',
        })
      )
    })
  })

  describe('batchMarkImportant', () => {
    it('tags \\Flagged for the given ids', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchMarkImportant(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'tag',
          data: ['\\Flagged'],
        })
      )
    })
  })

  describe('batchRemoveImportant', () => {
    it('untags \\Flagged for the given ids', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchRemoveImportant(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'untag',
          data: ['\\Flagged'],
        })
      )
    })
  })

  describe('batchPhishing and batchIllegal', () => {
    it('reports the given ids as phishing', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchPhishing(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'phishing',
        })
      )
    })

    it('reports the given ids as illegal content', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchIllegal(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'illegal',
        })
      )
    })
  })

  describe('batchMove and batchCopy', () => {
    it('moves the given ids to the destination', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchMove(['1'], 'Projects')
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'move', data: 'Projects' })
      )
    })

    it('copies the given ids to the destination', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchCopy(['1'], 'Projects')
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'copy', data: 'Projects' })
      )
    })
  })

  describe('batchApplyLabels', () => {
    it('tags the given ids with the selected labels', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchApplyLabels(['1', '2'], ['Work', 'Urgent'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'tag',
          data: ['Work', 'Urgent'],
        })
      )
    })
  })

  describe('batchRemoveLabels', () => {
    it('untags the given ids with the selected labels', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchRemoveLabels(['1', '2'], ['Work'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          folders: { INBOX: ['1', '2'] },
          action: 'untag',
          data: ['Work'],
        })
      )
    })
  })
})
