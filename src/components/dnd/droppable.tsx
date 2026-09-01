import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import type { AppDragData } from './types'

function Droppable({
  children,
  id,
  data,
  disabled = false,
  className,
  isOverClassName,
  dataDrop,
}: {
  children: React.ReactNode
  id: string
  data?: AppDragData
  disabled?: boolean
  className?: string
  isOverClassName?: string
  dataDrop?: string
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      data-over={isOver && !disabled ? 'true' : undefined}
      data-drop={dataDrop}
      className={cn(isOver && !disabled && isOverClassName, className)}
    >
      {children}
    </div>
  )
}

export default Droppable
