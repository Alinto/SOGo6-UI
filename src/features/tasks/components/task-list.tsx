'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { Calendar } from '@/features/calendars/calendars-types'
import type { Task } from '@/features/tasks/tasks-types'
import TaskEmptyState from './task-empty-state'
import TaskItem from './task-item'
import { memo } from 'react'

type TaskListProps = {
  tasks: Task[]
  calendars: Calendar[]
  isLoading: boolean
  onToggleComplete: (task: Task) => Promise<void>
  onEdit: (taskKey: string) => void
  onDelete: (taskKey: string) => void
  onCreateClick: () => void
}

function TaskListSkeleton() {
  return (
    <ul className="space-y-2" data-testid="tasks-list-skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="rounded-lg border p-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </li>
      ))}
    </ul>
  )
}

function TaskList({
  tasks,
  calendars,
  isLoading,
  onToggleComplete,
  onEdit,
  onDelete,
  onCreateClick,
}: TaskListProps) {
  if (isLoading) {
    return <TaskListSkeleton />
  }

  if (tasks.length === 0) {
    return <TaskEmptyState onCreateClick={onCreateClick} />
  }

  return (
    <ul className="space-y-2" data-testid="tasks-list">
      {tasks.map((task) => {
        const key = task.key ?? task.id ?? ''
        return (
          <TaskItem
            key={key}
            task={task}
            calendars={calendars}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </ul>
  )
}

export default memo(TaskList)
