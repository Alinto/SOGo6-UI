import { useDraggable } from '@dnd-kit/core'
import React from 'react'

function Draggable({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id,
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  )
}
export default Draggable
