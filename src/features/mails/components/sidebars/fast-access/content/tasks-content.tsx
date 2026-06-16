'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TaskOverdueCountBadge from '@/features/tasks/components/task-overdue-count-badge'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import { useGetCalendarsQuery } from '@/features/calendars/store/calendars-api'
import TaskCompleteCheckbox from '@/features/tasks/components/task-complete-checkbox'
import TaskProgressBar from '@/features/tasks/components/task-progress-bar'
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '@/features/tasks'
import type { Task } from '@/features/tasks/tasks-types'
import { isActiveTask } from '@/features/tasks/utils/task-list-filter'
import {
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
} from '@/features/tasks/utils/task-due'
import {
  getPriorityBadgeClassName,
  getPriorityLevel,
} from '@/features/tasks/utils/task-priority'
import { getDisplayTaskProgress } from '@/features/tasks/utils/task-progress'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { memo, useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { CALENDAR_TEXT_SEARCH_MAX_LENGTH } from '@/features/calendars/calendar-constants'

const DEFAULT_COLOR = '#3b82f6'
const SECTION_LIMIT = 5

function sortByDue(a: Task, b: Task): number {
  return (a.due ?? '').localeCompare(b.due ?? '')
}

function formatDueLabel(due: string): string | null {
  try {
    return format(parseISO(due), 'PP')
  } catch {
    return null
  }
}

const SEARCH_DEBOUNCE_MS = 300

function TaskRow({
  task,
  color,
  dueLabel,
  dueClassName,
  onToggleComplete,
}: {
  task: Task
  color?: string
  dueLabel: string | null
  dueClassName?: string
  onToggleComplete: (task: Task) => Promise<void>
}) {
  const tPriority = useTranslations('TASKS')
  const priorityLevel = getPriorityLevel(task.priority)
  const progressPercent = getDisplayTaskProgress(task)

  const handleToggle = useCallback(
    () => onToggleComplete(task),
    [onToggleComplete, task]
  )

  return (
    <div
      data-testid="task-row"
      className="flex items-start gap-2 rounded-md px-1 py-1 transition-colors hover:bg-sidebar-accent/50"
    >
      <TaskCompleteCheckbox
        completed={false}
        label={task.title}
        onToggle={handleToggle}
      />
      <Link href="/tasks" className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start gap-1.5">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color ?? DEFAULT_COLOR }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-foreground line-clamp-2 text-sm font-medium leading-snug">
              {task.title}
            </p>
            {(dueLabel ||
              priorityLevel !== 'none' ||
              progressPercent !== null) && (
              <div className="mt-0.5 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {priorityLevel !== 'none' && (
                    <span
                      className={cn(
                        'rounded px-1 py-0.5 text-[10px] font-medium',
                        getPriorityBadgeClassName(priorityLevel)
                      )}
                    >
                      {tPriority(`priority.${priorityLevel}.string`)}
                    </span>
                  )}
                  {dueLabel && (
                    <span
                      className={cn(
                        'text-muted-foreground text-xs',
                        dueClassName
                      )}
                    >
                      {dueLabel}
                    </span>
                  )}
                </div>
                {progressPercent !== null && (
                  <TaskProgressBar value={progressPercent} />
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

function SectionHeader({
  title,
  count,
  destructive,
}: {
  title: string
  count: number
  destructive?: boolean
}) {
  return (
    <div className="mb-1 flex items-center justify-between px-2">
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {title}
      </p>
      {count > 0 &&
        (destructive ? (
          <TaskOverdueCountBadge count={count} />
        ) : (
          <span className="text-muted-foreground text-xs tabular-nums">
            {count}
          </span>
        ))}
    </div>
  )
}

function TaskSection({
  sectionId,
  title,
  tasks,
  totalCount,
  destructive,
  colorFor,
  dueLabelFor,
  onToggleComplete,
}: {
  sectionId: string
  title: string
  tasks: Task[]
  totalCount: number
  destructive?: boolean
  colorFor: (task: Task) => string | undefined
  dueLabelFor: (task: Task) => { label: string | null; className?: string }
  onToggleComplete: (task: Task) => Promise<void>
}) {
  if (tasks.length === 0) return null

  return (
    <section data-testid={`task-section-${sectionId}`}>
      <SectionHeader
        title={title}
        count={totalCount}
        destructive={destructive}
      />
      <div className="flex flex-col gap-0.5">
        {tasks.map((task) => {
          const { label, className } = dueLabelFor(task)
          return (
            <TaskRow
              key={task.key ?? task.id ?? task.uid}
              task={task}
              color={colorFor(task)}
              dueLabel={label}
              dueClassName={className}
              onToggleComplete={onToggleComplete}
            />
          )
        })}
      </div>
    </section>
  )
}

const TasksContent: FC = () => {
  const t = useTranslations('NAVIGATION.fast_access.tasks')
  const tTasks = useTranslations('TASKS')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const searchParam =
    debouncedSearch.length >= 2 ? debouncedSearch : undefined

  const { data: calendars = [] } = useGetCalendarsQuery()
  const { data: tasks = [], isLoading, isError } = useGetTasksQuery(
    searchParam ? { search: searchParam } : undefined
  )
  const [updateTask] = useUpdateTaskMutation()

  const calendarColors = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of calendars) {
      const color = c.color ?? DEFAULT_COLOR
      if (c.id) map[c.id] = color
      if (c.key) map[c.key] = color
    }
    return map
  }, [calendars])

  const colorFor = useCallback(
    (task: Task): string | undefined =>
      calendarColors[task.calendar_key ?? task.calendar_id ?? ''],
    [calendarColors]
  )

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      const taskKey = task.key ?? task.id
      if (!taskKey) return

      await updateTask({
        taskKey,
        body: {
          status: 'completed',
          percent_complete: 100,
          completed_at: new Date().toISOString(),
        },
        silentSuccess: true,
      }).unwrap()
    },
    [updateTask]
  )

  const activeTasks = useMemo(
    () => tasks.filter(isActiveTask),
    [tasks]
  )

  const isSearching = debouncedSearch.length >= 2
  const sectionLimit = isSearching ? Number.POSITIVE_INFINITY : SECTION_LIMIT

  const overdueAll = useMemo(
    () => activeTasks.filter(isTaskOverdue).sort(sortByDue),
    [activeTasks]
  )
  const todayAll = useMemo(
    () =>
      activeTasks
        .filter((task) => isTaskDueToday(task) && !isTaskOverdue(task))
        .sort(sortByDue),
    [activeTasks]
  )
  const upcomingAll = useMemo(
    () => activeTasks.filter(isTaskUpcoming).sort(sortByDue),
    [activeTasks]
  )
  const undatedAll = useMemo(
    () => activeTasks.filter((task) => !task.due),
    [activeTasks]
  )

  const overdue = overdueAll.slice(0, sectionLimit)
  const today = todayAll.slice(0, sectionLimit)
  const upcoming = upcomingAll.slice(0, sectionLimit)
  const undated = undatedAll.slice(0, sectionLimit)

  const hasAnyTask = activeTasks.length > 0
  const hasVisibleTask =
    overdue.length > 0 ||
    today.length > 0 ||
    upcoming.length > 0 ||
    undated.length > 0

  const overdueDueLabel = useCallback(
    (task: Task) => {
      const label = task.due ? formatDueLabel(task.due) : null
      return {
        label: label
          ? `${tTasks('overdue.string')} · ${label}`
          : tTasks('overdue.string'),
        className: 'text-destructive font-medium',
      }
    },
    [tTasks]
  )

  const todayDueLabel = useCallback((task: Task) => {
    if (!task.due) return { label: null }
    const label = formatDueLabel(task.due)
    return { label: label ?? null }
  }, [])

  const upcomingDueLabel = useCallback((task: Task) => {
    if (!task.due) return { label: null }
    const label = formatDueLabel(task.due)
    return { label: label ?? null }
  }, [])

  return (
    <SidebarGroupContent
      className="flex flex-1 flex-col gap-3 overflow-hidden p-2"
      data-testid="tasks-panel"
    >
      <div className="flex shrink-0 flex-col gap-2 px-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{t('title')}</span>
          <Button variant="link" size="sm" className="h-auto shrink-0 p-0" asChild>
            <Link href="/tasks">{t('view_all')}</Link>
          </Button>
        </div>

        {!isLoading && !isError && (
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('search_placeholder')}
              className={cn('h-8 pl-8 text-sm')}
              data-testid="fast-access-tasks-search"
              autoComplete="off"
              maxLength={CALENDAR_TEXT_SEARCH_MAX_LENGTH}
            />
          </div>
        )}
      </div>

      <div className="scrollbar-thin-gray flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        {isLoading && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('loading')}</p>
        )}

        {!isLoading && isError && (
          <p className="text-destructive px-2 py-3 text-xs">{t('error')}</p>
        )}

        {!isLoading && !isError && !hasAnyTask && (
          <p className="text-muted-foreground px-2 py-3 text-xs">
            {isSearching ? t('no_results') : t('empty')}
          </p>
        )}

        {!isLoading && !isError && hasAnyTask && !hasVisibleTask && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('no_results')}</p>
        )}

        {!isLoading && !isError && hasVisibleTask && (
          <>
            <TaskSection
              sectionId="overdue"
              title={t('overdue')}
              tasks={overdue}
              totalCount={overdueAll.length}
              destructive
              colorFor={colorFor}
              dueLabelFor={overdueDueLabel}
              onToggleComplete={handleToggleComplete}
            />
            <TaskSection
              sectionId="today"
              title={t('today')}
              tasks={today}
              totalCount={todayAll.length}
              colorFor={colorFor}
              dueLabelFor={todayDueLabel}
              onToggleComplete={handleToggleComplete}
            />
            <TaskSection
              sectionId="upcoming"
              title={t('upcoming')}
              tasks={upcoming}
              totalCount={upcomingAll.length}
              colorFor={colorFor}
              dueLabelFor={upcomingDueLabel}
              onToggleComplete={handleToggleComplete}
            />

            <TaskSection
              sectionId="undated"
              title={t('no_due_date')}
              tasks={undated}
              totalCount={undatedAll.length}
              colorFor={colorFor}
              dueLabelFor={() => ({ label: null })}
              onToggleComplete={handleToggleComplete}
            />
          </>
        )}
      </div>
    </SidebarGroupContent>
  )
}

export default memo(TasksContent)
