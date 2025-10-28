'use client'

import { CalendarToolbar } from '@/features/calendars/components/calendar-toolbar'
import CalendarView from '@/features/calendars/components/calendar-view'
import { useCalendarState } from '@/features/calendars/hooks/useCalendarState'
import { useCalendarVisibility } from '@/features/calendars/hooks/useCalendarVisibility'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'

const CalendarPage = () => {
  const locale = useLocale()
  const calendarState = useCalendarState()
  const { isCalendarVisible } = useCalendarVisibility()

  // Filter events based on calendar visibility, but keep them in store
  const visibleEvents = useMemo(() => {
    return calendarState.events.filter((event) =>
      isCalendarVisible(event.calendar_id)
    )
  }, [calendarState.events, isCalendarVisible])

  return (
    <main className="flex h-screen w-full flex-col">
      <div className="shrink-0">
        <CalendarToolbar
          view={calendarState.view}
          date={calendarState.date}
          locale={locale}
          onViewChange={calendarState.handleViewChange}
          onNavigatePrevious={calendarState.navigateToPrevious}
          onNavigateToday={calendarState.navigateToToday}
          onNavigateNext={calendarState.navigateToNext}
          onCreateEvent={() =>
            calendarState.setSelectedSlot({
              start: new Date(),
              end: new Date(),
              slots: [],
              action: 'click',
            })
          }
          timezone={calendarState.timezone}
          onTimezoneChange={calendarState.setTimezone}
        />
      </div>
      <CalendarView
        view={calendarState.view}
        date={calendarState.date}
        events={visibleEvents}
        selectedSlot={calendarState.selectedSlot}
        calendarColorMap={calendarState.calendarColorMap}
        defaultColor={calendarState.defaultColor}
        onViewChange={calendarState.handleViewChange}
        onNavigate={calendarState.handleNavigate}
        onSelectSlot={calendarState.handleSelectSlot}
        onSelectedSlotClose={() => calendarState.setSelectedSlot(null)}
        onCreateEvent={calendarState.handleCreateEvent}
        onEventDrop={calendarState.handleEventDrop}
        onEventResize={calendarState.handleEventResize}
      />
    </main>
  )
}

export default CalendarPage
