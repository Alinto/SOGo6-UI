import { cn } from '@/lib/utils'
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
  const isNoDrop = active && book_id === id

  return (
    <div
      ref={setNodeRef}
      className={cn(
        active && book_id !== id && isActiveClass,
        isNoDrop && 'hover:cursor-no-drop',
        isOver && isOverClass
      )}
    >
      {children}
    </div>
  )
}

export default Droppable
