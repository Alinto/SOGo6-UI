'use client'

import ShadcnBigCalendar from '@/components/calendar'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { type CalendarEvent } from '@/features/calendars'
import { AgendaView } from '@/features/calendars/components/agenda-view'
import { EventForm } from '@/features/calendars/components/event-form'
import { MobileCalendarView } from '@/features/calendars/components/mobile-calendar-view'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
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
}

const DnDCalendar = withDragAndDrop<CalendarEventWithDate>(ShadcnBigCalendar)

interface CalendarViewProps {
  view: View
  date: Date
  events: CalendarEventWithDate[]
  selectedSlot: SlotInfo | null
  calendarColorMap: Record<string, string | undefined>
  defaultColor: string

  onViewChange: (view: View) => void
  onNavigate: (date: Date) => void
  onSelectSlot: (slot: SlotInfo) => void
  onSelectedSlotClose: () => void
  onCreateEvent: (data: { title: string; start: string; end: string }) => void
  onEventDrop: (args: EventInteractionArgs<CalendarEventWithDate>) => void
  onEventResize: (args: EventInteractionArgs<CalendarEventWithDate>) => void
}

// Extracted dialog component to avoid duplication
function EventDialog({
  selectedSlot,
  onClose,
  onSubmit,
}: {
  selectedSlot: SlotInfo | null
  onClose: () => void
  onSubmit: (data: { title: string; start: string; end: string }) => void
}) {
  const t = useTranslations('CALENDARS')

  return (
    <Dialog open={selectedSlot !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t('events.create.string')}
          </h2>
        </DialogHeader>
        {selectedSlot && (
          <EventForm
            start={selectedSlot.start}
            end={selectedSlot.end}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
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
  const locale = useLocale()
  const isMobile = useIsMobile()

  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format: (date: Date, formatStr: string) =>
          format(date, formatStr, { locale: dateFnsLocale }),
        parse: (dateStr: string, formatStr: string) =>
          parse(dateStr, formatStr, new Date(), { locale: dateFnsLocale }),
        startOfWeek: (date: Date) =>
          startOfWeek(date, { locale: dateFnsLocale }),
        getDay,
        locales: { [locale]: dateFnsLocale },
      }),
    [locale, dateFnsLocale]
  )

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

  // Mobile view rendering
  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <EventDialog
          selectedSlot={selectedSlot}
          onClose={onSelectedSlotClose}
          onSubmit={onCreateEvent}
        />

        {view === Views.AGENDA ? (
          <div className="flex-1 overflow-hidden">
            <AgendaView
              events={events}
              date={date}
              calendarColorMap={calendarColorMap}
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
        onClose={onSelectedSlotClose}
        onSubmit={onCreateEvent}
      />

      {view === Views.AGENDA ? (
        <div className="flex-1 overflow-hidden">
          <AgendaView
            events={events}
            date={date}
            calendarColorMap={calendarColorMap}
          />
        </div>
      ) : (
        <div className="flex h-full flex-1 flex-col overflow-hidden">
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
      )}
    </div>
  )
}
