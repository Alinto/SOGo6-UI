'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import { useCallback } from 'react'

/** Drag-and-drop move between address books is not supported by the backend yet. */
export function useAddressBookDragEnd() {
  return useCallback((_event: DragEndEvent) => {
    return undefined
  }, [])
}
