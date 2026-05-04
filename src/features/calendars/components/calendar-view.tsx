'use client'

import ShadcnBigCalendar from '@/components/calendar'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { type Calendar, type CalendarEvent } from '@/features/calendars'
import { AgendaView } from '@/features/calendars/components/agenda-view'
import { EventForm } from '@/features/calendars/components/event-form'
import { MobileCalendarView } from '@/features/calendars/components/mobile-calendar-view'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { DATE_LOCALES } from '@/lib/i18n/date-locales'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useEffect } from 'react'
import {
  dateFnsLocalizer,
  type DateLocalizer,
  type SlotInfo,
  type View,
  Views,
} from 'react-big-calendar'
import withDragAndDrop, {
  type EventInteractionArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

type CalendarEventWithDate = CalendarEvent & {
  start: Date
  end: Date
  allDay: boolean
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: DATE_LOCALES,
})

const DnDCalendar = withDragAndDrop<CalendarEventWithDate>(ShadcnBigCalendar)

const calendarSlotSelectionGuardComponents = {
  week: {
    header: ({ label }: { date: Date; label: string }) => (
      <div
        className="rbc-header-content"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {label}
      </div>
    ),
  },
  month: {
    dateHeader: ({ label }: { date: Date; label: string }) => (
      <span
        className="sogo-month-date-header"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {label}
      </span>
    ),
  },
}

interface CalendarViewProps {
  view: View
  date: Date
  events: CalendarEventWithDate[]
  selectedSlot: SlotInfo | null
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string
  defaultCalendarId?: string
  calendars: Calendar[]

  onViewChange: (view: View) => void
  onNavigate: (date: Date) => void
  onSelectSlot: (slot: SlotInfo) => void
  onSelectedSlotClose: () => void
  onSelectEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (event: CalendarEventWithDate) => Promise<void>
  onEventDrop: (args: EventInteractionArgs<CalendarEventWithDate>) => void
  onEventResize: (args: EventInteractionArgs<CalendarEventWithDate>) => void
}

// Extracted dialog component to avoid duplication
function EventDialog({
  selectedSlot,
  calendarKey,
  calendars,
  onClose,
}: {
  selectedSlot: SlotInfo | null
  calendarKey: string
  calendars: Calendar[]
  onClose: () => void
}) {
  const t = useTranslations('CALENDARS')

  return (
    <Dialog open={selectedSlot !== null} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t('events.create.string')}
          </h2>
        </DialogHeader>
        {selectedSlot && (
          <EventForm
            calendarKey={calendarKey}
            calendars={calendars}
            start={selectedSlot.start}
            end={selectedSlot.end}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CalendarView({
  view,
  date,
  events,
  selectedSlot,
  calendarColorMap,
  defaultColor,
  defaultCalendarId,
  calendars,
  onViewChange,
  onNavigate,
  onSelectSlot,
  onSelectedSlotClose,
  onSelectEvent,
  onEventDrop,
  onEventResize,
}: CalendarViewProps) {
  const locale = useLocale()
  const isMobile = useIsMobile()

  // Inject dynamic CSS for calendar colors
  useEffect(() => {
    const STYLE_ID = 'calendar-colors-style'

    // Remove existing style if present
    const existingStyle = document.getElementById(STYLE_ID)
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = STYLE_ID

    let cssRules = `
      .rbc-slot-selection {
        background-color: ${defaultColor} !important;
      }
    `

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
      const styleToRemove = document.getElementById(STYLE_ID)
      if (styleToRemove) {
        styleToRemove.remove()
      }
    }
  }, [defaultColor, calendarColorMap])

  const eventStyleGetter = (event: CalendarEventWithDate) => {
    const color =
      event.color || calendarColorMap[event.calendar_id ?? ''] || defaultColor

    return {
      style: {
        backgroundColor: color,
        borderRadius: '4px',
        opacity: event.status === 'cancelled' ? 0.5 : 0.9,
        color: '#fff',
        border: `1px solid ${color}`,
        display: 'block',
        textDecoration: event.status === 'cancelled' ? 'line-through' : 'none',
      },
    }
  }

  // Mobile view rendering
  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <EventDialog
          selectedSlot={selectedSlot}
          calendarKey={defaultCalendarId ?? ''}
          calendars={calendars}
          onClose={onSelectedSlotClose}
        />

        {view === Views.AGENDA ? (
          <div className="flex-1 overflow-hidden">
            <AgendaView
              events={events}
              date={date}
              calendarColorMap={calendarColorMap}
              onEventClick={onSelectEvent}
            />
          </div>
        ) : (
          <MobileCalendarView
            view={view}
            date={date}
            events={events}
            calendarColorMap={calendarColorMap}
            defaultColor={defaultColor}
            onNavigate={onNavigate}
            onViewChange={onViewChange}
            onEventClick={onSelectEvent}
          />
        )}
      </div>
    )
  }

  // Desktop view rendering
  return (
    <div className="flex h-full flex-col">
      <EventDialog
        selectedSlot={selectedSlot}
        calendarKey={defaultCalendarId ?? ''}
        calendars={calendars}
        onClose={onSelectedSlotClose}
      />

      {view === Views.AGENDA ? (
        <div className="flex-1 overflow-hidden">
          <AgendaView
            events={events}
            date={date}
            calendarColorMap={calendarColorMap}
            onEventClick={onSelectEvent}
          />
        </div>
      ) : (
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="sogo-calendar-wrapper h-full min-h-0 w-full flex-1">
            <DnDCalendar
              localizer={localizer}
              style={{ height: '100%' }}
              components={calendarSlotSelectionGuardComponents}
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
              onSelectEvent={onSelectEvent}
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              eventPropGetter={eventStyleGetter}
              toolbar={false}
              culture={locale}
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
        </div>
      )}
    </div>
  )
}

export default memo(CalendarView)
