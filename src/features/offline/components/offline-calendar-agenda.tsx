'use client'

import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { cn } from '@/lib/utils'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'
import { isPwaCalendarCacheEnabled } from '../flags'
import { useCalendarCache } from '../hooks/use-calendar-cache'
import OfflineUnavailable from './offline-unavailable'

function eventTimeLabel(
  event: CalendarEvent,
  locale: string,
  allDayLabel: string
): string {
  if (event.all_day) return allDayLabel
  if (!event.date_start) return ''
  const start = parseISO(event.date_start)
  if (!isValid(start)) return event.date_start
  const end = event.date_end ? parseISO(event.date_end) : null
  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(start)
  const timeFmt = format(start, 'HH:mm')
  if (end && isValid(end)) {
    return `${dateFmt} ${timeFmt}–${format(end, 'HH:mm')}`
  }
  return `${dateFmt} ${timeFmt}`
}

function OfflineCalendarAgenda() {
  const t = useTranslations('PWA')
  const locale = useLocale()
  const { readEvents, readMeta } = useCalendarCache()
  const [state, setState] = useState<{
    events: CalendarEvent[]
    hasCache: boolean
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    void Promise.all([readEvents(), readMeta()]).then(([rows, meta]) => {
      if (cancelled) return
      const sorted = [...rows].sort((a, b) =>
        (a.date_start ?? '').localeCompare(b.date_start ?? '')
      )
      setState({ events: sorted, hasCache: !!meta })
    })
    return () => {
      cancelled = true
    }
  }, [readEvents, readMeta])

  if (!isPwaCalendarCacheEnabled()) {
    return <OfflineUnavailable force target="calendar" />
  }

  if (state === null) {
    return (
      <div
        className="flex h-full min-h-0 w-full flex-1 items-center justify-center"
        data-testid="offline-calendar-agenda"
      />
    )
  }

  if (!state.hasCache) {
    return <OfflineUnavailable force target="calendar" />
  }

  if (!state.events.length) {
    return (
      <div
        data-testid="offline-calendar-agenda"
        className="text-muted-foreground flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 p-8 text-center"
      >
        <CalendarDays className="size-8 shrink-0" aria-hidden />
        <p className="text-sm">{t('offline_calendar_empty.string')}</p>
      </div>
    )
  }

  return (
    <div
      data-testid="offline-calendar-agenda"
      className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto p-4"
    >
      <ul className="mx-auto flex w-full max-w-lg flex-col gap-2">
        {state.events.map((event) => (
          <li
            key={event.key ?? event.id ?? `${event.uid}-${event.date_start}`}
            className={cn('bg-card text-card-foreground rounded-md border p-3')}
          >
            <p className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {event.title?.trim() || t('offline_calendar_untitled.string')}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {eventTimeLabel(
                event,
                locale,
                t('offline_calendar_all_day.string')
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(OfflineCalendarAgenda)
