import { act, renderHook } from '@testing-library/react'
import type { DragEndEvent } from '@dnd-kit/core'

const mockMoveContact = jest.fn()

jest.mock('../../store/address-books-api', () => ({
  useMoveVCardToAddressBookMutation: () => [
    mockMoveContact,
    { isLoading: false },
  ],
}))

import { useAddressBookDragEnd } from '../use-address-book-drag-end'

function createDragEndEvent(
  activeId: string,
  overId: string | null,
  bookId?: string
): DragEndEvent {
  return {
    active: {
      id: activeId,
      data: { current: bookId ? { bookId } : {} },
    },
    over: overId ? { id: overId } : null,
  } as DragEndEvent
}

describe('useAddressBookDragEnd', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does nothing when drop target is missing', () => {
    const { result } = renderHook(() => useAddressBookDragEnd())

    act(() => {
      result.current(createDragEndEvent('c1', null, 'book-a'))
    })

    expect(mockMoveContact).not.toHaveBeenCalled()
  })

  it('does nothing when active and over ids match', () => {
    const { result } = renderHook(() => useAddressBookDragEnd())

    act(() => {
      result.current(createDragEndEvent('c1', 'c1', 'book-a'))
    })

    expect(mockMoveContact).not.toHaveBeenCalled()
  })

  it('does nothing when source book id is missing', () => {
    const { result } = renderHook(() => useAddressBookDragEnd())

    act(() => {
      result.current(createDragEndEvent('c1', 'book-b'))
    })

    expect(mockMoveContact).not.toHaveBeenCalled()
  })

  it('does nothing when source and target books are the same', () => {
    const { result } = renderHook(() => useAddressBookDragEnd())

    act(() => {
      result.current(createDragEndEvent('c1', 'book-a', 'book-a'))
    })

    expect(mockMoveContact).not.toHaveBeenCalled()
  })

  it('moves contact to another address book on valid drop', () => {
    const { result } = renderHook(() => useAddressBookDragEnd())

    act(() => {
      result.current(createDragEndEvent('c1', 'book-b', 'book-a'))
    })

    expect(mockMoveContact).toHaveBeenCalledWith({
      sourceBookId: 'book-a',
      targetBookId: 'book-b',
      vCardId: 'c1',
    })
  })
})
