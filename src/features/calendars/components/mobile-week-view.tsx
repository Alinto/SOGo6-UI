'use client'

import { type CalendarEvent } from '@/features/calendars'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { cn } from '@/lib/utils'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

interface MobileWeekViewProps {
  date: Date
  events: CalendarEventWithDate[]
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string
  onDateSelect: (date: Date) => void
}

export function MobileWeekView({
  date,
  events,
  calendarColorMap,
  defaultColor,
  onDateSelect,
}: MobileWeekViewProps) {
  // Get dynamic locale from next-intl
  const locale = useLocale()
  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  // Calculate week days (memoized)
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [date])

  // Get events for a specific day (memoized per day)
  const getEventsForDay = useMemo(() => {
    const eventsByDay = new Map<string, CalendarEventWithDate[]>()

    weekDays.forEach((day) => {
      const dayKey = day.toISOString().split('T')[0]
      eventsByDay.set(
        dayKey,
        events.filter((event) => {
          const eventDate = new Date(event.start)
          return isSameDay(eventDate, day)
        })
      )
    })

    return (day: Date) => {
      const dayKey = day.toISOString().split('T')[0]
      return eventsByDay.get(dayKey) || []
    }
  }, [events, weekDays])

  const today = useMemo(() => new Date(), [])

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 p-4">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, date)
          const dayLabel = format(day, 'EEEE d MMMM', { locale: dateFnsLocale })

          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onDateSelect(day)}
              aria-label={dayLabel}
              aria-pressed={isSelected}
              className={cn(
                'flex min-w-[60px] flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                isSelected && 'border-primary bg-primary/10',
                isToday && !isSelected && 'border-primary/50',
                !isSelected && !isToday && 'border-border hover:bg-accent'
              )}
            >
              {/* Day name */}
              <span className="text-muted-foreground text-xs font-medium uppercase">
                {format(day, 'EEE', { locale: dateFnsLocale })}
              </span>

              {/* Day number */}
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold',
                  isToday && 'bg-primary text-primary-foreground'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Event dots */}
              {dayEvents.length > 0 && (
                <div
                  className="flex gap-1"
                  aria-label={`${dayEvents.length} events`}
                >
                  {dayEvents.slice(0, 3).map((event, idx) => {
                    const color =
                      calendarColorMap[event.calendar_id] || defaultColor
                    return (
                      <div
                        key={`${event.id}-${idx}`}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div
                      className="bg-muted-foreground h-1.5 w-1.5 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
