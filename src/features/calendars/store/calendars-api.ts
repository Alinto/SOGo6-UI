import { addNotification } from '@/features/notifications'
import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  CALENDAR_EVENTS_SLICE,
  CALENDARS_SLICE,
  CALENDAR_SYNC_SLICE,
  USER_SEARCH_SLICE,
} from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import { BaseQueryFn, EndpointBuilder, skipToken } from '@reduxjs/toolkit/query'
import type {
  ApiCalendarEventResponse,
  ApiCalendarResponse,
  ApiCalendarsResponse,
  ApiCalendarEventsResponse,
  AttendanceStatus,
  Calendar,
  CalendarCreateBody,
  CalendarEvent,
  CalendarEventCreateBody,
  EventRecurrence,
  CalendarEventQueryArgs,
  CalendarEventUpdateBody,
  CalendarEventsResponse,
  CalendarUpdateBody,
  CalendarsResponse,
  FreeBusyRequest,
  FreeBusyApiResponse,
  UserSearchResult,
  ExternalCalendarCreateBody,
  ExternalCalendarUpdateBody,
  CalendarSyncStatus,
  CalendarSyncResult,
  ApiDataResponse,
} from '../calendars-types'
import { DEFAULT_CALENDAR_COLOR } from '../calendars-types'

const userSearchUrl = () => 'users/search'

const calendarUrl = (key: string) => `calendars/${encodeURIComponent(key)}`
const externalCalendarUrl = (key: string) =>
  `external-calendars/${encodeURIComponent(key)}`
const externalCalendarSyncUrl = (key: string) =>
  `${externalCalendarUrl(key)}/sync`
const calendarEventsUrl = (key: string) =>
  `calendars/${encodeURIComponent(key)}/events`
const eventUrl = (eventKey: string) => `events/${encodeURIComponent(eventKey)}`

const createCalendarNotifyMutation =
  (options: {
    successTitle: string
    successMessage: string
    errorTitle: string
    errorMessage: string
  }) =>
  async (
    dispatch: Parameters<typeof createApiNotificationHandler>[0],
    queryFulfilled: Promise<unknown>
  ) => {
    await createApiNotificationHandler(dispatch, options)(undefined, {
      queryFulfilled,
    })
  }

const notifyCreateCalendar = createCalendarNotifyMutation({
  successTitle: 'calendar_create.success.title.string',
  successMessage: 'calendar_create.success.message.string',
  errorTitle: 'calendar_create.error.title.string',
  errorMessage: 'calendar_create.error.message.string',
})

const notifyUpdateCalendar = createCalendarNotifyMutation({
  successTitle: 'calendar_update.success.title.string',
  successMessage: 'calendar_update.success.message.string',
  errorTitle: 'calendar_update.error.title.string',
  errorMessage: 'calendar_update.error.message.string',
})

const notifyDeleteCalendar = createCalendarNotifyMutation({
  successTitle: 'calendar_delete.success.title.string',
  successMessage: 'calendar_delete.success.message.string',
  errorTitle: 'calendar_delete.error.title.string',
  errorMessage: 'calendar_delete.error.message.string',
})

const notifyCreateCalendarEvent = createCalendarNotifyMutation({
  successTitle: 'calendar_event_create.success.title.string',
  successMessage: 'calendar_event_create.success.message.string',
  errorTitle: 'calendar_event_create.error.title.string',
  errorMessage: 'calendar_event_create.error.message.string',
})

const notifyUpdateCalendarEvent = createCalendarNotifyMutation({
  successTitle: 'calendar_event_update.success.title.string',
  successMessage: 'calendar_event_update.success.message.string',
  errorTitle: 'calendar_event_update.error.title.string',
  errorMessage: 'calendar_event_update.error.message.string',
})

const notifyDeleteCalendarEvent = createCalendarNotifyMutation({
  successTitle: 'calendar_event_delete.success.title.string',
  successMessage: 'calendar_event_delete.success.message.string',
  errorTitle: 'calendar_event_delete.error.title.string',
  errorMessage: 'calendar_event_delete.error.message.string',
})

