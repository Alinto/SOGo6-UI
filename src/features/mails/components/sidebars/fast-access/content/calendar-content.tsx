'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar-lazy'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import {
  useGetCalendarsQuery,
  useGetEventsQuery,
} from '@/features/calendars/store/calendars-api'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo, useState } from 'react'
import FastAccessError from './fast-access-error'

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
    : `${formatTime(event.date_start)} – ${formatTime(event.date_end)}`

  return (
    <div className="hover:bg-sidebar-foreground/10 flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors">
      <span
        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? '#3b82f6' }}
      />
      <div className="min-w-0">
        <p className="text-foreground truncate leading-tight font-medium">
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
  } = useGetEventsQuery({ startDate, endDate }, { skip: !hasCalendars })

  const sorted = useMemo(() => {
    if (!events) return []
    return [...events].sort((a, b) => {
      if (a.all_day && !b.all_day) return -1
      if (!a.all_day && b.all_day) return 1
      return (a.date_start ?? '').localeCompare(b.date_start ?? '')
    })
  }, [events])

  if (isLoading) {
    return (
      <p className="text-muted-foreground px-2 py-3 text-xs">{t('loading')}</p>
    )
  }

  if (isError) {
    return <FastAccessError online={t('error')} offline={t('error_offline')} />
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
  const { navigateApp } = useOfflineNav()
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
        visibleCalendars.map((c) => [c.id ?? c.key ?? '', c.color ?? '#3b82f6'])
      ),
    [visibleCalendars]
  )

  const hasCalendars = visibleCalendars.length > 0

  const monthStart = startOfMonth(displayMonth).toISOString()
  const monthEnd = endOfMonth(displayMonth).toISOString()
  const { data: monthEvents } = useGetEventsQuery(
    { startDate: monthStart, endDate: monthEnd },
    { skip: !hasCalendars }
  )

  const datesWithEvents = useMemo<Date[]>(() => {
    if (!monthEvents) return []
    const seen = new Set<string>()
    const dates: Date[] = []
    for (const event of monthEvents) {
      const raw = event.date_start
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
    <SidebarGroupContent
      className="flex flex-col gap-2"
      data-testid="calendar-panel"
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <span className="text-sm font-medium">{t('title')}</span>
        <Button
          variant="link"
          size="sm"
          className="h-auto shrink-0 p-0"
          onClick={() => navigateApp('/calendars')}
        >
          {t('view_all')}
        </Button>
      </div>

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
        <p className="text-muted-foreground mb-1 px-2 text-xs font-semibold tracking-wide uppercase">
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

export default memo(CalendarContent)
