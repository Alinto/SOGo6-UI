import type { DragEndEvent } from '@dnd-kit/core'
import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'

const mockMailBatchAction = jest.fn()
const mockDispatch = jest.fn()
let mockSelectedIds: string[] = []

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ mailLayout: { selectedMailIds: mockSelectedIds } }),
}))

jest.mock('../../store/mails-api', () => ({
  useMailBatchActionMutation: () => [mockMailBatchAction, { isLoading: false }],
}))

jest.mock('../../store/mail-layout-slice', () => ({
  clearSelectedMails: () => ({ type: 'mailLayout/clearSelectedMails' }),
}))

import { useMailDragEnd } from '../use-mail-drag-end'

function dragEvent(active: unknown, over: unknown): DragEndEvent {
  return {
    active: { data: { current: active } },
    over: over == null ? null : { data: { current: over } },
  } as DragEndEvent
}

const mail = {
  type: 'mail' as const,
  mailId: '1',
  accountId: '0',
  folder: 'INBOX',
  subject: 'Hello',
  from: 'Ada',
  count: 1,
}

describe('useMailDragEnd', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSelectedIds = []
  })

  it('does nothing for a non-mail drag', () => {
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(
          { type: 'contact', contactId: 'c' },
          {
            type: 'folder',
            folderPath: 'Archive',
          }
        )
      )
    })
    expect(mockMailBatchAction).not.toHaveBeenCalled()
  })

  it('moves a single mail to a normal folder', () => {
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(mail, {
          type: 'folder',
          folderPath: 'Archive',
          folderType: 'NORMAL',
        })
      )
    })
    expect(mockMailBatchAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'INBOX',
      uids: ['1'],
      action: 'move',
      data: 'Archive',
    })
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('moves the selection and clears it', () => {
    mockSelectedIds = ['1', '2']
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(mail, {
          type: 'folder',
          folderPath: 'Archive',
          folderType: 'NORMAL',
        })
      )
    })
    expect(mockMailBatchAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'INBOX',
      uids: ['1', '2'],
      action: 'move',
      data: 'Archive',
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'mailLayout/clearSelectedMails',
    })
  })

  it('marks as spam when dropped on junk', () => {
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(mail, {
          type: 'folder',
          folderPath: 'Junk',
          folderType: 'JUNK',
        })
      )
    })
    expect(mockMailBatchAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'INBOX',
      uids: ['1'],
      action: 'spam',
    })
  })

  it('deletes when dropped on trash', () => {
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(mail, {
          type: 'folder',
          folderPath: 'Trash',
          folderType: 'TRASH',
        })
      )
    })
    expect(mockMailBatchAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'INBOX',
      uids: ['1'],
      action: 'delete',
    })
  })

  it('does not move onto the source folder', () => {
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(mail, {
          type: 'folder',
          folderPath: 'INBOX',
          folderType: 'INBOX',
        })
      )
    })
    expect(mockMailBatchAction).not.toHaveBeenCalled()
  })

  it('does not move inbox mail onto Sent', () => {
    const { result } = renderHook(() => useMailDragEnd())
    act(() => {
      result.current(
        dragEvent(
          { ...mail, folderType: 'INBOX' },
          {
            type: 'folder',
            folderPath: 'Sent',
            folderType: 'SENT',
          }
        )
      )
    })
    expect(mockMailBatchAction).not.toHaveBeenCalled()
  })
})