const notifyCreateExternalCalendar = createCalendarNotifyMutation({
  successTitle: 'external_calendar_create.success.title.string',
  successMessage: 'external_calendar_create.success.message.string',
  errorTitle: 'external_calendar_create.error.title.string',
  errorMessage: 'external_calendar_create.error.message.string',
})

const notifyDeleteExternalCalendar = createCalendarNotifyMutation({
  successTitle: 'external_calendar_delete.success.title.string',
  successMessage: 'external_calendar_delete.success.message.string',
  errorTitle: 'external_calendar_delete.error.title.string',
  errorMessage: 'external_calendar_delete.error.message.string',
})

const notifyTriggerSync = createCalendarNotifyMutation({
  successTitle: 'external_calendar_sync.success.title.string',
  successMessage: 'external_calendar_sync.success.message.string',
  errorTitle: 'external_calendar_sync.error.title.string',
  errorMessage: 'external_calendar_sync.error.message.string',
})

function unwrapApiData<T>(response: ApiDataResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiDataResponse<T>).data
  }
  return response as T
}

const attendanceSuccessKeys: Record<
  AttendanceStatus,
  { title: string; message: string }
> = {
  accepted: {
    title: 'calendar_event_attendance.success.accepted.title.string',
    message: 'calendar_event_attendance.success.accepted.message.string',
  },
  declined: {
    title: 'calendar_event_attendance.success.declined.title.string',
    message: 'calendar_event_attendance.success.declined.message.string',
  },
  tentative: {
    title: 'calendar_event_attendance.success.tentative.title.string',
    message: 'calendar_event_attendance.success.tentative.message.string',
  },
  delegated: {
    title: 'calendar_event_attendance.success.delegated.title.string',
    message: 'calendar_event_attendance.success.delegated.message.string',
  },
}

function normalizeCalendar(calendar: Calendar): Calendar {
  const key = calendar.key ?? calendar.id ?? ''
  return {
    ...calendar,
    key,
    id: calendar.id ?? key,
    color: calendar.color || DEFAULT_CALENDAR_COLOR,
    description: calendar.description ?? null,
    timezone: calendar.timezone ?? 'UTC',
    is_default:
      calendar.is_default ??
      (calendar as Calendar & { default?: boolean }).default ??
      false,
    ctag: calendar.ctag ?? 0,
    share_token: calendar.share_token ?? null,
    u_hidden: calendar.u_hidden ?? false,
  }
}

function normalizeCalendarsResponse(
  response: ApiCalendarsResponse | CalendarsResponse | Calendar[]
): Calendar[] {
  if (Array.isArray(response)) {
    return response.map(normalizeCalendar)
  }

  if ('data' in response) {
    return response.data.calendars.map(normalizeCalendar)
  }

  return [
    ...response.personal,
    ...response.shared,
    ...response.subscriptions,
  ].map(normalizeCalendar)
}

function normalizeCalendarResponse(
  response: ApiCalendarResponse | Calendar
): Calendar {
  return normalizeCalendar('data' in response ? response.data : response)
}

function normalizeCalendarEvent(event: CalendarEvent): CalendarEvent {
  const startDate = event.date_start 
  const endDate = event.date_end 
  const calendarId = event.calendar_id ?? event.calendar_key ?? null

  return {
    ...event,
    date_start: startDate,
    date_end: endDate,
    recurrence:
      event.recurrence ??
      (event as { recurrence_rule?: EventRecurrence }).recurrence_rule ??
      undefined,
    id: event.recurrence_id
      ? `${event.key ?? event.uid}-${event.recurrence_id}`
      : (event.key ?? event.id ?? event.uid ?? null),
    calendar_id: calendarId,
    calendar_key: event.calendar_key ?? event.calendar_id ?? undefined,
  }
}

