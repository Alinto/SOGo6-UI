import { renderHook } from '@testing-library/react'
import type { DragEndEvent } from '@dnd-kit/core'
import { useAddressBookDragEnd } from '../use-address-book-drag-end'

describe('useAddressBookDragEnd', () => {
  it('returns a no-op handler while backend move is unavailable', () => {
    const { result } = renderHook(() => useAddressBookDragEnd())

    expect(() =>
      result.current({
        active: { id: 'c1', data: { current: { bookId: 'book-a' } } },
        over: { id: 'book-b' },
      } as unknown as DragEndEvent)
    ).not.toThrow()
  })
})
