'use client'

import { Button } from '@/components/ui/button'
import { type CalendarEvent } from '@/features/calendars'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { cn } from '@/lib/utils'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

interface MobileMonthViewProps {
  date: Date
  events: CalendarEventWithDate[]
  onDateSelect: (date: Date) => void
  onNavigate: (date: Date) => void
}

export function MobileMonthView({
  date,
  events,
  onDateSelect,
  onNavigate,
}: MobileMonthViewProps) {
  const t = useTranslations('CALENDARS.mobile.month')
  const locale = useLocale()
  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  // Get all days to display in the calendar (including padding days)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const calendarStart = startOfWeek(monthStart, {
      weekStartsOn: 1,
      locale: dateFnsLocale,
    })
    const calendarEnd = endOfWeek(monthEnd, {
      weekStartsOn: 1,
      locale: dateFnsLocale,
    })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [date, dateFnsLocale])

  // Get weekday headers (Mo, Tu, We, etc.)
  const weekDayHeaders = useMemo(() => {
    const firstWeek = calendarDays.slice(0, 7)
    return firstWeek.map((day) =>
      format(day, 'EEEEEE', { locale: dateFnsLocale })
    )
  }, [calendarDays, dateFnsLocale])

  // Check if a day has events
  const hasEventsOnDay = (day: Date) => {
    return events.some((event) => isSameDay(new Date(event.start), day))
  }

  // Navigation handlers
  const handlePreviousMonth = () => {
    onNavigate(subMonths(date, 1))
  }

  const handleNextMonth = () => {
    onNavigate(addMonths(date, 1))
  }

  return (
    <div className="bg-background flex shrink-0 flex-col gap-3 border-b p-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold">
          {format(date, 'MMMM yyyy', { locale: dateFnsLocale })}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekDayHeaders.map((dayName, index) => (
          <div
            key={`header-${index}`}
            className="text-muted-foreground flex h-8 items-center justify-center text-xs font-medium"
          >
            {dayName}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const isToday = isSameDay(day, new Date())
          const isSelected = isSameDay(day, date)
          const isCurrentMonth = isSameMonth(day, date)
          const hasEvents = hasEventsOnDay(day)

          return (
            <button
              key={`day-${index}`}
              onClick={() => onDateSelect(day)}
              className={cn(
                'relative flex h-10 flex-col items-center justify-center rounded-md text-sm transition-colors',
                // Current month vs other months
                isCurrentMonth
                  ? 'text-foreground'
                  : 'text-muted-foreground opacity-40',
                // Today highlight
                isToday && 'bg-primary text-primary-foreground font-bold',
                // Selected day
                isSelected &&
                  !isToday &&
                  'bg-accent text-accent-foreground font-semibold',
                // Hover state
                'hover:bg-accent/50',
                // Disabled for other months
                !isCurrentMonth && 'cursor-default hover:bg-transparent'
              )}
              disabled={!isCurrentMonth}
            >
              {format(day, 'd')}

              {/* Event indicator dot */}
              {hasEvents && isCurrentMonth && (
                <div
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    isToday
                      ? 'bg-primary-foreground'
                      : isSelected
                        ? 'bg-accent-foreground'
                        : 'bg-primary'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="bg-primary h-2 w-2 rounded-full" />
          <span>{t('today.string')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-primary h-1 w-1 rounded-full" />
          <span>{t('hasEvents.string')}</span>
        </div>
      </div>
    </div>
  )
}
