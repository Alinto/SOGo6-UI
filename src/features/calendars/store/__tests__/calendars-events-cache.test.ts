import type { CalendarEvent } from '../../calendars-types'
import {
  eventMatchesKey,
  patchEventInCachedTimeRangeQueries,
  patchEventsInCachedQuery,
} from '../calendars-events-cache'

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    util: {
      updateQueryData: (
        endpointName: string,
        arg: unknown,
        recipe: (draft: CalendarEvent[]) => void
      ) => ({
        type: 'updateQueryData',
        endpointName,
        arg,
        recipe,
      }),
    },
  },
}))

const baseEvent: CalendarEvent = {
  id: 'evt-1',
  key: 'evt-1',
  uid: 'uid-1',
  calendar_id: 'cal-1',
  title: 'Meeting',
  all_day: false,
  date_start: '2026-07-16T10:00:00.000Z',
  date_end: '2026-07-16T11:00:00.000Z',
}

describe('calendars-events-cache', () => {
  describe('eventMatchesKey', () => {
    it('matches by id, key, or uid', () => {
      expect(eventMatchesKey(baseEvent, 'evt-1')).toBe(true)
      expect(eventMatchesKey({ ...baseEvent, id: 'other' }, 'evt-1')).toBe(true)
      expect(eventMatchesKey(baseEvent, 'uid-1')).toBe(true)
      expect(eventMatchesKey(baseEvent, 'missing')).toBe(false)
    })
  })

  describe('patchEventInCachedTimeRangeQueries', () => {
    it('patches every getEvents cache that contains the event', () => {
      const weekEvents = [{ ...baseEvent }]
      const monthEvents = [{ ...baseEvent }]
      const drafts = new Map<string, CalendarEvent[]>([
        ['week', weekEvents],
        ['month', monthEvents],
      ])
      const dispatch = jest.fn(
        (action: {
          arg?: { startDate: string }
          recipe?: (d: CalendarEvent[]) => void
        }) => {
          if (action.recipe && action.arg?.startDate === 'week') {
            action.recipe(drafts.get('week')!)
          }
          if (action.recipe && action.arg?.startDate === 'month') {
            action.recipe(drafts.get('month')!)
          }
          return action
        }
      )

      const updated: CalendarEvent = {
        ...baseEvent,
        date_start: '2026-07-17T10:00:00.000Z',
        date_end: '2026-07-17T11:00:00.000Z',
      }

      patchEventInCachedTimeRangeQueries(
        dispatch,
        () => ({
          api: {
            queries: {
              week: {
                endpointName: 'getEvents',
                originalArgs: { startDate: 'week', endDate: 'week-end' },
                data: weekEvents,
              },
              month: {
                endpointName: 'getEvents',
                originalArgs: { startDate: 'month', endDate: 'month-end' },
                data: monthEvents,
              },
              other: {
                endpointName: 'getCalendars',
                originalArgs: undefined,
                data: undefined,
              },
            },
          },
        }),
        'evt-1',
        updated
      )

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(weekEvents[0].date_start).toBe('2026-07-17T10:00:00.000Z')
      expect(monthEvents[0].date_start).toBe('2026-07-17T10:00:00.000Z')
    })

    it('no-ops when the event is absent from a cache entry', () => {
      const events = [{ ...baseEvent, id: 'other', key: 'other', uid: 'other' }]
      const dispatch = jest.fn(
        (action: { recipe?: (d: CalendarEvent[]) => void }) => {
          action.recipe?.(events)
          return action
        }
      )

      patchEventsInCachedQuery(
        dispatch,
        {
          endpointName: 'getEvents',
          originalArgs: { startDate: 'a', endDate: 'b' },
          data: events,
        },
        'evt-1',
        { ...baseEvent, date_start: '2026-07-17T10:00:00.000Z' }
      )

      expect(events[0].date_start).toBe('2026-07-16T10:00:00.000Z')
    })
  })
})
