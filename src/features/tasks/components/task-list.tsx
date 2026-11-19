'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Calendar } from '@/features/calendars/calendars-types'
import type { Task } from '@/features/tasks/tasks-types'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import TaskEmptyState from './task-empty-state'
import TaskItem from './task-item'

type TaskListProps = {
  tasks: Task[]
  calendars: Calendar[]
  isLoading: boolean
  /** The task request failed: show an error, never the empty state. */
  isError?: boolean
  onRetry?: () => void
  onToggleComplete: (task: Task) => Promise<void>
  onEdit: (taskKey: string) => void
  onDelete: (taskKey: string) => void
  onCreateClick: () => void
  selectionMode?: boolean
  selectedTaskKeys?: string[]
  onToggleSelection?: (taskKey: string) => void
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

function TaskListError({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations('TASKS')

  return (
    <div
      role="alert"
      data-testid="tasks-error-state"
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <AlertCircle className="text-destructive h-12 w-12 opacity-60" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('load_error.title.string')}</p>
        <p className="text-muted-foreground max-w-sm text-xs">
          {t('load_error.description.string')}
        </p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          {t('load_error.retry.string')}
        </Button>
      )}
    </div>
  )
}

function TaskList({
  tasks,
  calendars,
  isLoading,
  isError = false,
  onRetry,
  onToggleComplete,
  onEdit,
  onDelete,
  onCreateClick,
  selectionMode = false,
  selectedTaskKeys = [],
  onToggleSelection,
}: TaskListProps) {
  if (isLoading) {
    return <TaskListSkeleton />
  }

  if (isError) {
    return <TaskListError onRetry={onRetry} />
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
            selectionMode={selectionMode}
            isSelected={selectedTaskKeys.includes(key)}
            onToggleSelection={onToggleSelection}
          />
        )
      })}
    </ul>
  )
}

export default memo(TaskList)
