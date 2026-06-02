'use client'

import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
import {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useGetCalendarsQuery,
  useGetEventsQuery,
  useUpdateCalendarEventMutation,
  type Calendar,
  type CalendarEventCreateBody,
  type CalendarEventUpdateBody,
  type CalendarEvent,
} from '@/features/calendars'
import { singleOccurrenceMutationFields } from '@/features/calendars/utils/recurrence-scope-mutation'
import { isCalendarWritable } from '@/features/calendars/utils/is-calendar-writable'
import { endOfDay, startOfDay } from 'date-fns'
import { useLocale } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import type { SlotInfo } from 'react-big-calendar'
import { View, Views } from 'react-big-calendar'
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'

type RBCEvent = CalendarEvent & {
  start: Date
  end: Date
  allDay: boolean
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
  events: RBCEvent[]
  selectedSlot: SlotInfo | null
  timezone: string
  calendarsData: Calendar[] | undefined
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string
  defaultCalendar: Calendar | undefined

  setView: (_view: View) => void
  setDate: (_date: Date) => void
  setEvents: (_events: RBCEvent[]) => void
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
  }) => Promise<void>
  handleUpdateEvent: (
    _event: CalendarEvent,
    _body: CalendarEventUpdateBody
  ) => Promise<void>
  handleDeleteEvent: (_event: CalendarEvent) => Promise<void>
  handleEventDrop: (_args: EventInteractionArgs<RBCEvent>) => void
  handleEventResize: (_args: EventInteractionArgs<RBCEvent>) => void
}

