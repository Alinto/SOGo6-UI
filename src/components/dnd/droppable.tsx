import { useDroppable } from '@dnd-kit/core'
import { useParams } from 'next/navigation'
import React from 'react'

function Droppable({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) {
  const { book_id } = useParams()
  const { isOver, active, setNodeRef } = useDroppable({
    id,
  })

  const isActiveClass = `bg-primary/50 rounded-xl`
  const isOverClass = `hover:bg-primary/70`
  return (
    <div
      ref={setNodeRef}
      className={`${active && book_id !== id ? isActiveClass : 'hover:cursor-no-drop'} ${isOver ? isOverClass : ''}`}
    >
      {children}
    </div>
  )
}

export default Droppable
