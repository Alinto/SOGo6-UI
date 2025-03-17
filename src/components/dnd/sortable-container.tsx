import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { type UseFieldArrayMove } from 'react-hook-form'

interface SortableContainerProps {
  children: React.ReactNode
  items: string[]
  setItem: UseFieldArrayMove
}

function SortableContainer({
  children,
  items,
  setItem,
}: SortableContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id)
      const newIndex = items.indexOf(over.id)
      setItem(oldIndex, newIndex)
    }
  }
}

export default SortableContainer
