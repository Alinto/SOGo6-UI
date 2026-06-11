import { useDraggable } from '@dnd-kit/core'
import React from 'react'

function Draggable({
  children,
  id,
  data,
}: {
  children: React.ReactNode
  id: string
  data?: Record<string, unknown>
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data,
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  )
}
export default Draggable
