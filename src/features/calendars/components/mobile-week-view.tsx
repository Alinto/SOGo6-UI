'use client'

import { type CalendarEvent } from '@/features/calendars'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
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
  const t = useTranslations('CALENDARS.mobile')
  const locale = useLocale()
  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [date])

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
    <div className="w-full">
      {/* Outer wrapper - Safari needs explicit width */}
      <div 
        style={{
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden',
        }}
      >
        {/* Scroll container - Safari iOS specific */}
        <div
          style={{
            overflowX: 'scroll',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            touchAction: 'pan-x',
            cursor: 'grab',
          }}
        >
          {/* Inner flex container - force horizontal layout */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '16px',
              width: 'max-content',
              minWidth: '100%',
            }}
          >
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isToday = isSameDay(day, today)
              const isSelected = isSameDay(day, date)
              const dayLabel = format(day, 'EEEE d MMMM', { locale: dateFnsLocale })

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateSelect(day)}
                  aria-label={dayLabel}
                  aria-pressed={isSelected}
                  style={{
                    minWidth: '70px',
                    width: '70px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    borderColor: isSelected
                      ? 'hsl(var(--primary))'
                      : isToday
                      ? 'hsl(var(--primary) / 0.5)'
                      : 'hsl(var(--border))',
                    backgroundColor: isSelected
                      ? 'hsl(var(--primary) / 0.1)'
                      : 'transparent',
                  }}
                >
                  {/* Day name */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: 'hsl(var(--muted-foreground))',
                      width: '100%',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {format(day, 'EEE', { locale: dateFnsLocale })}
                  </span>

                  {/* Day number */}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      backgroundColor: isToday
                        ? 'hsl(var(--primary))'
                        : 'transparent',
                      color: isToday
                        ? 'hsl(var(--primary-foreground))'
                        : 'inherit',
                    }}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        maxWidth: '100%',
                      }}
                      aria-label={`${dayEvents.length} events`}
                    >
                      {dayEvents.slice(0, 3).map((event, idx) => {
                        const color =
                          calendarColorMap[event.calendar_id] || defaultColor
                        return (
                          <div
                            key={`${event.id}-${idx}`}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              flexShrink: 0,
                            }}
                            aria-hidden="true"
                          />
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--muted-foreground))',
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator for mobile */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          marginTop: '8px',
          padding: '0 16px',
        }}
      >
        {t('swipeHint.string')}
      </div>
    </div>
  )
}
