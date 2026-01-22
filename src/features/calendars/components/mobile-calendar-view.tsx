'use client'

import { useIsMobile } from '@/hooks/useMediaQuery'
import { MobileDayView } from './mobile-day-view'
import { MobileMonthView } from './mobile-month-view'
import { MobileWeekView } from './mobile-week-view'
import type { View } from 'react-big-calendar'
import { Views } from 'react-big-calendar'
import type { CalendarEvent } from '@/features/calendars'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

interface MobileCalendarViewProps {
  view: View
  date: Date
  events: CalendarEventWithDate[]
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string
  onNavigate: (date: Date) => void
  onViewChange: (view: View) => void
}

export function MobileCalendarView({
  view,
  date,
  events,
  calendarColorMap,
  defaultColor,
  onNavigate,
  onViewChange,
}: MobileCalendarViewProps) {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <div className="flex h-full flex-col">
      {/* Month view: calendar grid only */}
      {view === Views.MONTH && (
        <div className="flex-1 overflow-hidden">
          <MobileMonthView
            date={date}
            events={events}
            onDateSelect={onNavigate}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* Week view: week selector + selected day details */}
      {view === Views.WEEK && (
        <div className="flex h-full flex-col">
          {/* Week selector (horizontal scroll) */}
          <div className="shrink-0">
            <MobileWeekView
              date={date}
              events={events}
              calendarColorMap={calendarColorMap}
              defaultColor={defaultColor}
              onDateSelect={onNavigate}
            />
          </div>

          {/* Selected day details (scrollable) */}
          <div className="flex-1 overflow-hidden">
            <MobileDayView
              date={date}
              events={events}
              calendarColorMap={calendarColorMap}
              defaultColor={defaultColor}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}

      {/* Day view: day details only (with swipe navigation) */}
      {view === Views.DAY && (
        <div className="flex-1 overflow-hidden">
          <MobileDayView
            date={date}
            events={events}
            calendarColorMap={calendarColorMap}
            defaultColor={defaultColor}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  )
}
