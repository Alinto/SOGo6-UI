'use client'

import { type CalendarEvent } from '@/features/calendars'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

interface AgendaViewProps {
  events: CalendarEventWithDate[]
  date: Date
  calendarColorMap: Record<string, string | undefined>
}

export function AgendaView({
  events,
  date,
  calendarColorMap,
}: AgendaViewProps) {
  const t = useTranslations('CALENDARS')

  // Filter events from current date onwards
  const upcomingEvents = events
    .filter((event) => new Date(event.start) >= date)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 100) // Limit to 100 events for performance

  if (upcomingEvents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-center">
          <p className="text-lg font-medium">
            {t('schedule.noEvents.string') || 'No events'}
          </p>
          <p className="text-sm">
            {t('schedule.noUpcomingEvents.string') ||
              'No upcoming events for this period'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-6">
        {upcomingEvents.map((event) => {
          const eventDate = new Date(event.start)
          const eventEndDate = new Date(event.end)
          const color = calendarColorMap[event.calendar_id] || '#3b82f6'

          return (
            <div
              key={event.id}
              className="border-border bg-card hover:bg-accent flex gap-4 rounded-lg border p-4 transition-colors"
            >
              {/* Date Indicator */}
              <div className="flex min-w-fit flex-col items-center justify-start">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {format(eventDate, 'd')}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {format(eventDate, 'MMM')}
                </p>
              </div>

              {/* Event Details */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {event.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {format(eventDate, 'h:mm a')}{' '}
                  {t('calendar.to.string') || 'to'}{' '}
                  {format(eventEndDate, 'h:mm a')}
                </p>
                {event.description && (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-end">
                {event.all_day && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {t('calendar.allDay.string') || 'All Day'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
