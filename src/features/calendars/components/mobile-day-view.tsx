'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type CalendarEvent } from '@/features/calendars'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { cn } from '@/lib/utils'
import { useDrag } from '@use-gesture/react'
import { addDays, format, startOfDay, subDays } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useRef, useState } from 'react'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

interface MobileDayViewProps {
  date: Date
  events: CalendarEventWithDate[]
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string
  onNavigate: (date: Date) => void
  onEventClick?: (event: CalendarEventWithDate) => void
}

export function MobileDayView({
  date,
  events,
  calendarColorMap,
  defaultColor,
  onNavigate,
  onEventClick,
}: MobileDayViewProps) {
  const t = useTranslations('CALENDARS.mobile')
  const locale = useLocale()
  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
    null
  )
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter events for current day (memoized for performance)
  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = startOfDay(new Date(event.start))
      const currentDate = startOfDay(date)
      return eventDate.getTime() === currentDate.getTime()
    })
  }, [events, date])

  // Swipe gesture handler
  const bind = useDrag(
    ({ movement: [mx], direction: [xDir], velocity: [vx], last }) => {
      if (!last) return

      // Trigger swipe if velocity is high or movement is significant
      const shouldSwipe = Math.abs(mx) > 50 || vx > 0.5

      if (shouldSwipe) {
        if (xDir < 0) {
          // Swipe left: next day
          setSwipeDirection('left')
          setTimeout(() => {
            onNavigate(addDays(date, 1))
            setSwipeDirection(null)
          }, 150)
        } else {
          // Swipe right: previous day
          setSwipeDirection('right')
          setTimeout(() => {
            onNavigate(subDays(date, 1))
            setSwipeDirection(null)
          }, 150)
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  )

  return (
    <div className="bg-background h-full overflow-hidden" ref={containerRef}>
      <AnimatePresence mode="wait">
        {/* Wrapper div for gesture handlers (no animation) */}
        <div {...bind()} className="h-full" style={{ touchAction: 'pan-y' }}>
          {/* Motion div for animations (no gesture handlers) */}
          <motion.div
            key={date.toISOString()}
            initial={{
              opacity: 0,
              x: swipeDirection === 'left' ? 100 : -100,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection === 'left' ? -100 : 100 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full overflow-y-auto p-4"
          >
            {/* Date header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {format(date, 'd', { locale: dateFnsLocale })}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {format(date, 'EEEE, MMMM yyyy', { locale: dateFnsLocale })}
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {dayEvents.length}{' '}
                {dayEvents.length === 1 ? t('event.string') : t('event.plural')}
              </Badge>
            </div>

            {/* Events list */}
            {dayEvents.length === 0 ? (
              <div className="text-muted-foreground flex h-[50vh] flex-col items-center justify-center text-center">
                <Calendar className="mb-2 h-12 w-12 opacity-20" />
                <p>{t('noEvents.string')}</p>
                <p className="mt-1 text-sm">{t('swipeToChangeDay.string')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents
                  .sort(
                    (a, b) =>
                      new Date(a.start).getTime() - new Date(b.start).getTime()
                  )
                  .map((event) => {
                    const color =
                      calendarColorMap[event.calendar_id] || defaultColor
                    const startTime = new Date(event.start)
                    const endTime = new Date(event.end)

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={cn(
                            'border-l-4 transition-shadow hover:shadow-md',
                            onEventClick && 'cursor-pointer'
                          )}
                          style={{ borderLeftColor: color }}
                          onClick={() => onEventClick?.(event)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Color indicator */}
                              <div
                                className="mt-1 h-10 w-1 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                              />

                              {/* Event content */}
                              <div className="flex-1 space-y-1">
                                <h3 className="leading-tight font-medium">
                                  {event.title}
                                </h3>

                                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {format(startTime, 'HH:mm', {
                                      locale: dateFnsLocale,
                                    })}{' '}
                                    {t('timeSeparator.string')}{' '}
                                    {format(endTime, 'HH:mm', {
                                      locale: dateFnsLocale,
                                    })}
                                  </span>
                                </div>

                                {event.description && (
                                  <p className="text-muted-foreground line-clamp-2 text-sm">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
              </div>
            )}

            {/* Swipe hint */}
            <div className="text-muted-foreground mt-6 text-center text-xs">
              {t('swipeToNavigate.string')}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  )
}
