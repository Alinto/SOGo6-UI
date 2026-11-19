'use client'

import { useAppSelector } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { useGetCalendarTasksQuery, useGetTasksQuery } from '../store/tasks-api'
import { selectTasksUi } from '../store/tasks-ui-slice'

/** Raw task list from global or calendar-scoped query (same source as useTaskState). */
export function useTasksSource() {
  const { selectedCalendarKey, searchQuery } = useAppSelector(selectTasksUi)

  const searchParam =
    searchQuery.trim().length >= 2 ? searchQuery.trim() : undefined

  const globalQuery = useGetTasksQuery(
    selectedCalendarKey ? skipToken : { search: searchParam }
  )

  const calendarQuery = useGetCalendarTasksQuery(
    selectedCalendarKey
      ? {
          calendarKey: selectedCalendarKey,
          params: { search: searchParam },
        }
      : skipToken
  )

  const activeQuery = selectedCalendarKey ? calendarQuery : globalQuery
  const tasks = activeQuery.data

  const isLoading = selectedCalendarKey
    ? calendarQuery.isLoading
    : globalQuery.isLoading

  const isFetching = selectedCalendarKey
    ? calendarQuery.isFetching
    : globalQuery.isFetching

  return {
    tasks,
    isLoading,
    isFetching,
    isError: activeQuery.isError,
    refetch: activeQuery.refetch,
    selectedCalendarKey,
  }
}
