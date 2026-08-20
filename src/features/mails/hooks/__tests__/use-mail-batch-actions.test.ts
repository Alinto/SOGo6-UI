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
    it('exposes archive destination from folder tree', () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      expect(result.current.archiveDestination).toBe('Archive')
    })

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
        folder: 'INBOX',
        uids: ['1', '2'],
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
  })

  describe('batchArchive', () => {
    it('moves the given ids to the archive folder', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchArchive(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({
          uids: ['1', '2'],
          action: 'move',
          data: 'Archive',
        })
      )
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
        expect.objectContaining({ uids: ['1', '2'], action: 'spam' })
      )
    })

    it('marks the given ids as ham', async () => {
      const { result } = renderHook(() => useMailBatchActions(defaultArgs))
      await act(async () => {
        await result.current.batchHam(['1', '2'])
      })
      expect(mockMailBatchAction).toHaveBeenCalledWith(
        expect.objectContaining({ uids: ['1', '2'], action: 'ham' })
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
          uids: ['1', '2'],
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
          uids: ['1', '2'],
          action: 'untag',
          data: ['Work'],
        })
      )
    })
  })
})
