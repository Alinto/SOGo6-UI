'use client'

import {
  useGetCalendarsQuery,
  useGetEventsInTimeRangeQuery,
  useUpdateCalendarEventMutation,
  type Calendar,
  type CalendarEvent,
} from '@/features/calendars'
import { useLocale } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import type { SlotInfo } from 'react-big-calendar'
import { View, Views } from 'react-big-calendar'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

/**
 * Convert a date string to a Date object adjusted for the specified timezone
 * This ensures events display at the correct local time in the selected timezone
 */
function convertDateToTimezone(
  dateString: string,
  timezone: string,
  locale: string
): Date {
  const date = new Date(dateString)

  // Get the offset for the specified timezone using the provided locale
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const timezoneDate = new Date(
    parseInt(parts.find((p) => p.type === 'year')?.value || '2000'),
    parseInt(parts.find((p) => p.type === 'month')?.value || '1') - 1,
    parseInt(parts.find((p) => p.type === 'day')?.value || '1'),
    parseInt(parts.find((p) => p.type === 'hour')?.value || '0'),
    parseInt(parts.find((p) => p.type === 'minute')?.value || '0'),
    parseInt(parts.find((p) => p.type === 'second')?.value || '0')
  )

  // Calculate offset
  const offset = date.getTime() - timezoneDate.getTime()

  // Apply the offset to display the time correctly in the new timezone
  return new Date(date.getTime() - offset)
}

interface UseCalendarStateReturn {
  view: View
  date: Date
  events: CalendarEventWithDate[]
  selectedSlot: SlotInfo | null
  timezone: string
  calendarsData:
    | { personal?: Calendar[]; shared?: Calendar[]; subscriptions?: Calendar[] }
    | undefined
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string
  defaultCalendar: Calendar | undefined

  setView: (_view: View) => void
  setDate: (_date: Date) => void
  setEvents: (_events: CalendarEventWithDate[]) => void
  setSelectedSlot: (_slot: SlotInfo | null) => void
  setTimezone: (_tz: string) => void

