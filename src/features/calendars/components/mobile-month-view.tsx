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
import { useLocale } from 'next-intl'
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

  // Handle day click - navigate to month if clicking on a day from another month
  const handleDayClick = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, date)
    if (!isCurrentMonth) {
      // Navigate to the month of the clicked day
      onNavigate(day)
    }
    // Always select the clicked day
    onDateSelect(day)
  }

  // Navigation handlers
  const handlePreviousMonth = () => {
    onNavigate(subMonths(date, 1))
  }

  const handleNextMonth = () => {
    onNavigate(addMonths(date, 1))
  }

  return (
    <div className="bg-background flex shrink-0 flex-col gap-3 border-b p-4 overflow-hidden">
      {/* Header with month navigation */}
      <div className="flex items-center justify-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8 shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 overflow-hidden">
        {/* Weekday headers */}
        {weekDayHeaders.map((dayName, index) => (
          <div
            key={`header-${index}`}
            className="text-muted-foreground flex h-8 items-center justify-center text-xs font-medium min-w-0 truncate"
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
              onClick={() => handleDayClick(day)}
              className={cn(
                'relative flex h-10 w-full flex-col items-center justify-center rounded-md text-sm transition-colors min-w-0',
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
                // Hover state - allow hover even for other months
                'hover:bg-accent/50 cursor-pointer'
              )}
              aria-label={format(day, 'EEEE, MMMM d, yyyy', { locale: dateFnsLocale })}
            >
              <span className="truncate w-full text-center">
                {format(day, 'd')}
              </span>

              {/* Event indicator dot - show for all months */}
              {hasEvents && (
                <div
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full shrink-0',
                    isToday
                      ? 'bg-primary-foreground'
                      : isSelected
                        ? 'bg-accent-foreground'
                        : 'bg-primary'
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
