import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

export function SortableItem({ children, id }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(children as React.ReactElement, {
        attributes,
        listeners,
      })}
    </div>
  )
}

export default SortableItem
