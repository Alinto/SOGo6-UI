'use client'

import { useGetCalendarsQuery } from '@/features/calendars'
import { clearCreateEventRequest } from '@/features/calendars/store/calendar-ui-slice'
import { isCalendarWritable } from '@/features/calendars/utils/is-calendar-writable'
import { pickPreferredCalendar } from '@/features/calendars/utils/pick-preferred-calendar'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { memo, useEffect, useState } from 'react'
import type { SlotInfo } from 'react-big-calendar'
import EventCreateDialog from './event-create-dialog'

interface EventDraft {
  slot: SlotInfo
  calendarKey: string
}

function EventCreateHost() {
  const dispatch = useAppDispatch()
  const requested = useAppSelector(
    (state) => state.calendarUi.createEventRequested
  )
  const { data: calendars, isLoading } = useGetCalendarsQuery()
  const [draft, setDraft] = useState<EventDraft | null>(null)
  const [seenRequest, setSeenRequest] = useState(false)
  const ready = !isLoading && calendars !== undefined

  if (ready && requested && !seenRequest) {
    setSeenRequest(true)
    const preferred = pickPreferredCalendar(calendars)
    const calendarKey = preferred?.key ?? preferred?.id
    if (calendarKey && isCalendarWritable(preferred)) {
      const now = new Date()
      setDraft({
        slot: {
          start: now,
          end: now,
          slots: [],
          action: 'click',
        },
        calendarKey,
      })
    }
  }

  if (!requested && seenRequest) {
    setSeenRequest(false)
  }

  useEffect(() => {
    if (!ready || !requested) return
    dispatch(clearCreateEventRequest())
  }, [dispatch, ready, requested])

  return (
    <EventCreateDialog
      selectedSlot={draft?.slot ?? null}
      calendarKey={draft?.calendarKey ?? ''}
      calendars={calendars ?? []}
      onClose={() => setDraft(null)}
    />
  )
}

export default memo(EventCreateHost)
