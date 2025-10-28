'use client'

import ShadcnBigCalendar from '@/components/calendar'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { type CalendarEvent } from '@/features/calendars'
import { AgendaView } from '@/features/calendars/components/agenda-view'
import { EventForm } from '@/features/calendars/components/event-form'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import * as locales from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import {
  dateFnsLocalizer,
  SlotInfo,
  View,
  Views,
  type DateLocalizer,
} from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const DnDCalendar = withDragAndDrop(ShadcnBigCalendar)

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
}

interface CalendarViewProps {
  view: View
  date: Date
  events: CalendarEventWithDate[]
  selectedSlot: SlotInfo | null
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string

  onViewChange: (_view: View) => void
  onNavigate: (_date: Date) => void
  onSelectSlot: (_slot: SlotInfo) => void
  onSelectedSlotClose: () => void
  onCreateEvent: (_data: { title: string; start: string; end: string }) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEventDrop: (_args: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEventResize: (_args: any) => void
}

export default function CalendarView({
  view,
  date,
  events,
  selectedSlot,
  calendarColorMap,
  defaultColor,
  onViewChange,
  onNavigate,
  onSelectSlot,
  onSelectedSlotClose,
  onCreateEvent,
  onEventDrop,
  onEventResize,
}: CalendarViewProps) {
  const t = useTranslations('CALENDARS')
  // Apply event colors based on their calendar
  useEffect(() => {
    const style = document.createElement('style')
    let cssRules = `
      .rbc-slot-selection {
        background-color: ${defaultColor} !important;
      }
    `

    // Generate CSS rules for each event based on calendar color
    Object.entries(calendarColorMap).forEach(([calendarId, color]) => {
      cssRules += `
        .rbc-event[data-calendar-id="${calendarId}"] {
          background-color: ${color} !important;
          border-color: ${color} !important;
        }
      `
    })

    style.innerHTML = cssRules
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [defaultColor, calendarColorMap])

  // Function to get event style based on calendar color
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventStyleGetter = (event: any) => {
    const calendarColor = calendarColorMap[event.calendar_id] || defaultColor
    return {
      style: {
        backgroundColor: calendarColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: '#fff',
        border: `1px solid ${calendarColor}`,
        display: 'block',
      },
    }
  }

  return (
    <>
      <Dialog open={selectedSlot !== null} onOpenChange={onSelectedSlotClose}>
        <DialogContent>
          <DialogHeader>
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t('calendar.createEvent.string')}
            </h2>
          </DialogHeader>
          {selectedSlot && (
            <EventForm
              start={selectedSlot.start}
              end={selectedSlot.end}
              onSubmit={onCreateEvent}
              onCancel={onSelectedSlotClose}
            />
          )}
        </DialogContent>
      </Dialog>
      {view === Views.AGENDA ? (
        <div className="flex-1 overflow-hidden">
          <AgendaView
            events={events}
            date={date}
            calendarColorMap={calendarColorMap}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DnDCalendar
            localizer={localizer}
            selectable
            date={date}
            onNavigate={onNavigate}
            view={view}
            onView={onViewChange}
            resizable
            draggableAccessor={() => true}
            resizableAccessor={() => true}
            events={events}
            onSelectSlot={onSelectSlot}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            eventPropGetter={eventStyleGetter}
            toolbar={false}
            formats={{
              timeGutterFormat: (
                date: Date,
                culture: string | undefined,
                localizer: DateLocalizer | undefined
              ) => (localizer ? localizer.format(date, 'h a', culture) : ''),
              eventTimeRangeFormat: (
                { start, end }: { start: Date; end: Date },
                culture: string | undefined,
                localizer: DateLocalizer | undefined
              ) =>
                localizer
                  ? `${localizer.format(start, 'h:mm a', culture)} – ${localizer.format(end, 'h:mm a', culture)}`
                  : '',
              agendaTimeRangeFormat: (
                { start, end }: { start: Date; end: Date },
                culture: string | undefined,
                localizer: DateLocalizer | undefined
              ) =>
                localizer
                  ? `${localizer.format(start, 'h:mm a', culture)} – ${localizer.format(end, 'h:mm a', culture)}`
                  : '',
            }}
          />
        </div>
      )}
    </>
  )
}
