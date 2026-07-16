import { apiSlice } from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { CalendarEvent } from '../calendars-types'

/** apiSlice is typed with empty endpoints; injected names are not on util.updateQueryData. */
type UpdateQueryDataFn = <T>(
  endpointName: string,
  arg: unknown,
  updateRecipe: (draft: T) => void
) => UnknownAction

const updateQueryData = apiSlice.util
  .updateQueryData as unknown as UpdateQueryDataFn

export function eventMatchesKey(
  event: CalendarEvent,
  eventKey: string
): boolean {
  return (
    event.id === eventKey ||
    event.key === eventKey ||
    (event.uid != null && event.uid === eventKey)
  )
}

export type CachedEventsQueryEntry = {
  endpointName?: string
  originalArgs?: unknown
  data?: CalendarEvent[]
}

export function patchEventsInCachedQuery(
  dispatch: (action: UnknownAction) => void,
  entry: CachedEventsQueryEntry,
  eventKey: string,
  updatedEvent: CalendarEvent
) {
  if (!entry.originalArgs || !Array.isArray(entry.data)) return

  const patchFn = (draft: CalendarEvent[]) => {
    const idx = draft.findIndex((e) => eventMatchesKey(e, eventKey))
    if (idx >= 0) {
      draft[idx] = {
        ...draft[idx],
        ...updatedEvent,
        calendar_id: updatedEvent.calendar_id ?? draft[idx].calendar_id,
      }
    }
  }

  if (entry.endpointName === 'getEvents') {
    dispatch(
      updateQueryData<CalendarEvent[]>(
        'getEvents',
        entry.originalArgs as { startDate: string; endDate: string },
        patchFn
      )
    )
  } else if (entry.endpointName === 'getEventsInTimeRange') {
    dispatch(
      updateQueryData<CalendarEvent[]>(
        'getEventsInTimeRange',
        entry.originalArgs as {
          calendarIds: string[]
          startDate: string
          endDate: string
        },
        patchFn
      )
    )
  }
}

/** Keep grid/list caches in sync after drag/resize/attendance without waiting for refetch. */
export function patchEventInCachedTimeRangeQueries(
  dispatch: (action: UnknownAction) => void,
  getState: () => unknown,
  eventKey: string,
  updatedEvent: CalendarEvent
) {
  const apiState = (
    getState() as {
      api?: { queries?: Record<string, CachedEventsQueryEntry> }
    }
  ).api?.queries

  if (!apiState) return

  for (const entry of Object.values(apiState)) {
    if (
      entry?.endpointName !== 'getEvents' &&
      entry?.endpointName !== 'getEventsInTimeRange'
    ) {
      continue
    }

    patchEventsInCachedQuery(dispatch, entry, eventKey, updatedEvent)
  }
}
