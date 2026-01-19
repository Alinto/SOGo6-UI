'use client'

import ShadcnBigCalendar from '@/components/calendar'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { type CalendarEvent } from '@/features/calendars'
import { AgendaView } from '@/features/calendars/components/agenda-view'
import { EventForm } from '@/features/calendars/components/event-form'
import { MobileCalendarView } from '@/features/calendars/components/mobile-calendar-view'
import { MobileMonthView } from '@/features/calendars/components/mobile-month-view' // ← AJOUTER
import { MobileWeekView } from '@/features/calendars/components/mobile-week-view'
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

  useEffect(() => {
    const style = document.createElement('style')
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
      document.head.removeChild(style)
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
        <Dialog open={selectedSlot !== null} onOpenChange={onSelectedSlotClose}>
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
                onSubmit={onCreateEvent}
                onCancel={onSelectedSlotClose}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Contextual top view based on desktop view mode */}
        {view === Views.MONTH && (
          <MobileMonthView
            date={date}
            events={events}
            onDateSelect={onNavigate}
            onNavigate={onNavigate}
          />
        )}

        {view === Views.WEEK && (
          <MobileWeekView
            date={date}
            events={events}
            calendarColorMap={calendarColorMap}
            defaultColor={defaultColor}
            onDateSelect={onNavigate}
          />
        )}

        {/* Bottom detail view */}
        <div className="flex-1 overflow-hidden">
          {view === Views.AGENDA ? (
            <AgendaView
              events={events}
              date={date}
              calendarColorMap={calendarColorMap}
            />
          ) : (
            <MobileCalendarView
              date={date}
              events={events}
              calendarColorMap={calendarColorMap}
              defaultColor={defaultColor}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>
    )
  }

  // Desktop view rendering
  return (
    <div className="flex h-full flex-col">
      <Dialog open={selectedSlot !== null} onOpenChange={onSelectedSlotClose}>
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
