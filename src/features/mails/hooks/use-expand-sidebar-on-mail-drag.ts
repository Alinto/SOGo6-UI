'use client'

import { isMailDragData } from '@/components/dnd/types'
import { useSidebar } from '@/components/ui/sidebar'
import { useDndContext } from '@dnd-kit/core'
import { useEffect, useRef } from 'react'

/** Expand the icon-rail sidebar while a mail is dragged, then restore. */
export function useExpandSidebarOnMailDrag() {
  const { active } = useDndContext()
  const { open, setOpen } = useSidebar()
  const wasOpenRef = useRef<boolean | null>(null)
  const isMailDrag = isMailDragData(active?.data.current)

  useEffect(() => {
    if (isMailDrag) {
      if (wasOpenRef.current === null) {
        wasOpenRef.current = open
      }
      if (!open) setOpen(true)
      return
    }

    if (wasOpenRef.current !== null) {
      setOpen(wasOpenRef.current)
      wasOpenRef.current = null
    }
  }, [isMailDrag, open, setOpen])
}
