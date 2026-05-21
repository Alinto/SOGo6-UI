'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type CalendarEvent,
  useDeleteCalendarEventMutation,
  useGetCalendarEventByIdQuery,
} from '@/features/calendars'
import {
  eventNeedsRecurrenceScope,
  RecurrenceScopeDialog,
  type RecurrenceScope,
} from '@/features/calendars/components/recurrence-scope-dialog'
import { CalendarToolbar } from '@/features/calendars/components/calendar-toolbar'
import CalendarView from '@/features/calendars/components/calendar-view'
import { EventForm } from '@/features/calendars/components/event-form'
import Visualization from '@/features/calendars/components/visualization'
import { useCalendarState } from '@/features/calendars/hooks/useCalendarState'
import { useCalendarVisibility } from '@/features/calendars/hooks/useCalendarVisibility'
import { registerCalendarEventSelection } from '@/features/calendars/calendar-event-selection-bridge'
import { clearCreateEventRequest } from '@/features/calendars/store/calendar-ui-slice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

/** Prefer first non-empty string; avoids losing list calendar when GET detail omits it. */
function pickNonEmptyCalendarRef(
  ...values: (string | null | undefined)[]
): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim().length > 0) {
      return v.trim()
    }
  }
  return ''
}

/** Merge API detail onto grid event so calendar_id from the list is kept when detail has null/empty. */
function mergeEventDetailWithListSelection(
  listEvent: CalendarEvent,
  detail: CalendarEvent | undefined
): CalendarEvent {
  if (!detail) return listEvent
  const calendarRef = pickNonEmptyCalendarRef(
    listEvent.calendar_id,
    listEvent.calendar_key,
    detail.calendar_id,
    detail.calendar_key
  )
  return {
    ...listEvent,
    ...detail,
    calendar_id:
      calendarRef || (listEvent.calendar_id ?? detail.calendar_id ?? null),
    calendar_key: calendarRef || listEvent.calendar_key || detail.calendar_key,
  }
}

