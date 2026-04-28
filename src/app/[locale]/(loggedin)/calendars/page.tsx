'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { type CalendarEvent } from '@/features/calendars'
import { CalendarToolbar } from '@/features/calendars/components/calendar-toolbar'
import CalendarView from '@/features/calendars/components/calendar-view'
import Visualization from '@/features/calendars/components/visualization'
import { useCalendarState } from '@/features/calendars/hooks/useCalendarState'
import { useCalendarVisibility } from '@/features/calendars/hooks/useCalendarVisibility'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { memo, useMemo, useState } from 'react'

const CalendarPage = () => {
  const t = useTranslations('CALENDARS')
  const calendarState = useCalendarState()
  const { isCalendarVisible } = useCalendarVisibility()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const visibleEvents = useMemo(() => {
    return calendarState.events.filter((event) =>
      isCalendarVisible(event.calendar_id ?? '')
    )
  }, [calendarState.events, isCalendarVisible])

  const handleDeleteSelectedEvent = async () => {
    if (!selectedEvent) return

    try {
      await calendarState.handleDeleteEvent(selectedEvent)
      setSelectedEvent(null)
    } catch {
      // Event mutation notifications are handled by RTK Query.
    }
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-x-hidden">
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
        <CalendarView
          view={calendarState.view}
          date={calendarState.date}
          events={visibleEvents}
          selectedSlot={calendarState.selectedSlot}
          calendarColorMap={calendarState.calendarColorMap}
          defaultColor={calendarState.defaultColor}
          defaultCalendarId={
            calendarState.defaultCalendar?.key ?? calendarState.defaultCalendar?.id
          }
          onViewChange={calendarState.handleViewChange}
          onNavigate={calendarState.handleNavigate}
          onSelectSlot={calendarState.handleSelectSlot}
          onSelectedSlotClose={() => calendarState.setSelectedSlot(null)}
          onSelectEvent={(event) => setSelectedEvent(event)}
          onDeleteEvent={calendarState.handleDeleteEvent}
          onEventDrop={calendarState.handleEventDrop}
          onEventResize={calendarState.handleEventResize}
        />
      </div>
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null)
        }}
      >
        <DialogContent className={cn('max-h-[90vh] overflow-y-auto sm:max-w-2xl')}>
          {selectedEvent && (
            <>
              <DialogTitle className={cn('sr-only')}>
                {selectedEvent.title}
              </DialogTitle>
              <Visualization data={selectedEvent} />
              <div className={cn('mt-4 flex justify-end')}>
                <Button variant="destructive" onClick={handleDeleteSelectedEvent}>
                  {t('forms.deleteCalendar.confirm.string')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default memo(CalendarPage)
