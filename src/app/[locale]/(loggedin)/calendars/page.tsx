'use client'

import { CalendarToolbar } from '@/features/calendars/components/calendar-toolbar'
import CalendarView from '@/features/calendars/components/calendar-view'
import { useCalendarState } from '@/features/calendars/hooks/useCalendarState'
import { useCalendarVisibility } from '@/features/calendars/hooks/useCalendarVisibility'
import { useMemo } from 'react'

const CalendarPage = () => {
  const calendarState = useCalendarState()
  const { isCalendarVisible } = useCalendarVisibility()

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
      <div className="flex-1 overflow-hidden">
        {' '}
        {/* ← AJOUTER CE WRAPPER */}
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
      </div>
    </main>
  )
}

export default CalendarPage