const CalendarPage = () => {
  const t = useTranslations('CALENDARS')
  const calendarState = useCalendarState()
  const { isCalendarVisible } = useCalendarVisibility()
  const dispatch = useAppDispatch()
  const createEventRequested = useAppSelector(
    (state) => state.calendarUi.createEventRequested
  )
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [deleteScopeDialogOpen, setDeleteScopeDialogOpen] = useState(false)
  const [deleteCalendarEvent] = useDeleteCalendarEventMutation()

  const rawEventKey = selectedEvent?.key ?? selectedEvent?.id ?? null
  const eventKeyForQuery =
    typeof rawEventKey === 'string' && rawEventKey.length > 0
      ? rawEventKey
      : null

  const { data: detailedEvent, isFetching: isDetailFetching } =
    useGetCalendarEventByIdQuery(
      { eventKey: eventKeyForQuery ?? '' },
      { skip: eventKeyForQuery === null }
    )

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setDialogMode('view')
    setSelectedEvent(event)
  }, [])

  useEffect(() => {
    return registerCalendarEventSelection(handleSelectEvent)
  }, [handleSelectEvent])

  useEffect(() => {
    if (createEventRequested) {
      calendarState.setSelectedSlot({
        start: new Date(),
        end: new Date(),
        slots: [],
        action: 'click',
      })
      dispatch(clearCreateEventRequest())
    }
  }, [calendarState, createEventRequested, dispatch])

  const visibleEvents = useMemo(() => {
    return calendarState.events.filter((event) =>
      isCalendarVisible(event.calendar_id ?? '')
    )
  }, [calendarState.events, isCalendarVisible])

  const displayEvent = useMemo(() => {
    if (!selectedEvent) return null
    const merged = mergeEventDetailWithListSelection(selectedEvent, detailedEvent)
    if (detailedEvent?.attendees?.length) {
      return { ...merged, attendees: detailedEvent.attendees }
    }
    return merged
  }, [detailedEvent, selectedEvent])

  const eventCalendarKey = useMemo(() => {
    if (!selectedEvent) return ''
    const fromEvent = pickNonEmptyCalendarRef(
      selectedEvent.calendar_id,
      selectedEvent.calendar_key,
      detailedEvent?.calendar_id,
      detailedEvent?.calendar_key
    )
    if (fromEvent) return fromEvent
    return pickNonEmptyCalendarRef(
      calendarState.defaultCalendar?.key,
      calendarState.defaultCalendar?.id
    )
  }, [calendarState.defaultCalendar, detailedEvent, selectedEvent])

  const handleDeleteSelectedEvent = async (
    scope?: RecurrenceScope
  ) => {
    if (!selectedEvent) return

    const eventKey = selectedEvent.key ?? selectedEvent.id ?? selectedEvent.uid
    if (!eventKey) return

    try {
      if (scope && eventNeedsRecurrenceScope(selectedEvent)) {
        await deleteCalendarEvent({
          eventKey,
          recurrence_id: selectedEvent.recurrence_id ?? undefined,
          recurrence_range: scope,
        }).unwrap()
      } else {
        await calendarState.handleDeleteEvent(selectedEvent)
      }
      setSelectedEvent(null)
    } catch {
      // Event mutation notifications are handled by RTK Query.
    }
  }

  const handleDeleteWithScope = async (scope: RecurrenceScope) => {
    setDeleteScopeDialogOpen(false)
    await handleDeleteSelectedEvent(scope)
  }

  const handleConfirmDeleteClick = () => {
    if (!selectedEvent) return
    if (eventNeedsRecurrenceScope(selectedEvent)) {
      setDeleteScopeDialogOpen(true)
      return
    }
    void handleDeleteSelectedEvent()
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="shrink-0">
        <CalendarToolbar
          view={calendarState.view}
          date={calendarState.date}
          onViewChange={calendarState.handleViewChange}
          onNavigatePrevious={calendarState.navigateToPrevious}
          onNavigateToday={calendarState.navigateToToday}
          onNavigateNext={calendarState.navigateToNext}
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
          calendars={calendarState.calendarsData ?? []}
          defaultCalendarId={
            calendarState.defaultCalendar?.key ??
            calendarState.defaultCalendar?.id
          }
          onViewChange={calendarState.handleViewChange}
          onNavigate={calendarState.handleNavigate}
          onSelectSlot={calendarState.handleSelectSlot}
          onSelectedSlotClose={() => calendarState.setSelectedSlot(null)}
          onSelectEvent={handleSelectEvent}
          onDeleteEvent={calendarState.handleDeleteEvent}
          onEventDrop={calendarState.handleEventDrop}
          onEventResize={calendarState.handleEventResize}
        />
      </div>
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvent(null)
            setDialogMode('view')
          }
        }}
      >
        <DialogContent
          className={cn(
            'max-h-[90vh] sm:max-w-2xl',
            dialogMode === 'edit'
              ? 'flex min-h-0 flex-col gap-0 overflow-hidden p-0'
              : 'overflow-y-auto'
          )}
        >
          {selectedEvent && displayEvent && dialogMode === 'view' && (
            <>
              <DialogTitle className={cn('sr-only')}>
                {selectedEvent.title}
              </DialogTitle>
              {isDetailFetching && eventKeyForQuery !== null ? (
                <div className={cn('flex flex-col gap-3 p-4')}>
                  <Skeleton className={cn('h-4 w-full')} />
                  <Skeleton className={cn('h-4 w-3/4')} />
                  <Skeleton className={cn('h-4 w-1/2')} />
                </div>
              ) : (
                <Visualization data={displayEvent} />
              )}
              <div
                className={cn(
                  'mt-4 flex flex-wrap items-center justify-between gap-2'
                )}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDetailFetching && eventKeyForQuery !== null}
                  onClick={() => setDialogMode('edit')}
                >
                  <Pencil className={cn('mr-2 h-4 w-4')} />
                  {t('forms.editEvent.string')}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isDetailFetching && eventKeyForQuery !== null}
                    >
                      {t('forms.deleteEvent.confirm.button')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('forms.deleteEvent.confirm.title')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('forms.deleteEvent.confirm.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmDeleteClick}>
                        {t('forms.deleteEvent.confirm.button')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
          {selectedEvent && displayEvent && dialogMode === 'edit' && (
            <>
              <DialogHeader
                className={cn('shrink-0 border-b px-6 pt-6 pb-4')}
              >
                <DialogTitle
                  className={cn('text-xl font-semibold tracking-tight')}
                >
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div
                className={cn(
                  'flex min-h-0 flex-1 flex-col overflow-hidden'
                )}
              >
                <EventForm
                  key={eventKeyForQuery ?? 'edit-event'}
                  event={displayEvent}
                  calendarKey={eventCalendarKey}
                  calendars={calendarState.calendarsData ?? []}
                  onCancel={() => setDialogMode('view')}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <RecurrenceScopeDialog
        open={deleteScopeDialogOpen}
        mode="delete"
        onSelect={handleDeleteWithScope}
        onCancel={() => setDeleteScopeDialogOpen(false)}
      />
    </main>
  )
}

export default memo(CalendarPage)