export function useCalendarState(): UseCalendarStateReturn {
  const locale = useLocale()
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState<RBCEvent[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null)
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  // Remove manual cache management and shouldFetch state

  const { data: calendarsData } = useGetCalendarsQuery()
  const [createCalendarEvent] = useCreateCalendarEventMutation()
  const [updateCalendarEvent] = useUpdateCalendarEventMutation()
  const [deleteCalendarEvent] = useDeleteCalendarEventMutation()

  // Create a map of calendar ID to color
  const calendarColorMap = useMemo(() => {
    if (!calendarsData) return {}
    const colorMap: Record<string, string | undefined> = {}
    calendarsData.forEach((cal) => {
      const key = cal.key ?? cal.id
      if (key) colorMap[key] = cal.color || undefined
    })
    return colorMap
  }, [calendarsData])

  // Ranges must stay within backend MAX_EVENT_FETCH_DAYS (31)
  const dateRange = useMemo(() => {
    const start = new Date(date)
    const end = new Date(date)

    switch (view) {
      case Views.DAY: {
        // ±1 day buffer → 3 days
        start.setDate(start.getDate() - 1)
        end.setDate(end.getDate() + 1)
        break
      }
      case Views.WEEK: {
        // Current week + 1 week buffer on each side → 21 days
        const dayOfWeek = start.getDay()
        start.setDate(start.getDate() - dayOfWeek - 7)
        end.setDate(end.getDate() + (6 - dayOfWeek) + 7)
        break
      }
      case Views.MONTH: {
        // Current calendar month only (28–31 days)
        // Leading/trailing days from adjacent months in the grid may not load; navigate to load them.
        start.setDate(1)
        end.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        break
      }
      case Views.AGENDA:
      default: {
        // 30 days from selected day
        end.setDate(end.getDate() + 30)
        break
      }
    }

    return {
      startDate: startOfDay(start).toISOString(),
      endDate: endOfDay(end).toISOString(),
    }
  }, [date, view])

  // RTK Query will handle caching and refetching automatically based on query parameters

  const { currentData } = useGetEventsQuery(
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    {
      skip: !calendarsData?.length,
    }
  )

  // Transform fetched events to have Date objects
  // Recalculate when timezone changes to properly display events in new timezone
  useEffect(() => {
    if (currentData) {
      const transformedEvents: RBCEvent[] = currentData.flatMap((event) => {
        const startDate = event.start_date ?? event.date_start
        const endDate = event.end_date ?? event.date_end

        if (!startDate || !endDate) return []

        return [
          {
            ...event,
            id: event.recurrence_id
              ? `${event.key ?? event.uid}-${event.recurrence_id}`
              : (event.key ?? event.id ?? `${event.uid}-${startDate}`),
            calendar_id: event.calendar_id ?? event.calendar_key ?? '',
            start_date: startDate,
            date_start: startDate,
            end_date: endDate,
            date_end: endDate,
            start: convertDateToTimezone(startDate, timezone, locale),
            end: convertDateToTimezone(endDate, timezone, locale),
            allDay: event.all_day ?? false,
          },
        ]
      })
      setEvents(transformedEvents)
    }
  }, [currentData, timezone, locale])

  const defaultCalendar =
    calendarsData?.find((cal: Calendar) => cal.is_default) ?? calendarsData?.[0]
  const defaultColor = defaultCalendar?.color || DEFAULT_CALENDAR_COLOR

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

  const handleCreateEvent = async (data: {
    title: string
    start: string
    end: string
  }) => {
    const calendarKey = defaultCalendar?.key ?? defaultCalendar?.id
    if (!calendarKey) return

    const body: CalendarEventCreateBody = {
      title: data.title,
      date_start: data.start,
      date_end: data.end,
      all_day: false,
    }

    await createCalendarEvent({ calendarKey, body }).unwrap()
    setSelectedSlot(null)
  }

  const handleUpdateEvent = async (
    event: CalendarEvent,
    body: CalendarEventUpdateBody
  ) => {
    const eventKey = event.key ?? event.id ?? event.uid
    if (!eventKey) return

    await updateCalendarEvent({ eventKey, body }).unwrap()
  }

  const handleDeleteEvent = async (event: CalendarEvent) => {
    const eventKey = event.key ?? event.id ?? event.uid
    if (!eventKey) return

    await deleteCalendarEvent(eventKey).unwrap()
    setEvents((currentEvents) =>
      currentEvents.filter(
        (currentEvent) =>
          (currentEvent.key ?? currentEvent.id ?? currentEvent.uid) !== eventKey
      )
    )
  }

  const handleEventMove = (args: EventInteractionArgs<RBCEvent>) => {
    const { event, start, end } = args
    const calendarRef = event.calendar_id ?? event.calendar_key ?? ''
    const sourceCalendar = calendarsData?.find(
      (cal) => (cal.key ?? cal.id) === calendarRef
    )
    if (!isCalendarWritable(sourceCalendar)) return

    const allDay =
      (args as EventInteractionArgs<RBCEvent> & { allDay?: boolean }).allDay ??
      event.all_day ??
      false
    const nextStart = new Date(start)
    const nextEnd = new Date(end)
    const previousEvents = events
    const nextStartIso = nextStart.toISOString()
    const nextEndIso = nextEnd.toISOString()

    setEvents((currentEvents) =>
      currentEvents.map((existingEvent) =>
        existingEvent.id === event.id
          ? {
              ...existingEvent,
              start: nextStart,
              end: nextEnd,
              start_date: nextStartIso,
              date_start: nextStartIso,
              end_date: nextEndIso,
              date_end: nextEndIso,
              allDay,
              all_day: allDay,
            }
          : existingEvent
      )
    )

    const eventKey = event.key ?? event.id ?? event.uid
    if (!eventKey) return

    const isRecurringOccurrence = Boolean(event.recurrence_id)

    updateCalendarEvent({
      eventKey,
      body: {
        date_start: nextStartIso,
        date_end: nextEndIso,
        all_day: allDay,
        ...singleOccurrenceMutationFields(event.recurrence_id),
      },
      silentSuccess: !isRecurringOccurrence,
    }).catch(() => {
      setEvents(previousEvents)
    })
  }

  const handleEventDrop = (args: EventInteractionArgs<RBCEvent>) => {
    handleEventMove(args)
  }

  const handleEventResize = (args: EventInteractionArgs<RBCEvent>) => {
    handleEventMove(args)
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
    handleUpdateEvent,
    handleDeleteEvent,
    handleEventDrop,
    handleEventResize,
  }
}
