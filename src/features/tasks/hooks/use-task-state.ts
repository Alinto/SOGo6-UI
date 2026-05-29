'use client'

import { useGetCalendarsQuery } from '@/features/calendars'
import { isPersonalCalendar } from '@/features/calendars/utils/calendar-source-type'
import type { Task, TaskListFilter } from '../tasks-types'
import { taskMatchesListFilter } from '../utils/task-list-filter'
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../store/tasks-api'
import {
  closeForm,
  openCreateForm,
  openEditForm,
  selectTasksUi,
  setCalendarFilter,
  setSearchQuery,
  setStatusFilter,
} from '../store/tasks-ui-slice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useCallback, useMemo } from 'react'
import { useTasksSource } from './use-tasks-source'

export function useTaskState() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectTasksUi)
  const { tasks: tasksSource, isLoading, isFetching } = useTasksSource()

  const { data: calendars = [], isLoading: calendarsLoading } =
    useGetCalendarsQuery()

  const writableCalendars = useMemo(
    () => calendars.filter(isPersonalCalendar),
    [calendars]
  )

  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()

  const filteredTasks = useMemo(() => {
    if (!tasksSource) return []
    return tasksSource.filter((t) => taskMatchesListFilter(t, ui.statusFilter))
  }, [tasksSource, ui.statusFilter])

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      const taskKey = task.key ?? task.id
      if (!taskKey) return

      const isNowComplete = task.status !== 'completed'
      await updateTask({
        taskKey,
        body: {
          status: isNowComplete ? 'completed' : 'needs_action',
          percent_complete: isNowComplete ? 100 : 0,
          completed_at: isNowComplete ? new Date().toISOString() : null,
        },
        silentSuccess: true,
      }).unwrap()
    },
    [updateTask]
  )

  return {
    tasks: filteredTasks,
    isLoading,
    isFetching,
    calendars,
    writableCalendars,
    calendarsLoading,
    ui,
    handleToggleComplete,
    createTask,
    updateTask,
    deleteTask,
    openCreateForm: () => dispatch(openCreateForm()),
    openEditForm: (key: string) => dispatch(openEditForm(key)),
    closeForm: () => dispatch(closeForm()),
    setStatusFilter: (f: TaskListFilter) => dispatch(setStatusFilter(f)),
    setSearch: (q: string) => dispatch(setSearchQuery(q)),
    setCalendar: (k: string | null) => dispatch(setCalendarFilter(k)),
  }
}
