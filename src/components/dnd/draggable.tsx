import { useDraggable } from '@dnd-kit/core'
import React from 'react'
import type { AppDragData } from './types'

function Draggable({
  children,
  id,
  data,
  className,
}: {
  children: React.ReactNode
  id: string
  data?: AppDragData
  className?: string
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data,
  })

  return (
    <div ref={setNodeRef} className={className} {...listeners} {...attributes}>
      {children}
    </div>
  )
}
export default Draggable
