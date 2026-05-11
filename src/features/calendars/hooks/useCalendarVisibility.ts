'use client'

import {
  useGetCalendarsQuery,
  useUpdateCalendarVisibilityMutation,
} from '@/features/calendars/store/calendars-api'
import { useCallback, useMemo } from 'react'

/**
 * Hook to manage which calendars' events are visible
 * Uses the store to track hidden state via the updateCalendarVisibility mutation
 * All calendars default to visible === true
 */
export function useCalendarVisibility() {
  // Fetch all calendars from the store
  const { data: calendarsData } = useGetCalendarsQuery()

  // Mutation to update calendar visibility in the store
  const [updateCalendarVisibility] = useUpdateCalendarVisibilityMutation()

  // Get hidden calendars from store by checking the hidden property
  const hiddenCalendars = useMemo(() => {
    if (!calendarsData) return new Set<string>()

    const hiddenIds = new Set<string>()
    calendarsData.forEach((calendar) => {
      if (calendar.u_hidden === true) {
        const key = calendar.key ?? calendar.id
        if (key) hiddenIds.add(key)
      }
    })
    return hiddenIds
  }, [calendarsData])
  // Set calendar visibility by calling the mutation
  const setCalendarVisibility = useCallback(
    async (calendarId: string, isVisible: boolean) => {
      await updateCalendarVisibility({
        id: calendarId,
        hidden: !isVisible,
      })
    },
    [updateCalendarVisibility]
  )

  // Get visibility state for a specific calendar (visible by default)
  const isCalendarVisible = useCallback(
    (calendarId: string): boolean => {
      return !hiddenCalendars.has(calendarId)
    },
    [hiddenCalendars]
  )
  return {
    setCalendarVisibility,
    isCalendarVisible,
    hiddenCalendars,
  }
}
