'use client'

import { Calendar } from '@/components/ui/calendar-lazy'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import {
  useGetCalendarsQuery,
  useGetEventsQuery,
} from '@/features/calendars/store/calendars-api'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React, { useMemo, useState } from 'react'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function formatTime(iso: string | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function EventRow({ event, color }: { event: CalendarEvent; color?: string }) {
  const t = useTranslations('NAVIGATION.fast_access.calendar')
  const isAllDay = event.all_day
  const timeLabel = isAllDay
    ? t('all_day')
    : `${formatTime(event.start_date)} – ${formatTime(event.end_date)}`

  return (
    <div className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent/50">
      <span
        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? '#3b82f6' }}
      />
      <div className="min-w-0">
        <p className="text-foreground truncate font-medium leading-tight">
          {event.title}
        </p>
        <p className="text-muted-foreground text-xs">{timeLabel}</p>
        {event.location && (
          <p className="text-muted-foreground truncate text-xs">
            {event.location}
          </p>
        )}
      </div>
    </div>
  )
}

function EventList({
  selectedDate,
  calendarColors,
  hasCalendars,
}: {
  selectedDate: Date
  calendarColors: Record<string, string>
  hasCalendars: boolean
}) {
  const t = useTranslations('NAVIGATION.fast_access.calendar')
  const startDate = startOfDay(selectedDate).toISOString()
  const endDate = endOfDay(selectedDate).toISOString()

  const {
    data: events,
    isLoading,
    isError,
  } = useGetEventsQuery(
    { startDate, endDate },
    { skip: !hasCalendars }
  )

  const sorted = useMemo(() => {
    if (!events) return []
    return [...events].sort((a, b) => {
      if (a.all_day && !b.all_day) return -1
      if (!a.all_day && b.all_day) return 1
      return (a.start_date ?? '').localeCompare(b.start_date ?? '')
    })
  }, [events])

  if (isLoading) {
    return (
      <p className="text-muted-foreground px-2 py-3 text-xs">{t('loading')}</p>
    )
  }

  if (isError) {
    return (
      <p className="text-destructive px-2 py-3 text-xs">{t('error')}</p>
    )
  }

  if (sorted.length === 0) {
    return (
      <p className="text-muted-foreground px-2 py-3 text-xs">
        {t('no_events')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {sorted.map((event) => (
        <EventRow
          key={event.id ?? event.uid}
          event={event}
          color={calendarColors[event.calendar_id ?? '']}
        />
      ))}
    </div>
  )
}

const CalendarContent: React.FC = () => {
  const t = useTranslations('NAVIGATION.fast_access.calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date())

  const { data: calendars = [] } = useGetCalendarsQuery()

  const visibleCalendars = useMemo(
    () => calendars.filter((c) => !c.u_hidden),
    [calendars]
  )

  const calendarColors = useMemo(
    () =>
      Object.fromEntries(
        visibleCalendars.map((c) => [
          c.id ?? c.key ?? '',
          c.color ?? '#3b82f6',
        ])
      ),
    [visibleCalendars]
  )

  const hasCalendars = visibleCalendars.length > 0

  // Fetch all events for the current displayed month to build the dot indicators
  const monthStart = startOfMonth(displayMonth).toISOString()
  const monthEnd = endOfMonth(displayMonth).toISOString()
  const { data: monthEvents } = useGetEventsQuery(
    { startDate: monthStart, endDate: monthEnd },
    { skip: !hasCalendars }
  )

  // Deduplicated list of dates that have at least one event
  const datesWithEvents = useMemo<Date[]>(() => {
    if (!monthEvents) return []
    const seen = new Set<string>()
    const dates: Date[] = []
    for (const event of monthEvents) {
      const raw = event.start_date ?? event.date_start
      if (!raw) continue
      const d = new Date(raw)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!seen.has(key)) {
        seen.add(key)
        dates.push(startOfDay(d))
      }
    }
    return dates
  }, [monthEvents])

  const isToday = isSameDay(selectedDate, new Date())

  return (
    <SidebarGroupContent className="flex flex-col gap-2">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(d) => d && setSelectedDate(d)}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        className={cn('rounded-none border-b')}
        modifiers={{ hasEvents: datesWithEvents }}
        modifiersClassNames={{
          hasEvents:
            'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary after:content-[""]',
        }}
      />
      <div className="px-1 pb-2">
        <p className="text-muted-foreground mb-1 px-2 text-xs font-semibold uppercase tracking-wide">
          {isToday
            ? t('today')
            : selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
        </p>
        <EventList
          selectedDate={selectedDate}
          calendarColors={calendarColors}
          hasCalendars={hasCalendars}
        />
      </div>
    </SidebarGroupContent>
  )
}

export default CalendarContent
