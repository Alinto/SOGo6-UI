import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import type { ImapFolder } from '../../mails-types'

const mockMoveToTrash = jest.fn()
const mockMailAction = jest.fn()
const mockUseGetFoldersQuery = jest.fn()

jest.mock('../../store/mails-api', () => ({
  useGetFoldersQuery: (...args: unknown[]) => mockUseGetFoldersQuery(...args),
  useMoveToTrashMutation: jest.fn(() => [
    mockMoveToTrash,
    { isLoading: false },
  ]),
  useMailActionMutation: jest.fn(() => [mockMailAction, { isLoading: false }]),
}))

import { useMailItemActions } from '../use-mail-item-actions'

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
  mailId: '42',
  seen: true,
}

describe('useMailItemActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetFoldersQuery.mockReturnValue({ data: folders })
    mockMoveToTrash.mockReturnValue({ unwrap: () => Promise.resolve() })
    mockMailAction.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  describe('configuration', () => {
    it('exposes archive destination from folder tree', () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      expect(result.current.archiveDestination).toBe('Archive')
    })

    it('detects junk and trash folder state', () => {
      const { result: inbox } = renderHook(() =>
        useMailItemActions(defaultArgs)
      )
      expect(inbox.current.isJunk).toBe(false)
      expect(inbox.current.isTrash).toBe(false)

      const { result: junk } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, folder: 'Junk' })
      )
      expect(junk.current.isJunk).toBe(true)
    })
  })

  describe('deleteMail', () => {
    it('moves mail to trash and calls onRemoved', async () => {
      const onRemoved = jest.fn()
      const { result } = renderHook(() =>
        useMailItemActions({
          ...defaultArgs,
          onRemoved,
        })
      )

      await act(async () => {
        await result.current.deleteMail()
      })

      expect(mockMoveToTrash).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
      })
      expect(onRemoved).toHaveBeenCalledWith()
    })

    it('does nothing when mail id is missing', async () => {
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, mailId: undefined })
      )
      await act(async () => {
        await result.current.deleteMail()
      })
      expect(mockMoveToTrash).not.toHaveBeenCalled()
    })
  })

  describe('markUnread', () => {
    it('untags seen flag when mail is read', async () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      await act(async () => {
        await result.current.markUnread()
      })
      expect(mockMailAction).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
        action: 'untag',
        data: ['\\Seen'],
      })
    })

    it('calls onRemoved after marking unread', async () => {
      const onRemoved = jest.fn()
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, onRemoved })
      )
      await act(async () => {
        await result.current.markUnread()
      })
      expect(onRemoved).toHaveBeenCalledWith()
    })

    it('skips when mail is already unread', async () => {
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, seen: false })
      )
      await act(async () => {
        await result.current.markUnread()
      })
      expect(mockMailAction).not.toHaveBeenCalled()
    })
  })

  describe('toggleRead', () => {
    it('untags when currently seen', async () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      await act(async () => {
        await result.current.toggleRead('42', true)
      })
      expect(mockMailAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'untag', data: ['\\Seen'] })
      )
    })

    it('tags when currently unseen', async () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      await act(async () => {
        await result.current.toggleRead('42', false)
      })
      expect(mockMailAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'tag', data: ['\\Seen'] })
      )
    })
  })

  describe('markSpam and markHam', () => {
    it('marks mail as spam', async () => {
      const onRemoved = jest.fn()
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, onRemoved })
      )
      await act(async () => {
        await result.current.markSpam()
      })
      expect(mockMailAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'spam', mailId: '42' })
      )
      expect(onRemoved).toHaveBeenCalled()
    })

    it('marks mail as ham', async () => {
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, folder: 'Junk' })
      )
      await act(async () => {
        await result.current.markHam()
      })
      expect(mockMailAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ham', mailId: '42' })
      )
    })
  })

  describe('archiveMail', () => {
    it('moves mail to archive destination', async () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      await act(async () => {
        await result.current.archiveMail()
      })
      expect(mockMailAction).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
        action: 'move',
        data: 'Archive',
      })
    })
  })

  describe('moveMail', () => {
    it('moves mail to the given destination and calls onRemoved', async () => {
      const onRemoved = jest.fn()
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, onRemoved })
      )
      await act(async () => {
        await result.current.moveMail('Archive/Projects')
      })
      expect(mockMailAction).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
        action: 'move',
        data: 'Archive/Projects',
      })
      expect(onRemoved).toHaveBeenCalledWith()
    })
  })

  describe('copyMail', () => {
    it('copies mail to the given destination without calling onRemoved', async () => {
      const onRemoved = jest.fn()
      const { result } = renderHook(() =>
        useMailItemActions({ ...defaultArgs, onRemoved })
      )
      await act(async () => {
        await result.current.copyMail('Archive/Projects')
      })
      expect(mockMailAction).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
        action: 'copy',
        data: 'Archive/Projects',
      })
      expect(onRemoved).not.toHaveBeenCalled()
    })
  })

  describe('applyLabel and removeLabel', () => {
    it('tags mail with label', async () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      await act(async () => {
        await result.current.applyLabel('$label1')
      })
      expect(mockMailAction).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
        action: 'tag',
        data: ['$label1'],
      })
    })

    it('untags mail label', async () => {
      const { result } = renderHook(() => useMailItemActions(defaultArgs))
      await act(async () => {
        await result.current.removeLabel('$label1')
      })
      expect(mockMailAction).toHaveBeenCalledWith({
        accountId: '0',
        folder: 'INBOX',
        mailId: '42',
        action: 'untag',
        data: ['$label1'],
      })
    })
  })
})
