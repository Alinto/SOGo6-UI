'use client'

import { Button } from '@/components/ui/button'
import type { Calendar } from '@/features/calendars/calendars-types'
import TaskCompleteCheckbox from '@/features/tasks/components/task-complete-checkbox'
import TaskProgressBar from '@/features/tasks/components/task-progress-bar'
import type { Task } from '@/features/tasks/tasks-types'
import { isTaskOverdue } from '@/features/tasks/utils/task-due'
import { getDisplayTaskProgress } from '@/features/tasks/utils/task-progress'
import {
  getPriorityBadgeClassName,
  getPriorityLevel,
} from '@/features/tasks/utils/task-priority'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useMemo } from 'react'

type TaskItemProps = {
  task: Task
  calendars: Calendar[]
  onToggleComplete: (task: Task) => Promise<void>
  onEdit: (taskKey: string) => void
  onDelete: (taskKey: string) => void
}

function TaskItem({
  task,
  calendars,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const t = useTranslations('TASKS')
  const taskKey = task.key ?? task.id ?? ''

  const calendarName = useMemo(() => {
    const key = task.calendar_key ?? task.calendar_id
    const cal = calendars.find((c) => (c.key ?? c.id) === key)
    return cal?.name ?? key ?? ''
  }, [calendars, task.calendar_key, task.calendar_id])

  const isOverdue = useMemo(() => isTaskOverdue(task), [task])

  const dueLabel = useMemo(() => {
    if (!task.due) return null
    try {
      return format(parseISO(task.due), 'PP')
    } catch {
      return null
    }
  }, [task.due])

  const priorityLevel = getPriorityLevel(task.priority)
  const isCompleted = task.status === 'completed'
  const progressPercent = useMemo(() => getDisplayTaskProgress(task), [task])

  const handleToggle = useCallback(
    () => onToggleComplete(task),
    [onToggleComplete, task]
  )

  return (
    <li
      data-testid={`task-item-${taskKey}`}
      className={cn(
        'border-border flex items-start gap-3 rounded-lg border p-3 transition-opacity duration-300',
        isCompleted && 'opacity-55'
      )}
    >
      <TaskCompleteCheckbox
        completed={isCompleted}
        label={task.title}
        onToggle={handleToggle}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={cn(
            'text-sm font-medium transition-[color,text-decoration-color] duration-300',
            isCompleted && 'text-muted-foreground line-through decoration-muted-foreground/60'
          )}
        >
          {task.title}
        </p>

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
          {priorityLevel !== 'none' && (
            <span
              className={cn(
                'rounded px-1.5 py-0.5 font-medium',
                getPriorityBadgeClassName(priorityLevel)
              )}
            >
              {t(`priority.${priorityLevel}.string`)}
            </span>
          )}

          {task.status && task.status !== 'needs_action' && (
            <span>{t(`status.${task.status}.string`)}</span>
          )}

          {dueLabel && (
            <span className={cn(isOverdue && 'text-destructive font-medium')}>
              {isOverdue ? `${t('overdue.string')} · ${dueLabel}` : dueLabel}
            </span>
          )}

          {calendarName && (
            <span
              className="truncate"
              style={
                calendars.find(
                  (c) =>
                    (c.key ?? c.id) ===
                    (task.calendar_key ?? task.calendar_id)
                )?.color
                  ? {
                      color: calendars.find(
                        (c) =>
                          (c.key ?? c.id) ===
                          (task.calendar_key ?? task.calendar_id)
                      )?.color,
                    }
                  : undefined
              }
            >
              {calendarName}
            </span>
          )}
        </div>

        {progressPercent !== null && (
          <TaskProgressBar value={progressPercent} className="pt-0.5" />
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => taskKey && onEdit(taskKey)}
          aria-label={t('actions.edit.string')}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => taskKey && onDelete(taskKey)}
          aria-label={t('actions.delete.string')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}

export default memo(TaskItem)