function normalizeCalendarEventsResponse(
  response: ApiCalendarEventsResponse | CalendarEventsResponse | CalendarEvent[]
): CalendarEventsResponse {
  if (Array.isArray(response)) {
    return {
      events: response.map(normalizeCalendarEvent),
      total_count: response.length,
    }
  }

  if ('data' in response) {
    return {
      events: response.data.events.map(normalizeCalendarEvent),
      total_count: response.data.total_count,
    }
  }

  return {
    ...response,
    events: response.events.map(normalizeCalendarEvent),
  }
}

/** apiSlice is typed with empty endpoints; injected names are not on util.updateQueryData. */
type UpdateQueryDataFn = <T>(
  endpointName: string,
  arg: unknown,
  updateRecipe: (draft: T) => void
) => UnknownAction

const updateQueryData = apiSlice.util.updateQueryData as unknown as UpdateQueryDataFn

function eventMatchesKey(event: CalendarEvent, eventKey: string): boolean {
  return (
    event.id === eventKey ||
    event.key === eventKey ||
    (event.uid != null && event.uid === eventKey)
  )
}

type CachedEventsQueryEntry = {
  endpointName?: string
  originalArgs?: unknown
  data?: CalendarEvent[]
}

function patchEventsInCachedQuery(
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

/** Keep grid/list caches in sync after attendance without waiting for refetch. */
function patchEventInCachedTimeRangeQueries(
  dispatch: (action: UnknownAction) => void,
  getState: () => unknown,
  eventKey: string,
  updatedEvent: CalendarEvent
) {
  const apiState = (getState() as {
    api?: { queries?: Record<string, CachedEventsQueryEntry> }
  }).api?.queries

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

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getCalendars: builder.query<Calendar[], void>({
      query: () => ({ url: 'calendars' }),
      transformResponse: (
        response: ApiCalendarsResponse | CalendarsResponse | Calendar[]
      ) => normalizeCalendarsResponse(response),
      providesTags: [CALENDARS_SLICE],
    }),
    getCalendarById: builder.query<Calendar | null, string>({
      query: (key) => calendarUrl(key),
      transformResponse: (response: ApiCalendarResponse | Calendar) =>
        normalizeCalendarResponse(response),
      providesTags: (result, error, key) => [{ type: CALENDARS_SLICE, id: key }],
    }),
    createCalendar: builder.mutation<Calendar, CalendarCreateBody>({
      query: (body) => ({
        url: 'calendars',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiCalendarResponse | Calendar) =>
        normalizeCalendarResponse(response),
      invalidatesTags: [CALENDARS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyCreateCalendar(dispatch, queryFulfilled)
      },
    }),
    updateCalendar: builder.mutation<
      Calendar,
      { key: string } & CalendarUpdateBody
    >({
      query: ({ key, ...body }) => ({
        url: calendarUrl(key),
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiCalendarResponse | Calendar) =>
        normalizeCalendarResponse(response),
      invalidatesTags: (result, error, { key }) => [
        { type: CALENDARS_SLICE, id: key },
        CALENDARS_SLICE,
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyUpdateCalendar(dispatch, queryFulfilled)
      },
    }),
    deleteCalendar: builder.mutation<void, string>({
      query: (key) => ({ url: calendarUrl(key), method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [CALENDARS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyDeleteCalendar(dispatch, queryFulfilled)
      },
    }),

    createExternalCalendar: builder.mutation<
      Calendar,
      ExternalCalendarCreateBody
    >({
      query: (body) => ({
        url: 'external-calendars',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiCalendarResponse | Calendar) =>
        normalizeCalendarResponse(response),
      invalidatesTags: [CALENDARS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyCreateExternalCalendar(dispatch, queryFulfilled)
      },
    }),
    getExternalCalendar: builder.query<Calendar, string>({
      query: (key) => ({
        url: externalCalendarUrl(key),
        method: 'GET',
      }),
      transformResponse: (response: ApiCalendarResponse | Calendar) =>
        normalizeCalendarResponse(response),
      providesTags: (_, __, key) => [{ type: CALENDARS_SLICE, id: key }],
    }),
    updateExternalCalendar: builder.mutation<
      Calendar,
      { key: string; body: ExternalCalendarUpdateBody }
    >({
      query: ({ key, body }) => ({
        url: externalCalendarUrl(key),
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiCalendarResponse | Calendar) =>
        normalizeCalendarResponse(response),
      invalidatesTags: (_, __, { key }) => [
        { type: CALENDARS_SLICE, id: key },
        CALENDARS_SLICE,
      ],
    }),
    deleteExternalCalendar: builder.mutation<void, string>({
      query: (key) => ({
        url: externalCalendarUrl(key),
        method: 'DELETE',
      }),
      transformResponse: () => undefined,
      invalidatesTags: [CALENDARS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyDeleteExternalCalendar(dispatch, queryFulfilled)
      },
    }),
    triggerSync: builder.mutation<CalendarSyncResult, string>({
      query: (key) => ({
        url: externalCalendarSyncUrl(key),
        method: 'POST',
      }),
      transformResponse: (response: ApiDataResponse<CalendarSyncResult>) =>
        unwrapApiData(response),
      invalidatesTags: (_, __, key) => [
        { type: CALENDARS_SLICE, id: key },
        { type: CALENDAR_SYNC_SLICE, id: key },
        CALENDAR_EVENTS_SLICE,
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyTriggerSync(dispatch, queryFulfilled)
      },
    }),
    getSyncStatus: builder.query<CalendarSyncStatus, string>({
      query: (key) => ({
        url: externalCalendarSyncUrl(key),
        method: 'GET',
      }),
      transformResponse: (
        response: ApiDataResponse<CalendarSyncStatus> | CalendarSyncStatus
      ) => unwrapApiData(response),
      providesTags: (_, __, key) => [{ type: CALENDAR_SYNC_SLICE, id: key }],
    }),

    // Calendar Events endpoints
    getCalendarEventById: builder.query<
      CalendarEvent,
      { eventKey: string }
    >({
      query: ({ eventKey }) => eventUrl(eventKey),
      transformResponse: (response: ApiCalendarEventResponse | CalendarEvent) =>
        normalizeCalendarEvent('data' in response ? response.data : response),
      providesTags: (result, error, { eventKey }) => [
        { type: CALENDAR_EVENTS_SLICE, id: eventKey },
      ],
    }),
    createCalendarEvent: builder.mutation<
      CalendarEvent,
      { calendarKey: string; body: CalendarEventCreateBody }
    >({
      query: ({ calendarKey, body }) => ({
        url: calendarEventsUrl(calendarKey),
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiCalendarEventResponse | CalendarEvent) =>
        normalizeCalendarEvent('data' in response ? response.data : response),
      invalidatesTags: [CALENDAR_EVENTS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyCreateCalendarEvent(dispatch, queryFulfilled)
      },
    }),
    updateCalendarEvent: builder.mutation<
      CalendarEvent,
      { eventKey: string; body: CalendarEventUpdateBody; silentSuccess?: boolean }
    >({
      query: ({ eventKey, body }) => ({
        url: eventUrl(eventKey),
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiCalendarEventResponse | CalendarEvent) =>
        normalizeCalendarEvent('data' in response ? response.data : response),
      invalidatesTags: (result, error, arg) =>
        arg.silentSuccess ? [] : [CALENDAR_EVENTS_SLICE],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        if (arg.silentSuccess) {
          try {
            await queryFulfilled
          } catch {
            await notifyUpdateCalendarEvent(dispatch, queryFulfilled)
          }
          return
        }
        await notifyUpdateCalendarEvent(dispatch, queryFulfilled)
      },
    }),
    deleteCalendarEvent: builder.mutation<
      void,
      | string
      | {
          eventKey: string
          recurrence_id?: string
          recurrence_range?: 'ONE' | 'THISANDFUTURE' | 'ALL'
        }
    >({
      query: (arg) => {
        const eventKey = typeof arg === 'string' ? arg : arg.eventKey
        const recurrence_id =
          typeof arg === 'string' ? undefined : arg.recurrence_id
        const recurrence_range =
          typeof arg === 'string' ? undefined : arg.recurrence_range
        return {
          url: eventUrl(eventKey),
          method: 'DELETE',
          params: {
            ...(recurrence_id ? { recurrence_id } : {}),
            ...(recurrence_range ? { recurrence_range } : {}),
          },
        }
      },
      transformResponse: () => undefined,
      invalidatesTags: [CALENDAR_EVENTS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyDeleteCalendarEvent(dispatch, queryFulfilled)
      },
    }),
    postEventAttendance: builder.mutation<
      CalendarEvent,
      { eventKey: string; status: AttendanceStatus; recurrence_id?: string }
    >({
      query: ({ eventKey, status, recurrence_id }) => ({
        url: `${eventUrl(eventKey)}/attendance`,
        method: 'POST',
        body: {
          status,
          ...(recurrence_id ? { recurrence_id } : {}),
        },
      }),
      transformResponse: (response: ApiCalendarEventResponse | CalendarEvent) =>
        normalizeCalendarEvent('data' in response ? response.data : response),
      invalidatesTags: [],
      async onQueryStarted(
        { eventKey, status },
        { dispatch, queryFulfilled, getState }
      ) {
        const keys = attendanceSuccessKeys[status]
        try {
          const { data: updatedEvent } = await queryFulfilled

          dispatch(
            updateQueryData<CalendarEvent>(
              'getCalendarEventById',
              { eventKey },
              () => updatedEvent
            )
          )
          patchEventInCachedTimeRangeQueries(
            dispatch,
            getState,
            eventKey,
            updatedEvent
          )

          dispatch(
            addNotification({
              type: 'success',
              title: keys.title,
              message: keys.message,
              duration: 3000,
            })
          )
        } catch {
          dispatch(
            addNotification({
              type: 'error',
              title: 'calendar_event_attendance.error.title.string',
              message: 'calendar_event_attendance.error.message.string',
              duration: 5000,
            })
          )
        }
      },
    }),
    getEvents: builder.query<
      CalendarEvent[],
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: 'events',
        method: 'GET',
        params: {
          start_date_time: startDate,
          end_date_time: endDate,
        },
      }),
      transformResponse: (
        response:
          | ApiCalendarEventsResponse
          | CalendarEventsResponse
          | CalendarEvent[]
      ) => {
        const { events } = normalizeCalendarEventsResponse(response)
        return events
      },
      providesTags: [CALENDAR_EVENTS_SLICE],
    }),
    // Get events from multiple calendars within a date range
    // Fetches each calendar separately and asynchronously
    getEventsInTimeRange: builder.query<
      CalendarEvent[],
      {
        calendarIds: string[]
        startDate: string // ISO date string
        endDate: string // ISO date string
      }
    >({
      queryFn: async (
        { calendarIds, startDate, endDate },
        _api,
        _options,
        baseQuery
      ) => {
        const allEvents: CalendarEvent[] = []
        await Promise.all(
          calendarIds.map(async (calendarId) => {
            try {
              const result = await baseQuery({
                url: calendarEventsUrl(calendarId),
                method: 'GET',
                params: {
                  start_date_time: startDate,
                  end_date_time: endDate,
                },
              })

              if (result.error) {
                console.warn(
                  `[Calendar] Failed to fetch events for ${calendarId}:`,
                  result.error
                )
                return
              }

              const { events } = normalizeCalendarEventsResponse(
                result.data as
                  | ApiCalendarEventsResponse
                  | CalendarEventsResponse
                  | CalendarEvent[]
              )

              allEvents.push(
                ...events.map((event) => ({
                  ...event,
                  calendar_id: event.calendar_id ?? calendarId,
                }))
              )
            } catch (e) {
              console.warn(
                `[Calendar] Exception fetching events for ${calendarId}:`,
                e
              )
            }
          })
        )

        return { data: allEvents }
      },
      providesTags: (result, error, { calendarIds }) => [
        CALENDAR_EVENTS_SLICE,
        ...calendarIds.map((id) => ({ type: CALENDAR_EVENTS_SLICE, id })),
      ],
    }),
    searchEvents: builder.query<
      CalendarEvent[],
      { calendarIds: string[]; search: string }
    >({
      queryFn: async (
        { calendarIds, search },
        _api,
        _options,
        baseQuery
      ) => {
        if (search.length < 2 || calendarIds.length === 0) {
          return { data: [] }
        }

        const allEvents: CalendarEvent[] = []
        await Promise.all(
          calendarIds.map(async (calendarId) => {
            try {
              const result = await baseQuery({
                url: calendarEventsUrl(calendarId),
                method: 'GET',
                params: { search },
              })

              if (result.error) {
                console.warn(
                  `[Calendar] Failed to search events for ${calendarId}:`,
                  result.error
                )
                return
              }

              const { events } = normalizeCalendarEventsResponse(
                result.data as
                  | ApiCalendarEventsResponse
                  | CalendarEventsResponse
                  | CalendarEvent[]
              )

              allEvents.push(
                ...events.map((event) => ({
                  ...event,
                  calendar_id: event.calendar_id ?? calendarId,
                }))
              )
            } catch (e) {
              console.warn(
                `[Calendar] Exception searching events for ${calendarId}:`,
                e
              )
            }
          })
        )

        return { data: allEvents }
      },
      providesTags: [CALENDAR_EVENTS_SLICE],
    }),
    getFreeBusy: builder.query<
      FreeBusyApiResponse,
      FreeBusyRequest | typeof skipToken
    >({
      query: (arg) => {
        if (arg === skipToken) {
          return skipToken
        }
        return {
          url: 'freebusy',
          method: 'POST',
          body: {
            target_uids: arg.target_uids,
            start: arg.start,
            end: arg.end,
          },
        }
      },
    }),
    searchUsers: builder.query<
      UserSearchResult[],
      { q: string; limit?: number }
    >({
      query: ({ q, limit = 10 }) => ({
        url: userSearchUrl(),
        params: { q, limit },
      }),
      transformResponse: (response: {
        data: { users: UserSearchResult[] }
      }) => response.data.users,
      providesTags: (result, error, { q, limit = 10 }) => [
        { type: USER_SEARCH_SLICE, id: `${q}:${limit}` },
      ],
    }),
    updateCalendarVisibility: builder.mutation<
      null,
      { id: string; hidden: boolean }
    >({
      queryFn: async () => {
        // INTENTIONALLY LOCAL-ONLY: The backend CalendarUpdateSchema does not
        // expose a `hidden` field. Calendar visibility is a UI-only preference
        // stored in the RTK Query cache. State is lost on page refresh until
        // backend user preference persistence is added.
        return { data: null }
      },
      async onQueryStarted({ id, hidden }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled

          dispatch(
            updateQueryData<Calendar[]>(
              'getCalendars',
              undefined,
              (draft) => {
                const calendar = draft.find(
                  (cal) => cal.key === id || cal.id === id
                )
                if (calendar) calendar.u_hidden = hidden
              }
            )
          )

          dispatch(
            updateQueryData<Calendar | null>(
              'getCalendarById',
              id,
              (draft) => {
                if (draft) {
                  draft.u_hidden = hidden
                }
              }
            )
          )

        } catch {
          // Local-only visibility updates should fail silently.
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCalendarsQuery,
  useGetCalendarByIdQuery,
  useUpdateCalendarMutation,
  useCreateCalendarMutation,
  useGetCalendarEventByIdQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  usePostEventAttendanceMutation,
  useDeleteCalendarMutation,
  useGetEventsQuery,
  useGetEventsInTimeRangeQuery,
  useSearchEventsQuery,
  useUpdateCalendarVisibilityMutation,
  useGetFreeBusyQuery,
  useSearchUsersQuery,
  useCreateExternalCalendarMutation,
  useGetExternalCalendarQuery,
  useUpdateExternalCalendarMutation,
  useDeleteExternalCalendarMutation,
  useTriggerSyncMutation,
  useGetSyncStatusQuery,
} = injectedEndpoints

export const calendarsApiEndpoints = injectedEndpoints