  handleNavigate: (_newDate: Date) => void
  handleViewChange: (_newView: View) => void
  navigateToPrevious: () => void
  navigateToNext: () => void
  navigateToToday: () => void
  handleSelectSlot: (_slotInfo: SlotInfo) => void
  handleCreateEvent: (_data: {
    title: string
    start: string
    end: string
  }) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleEventDrop: (_args: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleEventResize: (_args: any) => void
}

export function useCalendarState(): UseCalendarStateReturn {
  const locale = useLocale()
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEventWithDate[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null)
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  // Remove manual cache management and shouldFetch state

  const { data: calendarsData } = useGetCalendarsQuery()
  const [updateCalendarEvent] = useUpdateCalendarEventMutation()

  // Get all calendar IDs
  const allCalendarIds = useMemo(() => {
    if (!calendarsData) return []
    const ids: string[] = []
    if (calendarsData.personal)
      ids.push(...calendarsData.personal.map((c) => c.id))
    if (calendarsData.shared) ids.push(...calendarsData.shared.map((c) => c.id))
    if (calendarsData.subscriptions)
      ids.push(...calendarsData.subscriptions.map((c) => c.id))
    return ids
  }, [calendarsData])

  // Create a map of calendar ID to color
  const calendarColorMap = useMemo(() => {
    if (!calendarsData) return {}
    const colorMap: Record<string, string | undefined> = {}
    if (calendarsData.personal) {
      calendarsData.personal.forEach((cal) => {
        colorMap[cal.id] = cal.color || undefined
      })
    }
    if (calendarsData.shared) {
      calendarsData.shared.forEach((cal) => {
        colorMap[cal.id] = cal.color || undefined
      })
    }
    if (calendarsData.subscriptions) {
      calendarsData.subscriptions.forEach((cal) => {
        colorMap[cal.id] = cal.color || undefined
      })
    }
    return colorMap
  }, [calendarsData])

  // Calculate date range for fetching events based on view with 2 buffers
  const dateRange = useMemo(() => {
    const start = new Date(date)
    const end = new Date(date)

    switch (view) {
      case Views.DAY: {
        // For day view: current day + 2 days before and 2 days after
        start.setDate(start.getDate() - 2)
        end.setDate(end.getDate() + 2)
        break
      }
      case Views.WEEK: {
        // For week view: current week + 2 weeks before and 2 weeks after
        const dayOfWeek = start.getDay()
        start.setDate(start.getDate() - dayOfWeek - 14) // 2 weeks before Sunday
        end.setDate(end.getDate() + (6 - dayOfWeek) + 14) // 2 weeks after Saturday
        break
      }
      case Views.MONTH:
      case Views.AGENDA:
      default: {
        // For month/agenda view: current month + 2 months before and 2 months after
        start.setDate(1)
        start.setMonth(start.getMonth() - 2)
        end.setDate(1)
        end.setMonth(end.getMonth() + 3)
        end.setDate(0) // Last day of previous month
        break
      }
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }, [date, view])

  // RTK Query will handle caching and refetching automatically based on query parameters

  // Fetch events from all calendars using RTK Query's built-in caching
  const { data: fetchedEvents } = useGetEventsInTimeRangeQuery(
    {
      calendarIds: allCalendarIds,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    {
      skip: allCalendarIds.length === 0,
    }
  )

  // Transform fetched events to have Date objects
  // Recalculate when timezone changes to properly display events in new timezone
  useEffect(() => {
    if (fetchedEvents) {
      const transformedEvents: CalendarEventWithDate[] = fetchedEvents.map(
        (event) => ({
          ...event,
          start: convertDateToTimezone(event.start_date, timezone, locale),
          end: convertDateToTimezone(event.end_date, timezone, locale),
        })
      )
      setEvents(transformedEvents)
    }
  }, [fetchedEvents, timezone, locale])

  // Get default calendar color
  const defaultCalendar = calendarsData?.personal?.find(
    (cal: Calendar) => cal.default
  )
  const defaultColor = defaultCalendar?.color || '#3174ad'

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  const navigateToPrevious = () => {
    const newDate = new Date(date)
    switch (view) {
      case Views.MONTH:
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case Views.WEEK:
        newDate.setDate(newDate.getDate() - 7)
        break
      case Views.DAY:
        newDate.setDate(newDate.getDate() - 1)
        break
      case Views.AGENDA:
        newDate.setMonth(newDate.getMonth() - 1)
        break
    }
    setDate(newDate)
  }

  const navigateToNext = () => {
    const newDate = new Date(date)
    switch (view) {
      case Views.MONTH:
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case Views.WEEK:
        newDate.setDate(newDate.getDate() + 7)
        break
      case Views.DAY:
        newDate.setDate(newDate.getDate() + 1)
        break
      case Views.AGENDA:
        newDate.setMonth(newDate.getMonth() + 1)
        break
    }
    setDate(newDate)
  }

  const navigateToToday = () => {
    setDate(new Date())
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo)
  }

  const handleCreateEvent = (data: {
    title: string
    start: string
    end: string
  }) => {
    // TODO: Create event via API mutation
    // For now, just add to local state
    const newEvent: CalendarEventWithDate = {
      id: `temp-${Date.now()}`,
      calendar_id: defaultCalendar?.id || '',
      title: data.title,
      start_date: data.start,
      end_date: data.end,
      start: convertDateToTimezone(data.start, timezone, locale),
      end: convertDateToTimezone(data.end, timezone, locale),
      all_day: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setEvents([...events, newEvent])
    setSelectedSlot(null)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventDrop = (args: any) => {
    const { event, start, end } = args
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? {
            ...existingEvent,
            start,
            end,
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          }
        : existingEvent
    )
    setEvents(updatedEvents)

    // Call API to update the event
    updateCalendarEvent({
      calendarId: event.calendar_id,
      eventId: event.id,
      event: {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      },
    }).catch((error) => {
      console.error('Failed to update event on drag:', error)
      // Revert the UI change on error
      setEvents(events)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventResize = (args: any) => {
    const { event, start, end } = args
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? {
            ...existingEvent,
            start,
            end,
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          }
        : existingEvent
    )
    setEvents(updatedEvents)

    // Call API to update the event
    updateCalendarEvent({
      calendarId: event.calendar_id,
      eventId: event.id,
      event: {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      },
    }).catch((error) => {
      console.error('Failed to update event on resize:', error)
      // Revert the UI change on error
      setEvents(events)
    })
  }

  return {
    view,
    date,
    events,
    selectedSlot,
    timezone,
    calendarsData,
    calendarColorMap,
    defaultColor,
    defaultCalendar,
    setView,
    setDate,
    setEvents,
    setSelectedSlot,
    setTimezone,
    handleNavigate,
    handleViewChange,
    navigateToPrevious,
    navigateToNext,
    navigateToToday,
    handleSelectSlot,
    handleCreateEvent,
    handleEventDrop,
    handleEventResize,
  }
}
