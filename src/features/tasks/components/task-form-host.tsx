'use client'

import { useGetCalendarsQuery } from '@/features/calendars'
import { isPersonalCalendar } from '@/features/calendars/utils/calendar-source-type'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { memo, useCallback, useMemo } from 'react'
import {
  useCreateTaskMutation,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
} from '../store/tasks-api'
import { closeForm, selectTasksUi } from '../store/tasks-ui-slice'
import TaskForm from './task-form'

function TaskFormHost() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectTasksUi)
  const { data: calendars = [] } = useGetCalendarsQuery()
  const writableCalendars = useMemo(
    () => calendars.filter(isPersonalCalendar),
    [calendars]
  )
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()

  const editingKey = ui.editingTaskKey
  const { currentData: editingTask } = useGetTaskByIdQuery(
    editingKey ?? skipToken
  )

  const handleClose = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  const handleFormSubmit = useCallback(
    async ({
      calendarKey,
      body,
      taskKey,
    }: {
      calendarKey: string
      body: Parameters<typeof createTask>[0]['body']
      taskKey?: string
    }) => {
      if (taskKey) {
        await updateTask({ taskKey, body }).unwrap()
        return
      }
      await createTask({ calendarKey, body }).unwrap()
    },
    [createTask, updateTask]
  )

  return (
    <TaskForm
      open={ui.isFormOpen}
      calendars={writableCalendars}
      task={editingKey ? (editingTask ?? null) : null}
      defaultCalendarKey={ui.selectedCalendarKey}
      onClose={handleClose}
      onSubmit={handleFormSubmit}
    />
  )
}

export default memo(TaskFormHost)
