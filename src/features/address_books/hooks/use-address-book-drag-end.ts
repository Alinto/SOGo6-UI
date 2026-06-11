'use client'

import { useMoveVCardToAddressBookMutation } from '@/features/address_books/store/address-books-api'
import type { DragEndEvent } from '@dnd-kit/core'
import { useCallback } from 'react'

export function useAddressBookDragEnd() {
  const [moveContact] = useMoveVCardToAddressBookMutation()

  return useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const sourceBookId = active.data.current?.bookId as string | undefined
      const contactId = String(active.id)
      const targetBookId = String(over.id)

      if (!sourceBookId || sourceBookId === targetBookId) return

      try {
        void moveContact({
          sourceBookId,
          targetBookId,
          vCardId: contactId,
        })
      } catch {
        // Error toast handled by RTK mutation onQueryStarted
      }
    },
    [moveContact]
  )
}
