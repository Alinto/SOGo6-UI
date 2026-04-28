import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  CALENDAR_EVENTS_SLICE,
  CALENDARS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  ApiCalendarEventResponse,
  ApiCalendarResponse,
  ApiCalendarsResponse,
  ApiCalendarEventsResponse,
  Calendar,
  CalendarCreateBody,
  CalendarEvent,
  CalendarEventCreateBody,
  CalendarEventQueryArgs,
  CalendarEventUpdateBody,
  CalendarEventsResponse,
  CalendarUpdateBody,
  CalendarsResponse,
} from '../calendars-types'

type GetCalendarEventsArgs = {
  calendarKey?: string
  calendarId?: string
  start_date_time?: string
  end_date_time?: string
  search?: string
}

const calendarUrl = (key: string) => `calendars/${encodeURIComponent(key)}`
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

function normalizeCalendar(calendar: Calendar): Calendar {
  const key = calendar.key ?? calendar.id ?? ''
  return {
    ...calendar,
    key,
    id: calendar.id ?? key,
    color: calendar.color || '#3B82F6',
    description: calendar.description ?? null,
    timezone: calendar.timezone ?? 'UTC',
    is_default: calendar.is_default ?? calendar.default ?? false,
    default: calendar.default ?? calendar.is_default ?? false,
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
  const startDate = event.date_start ?? event.start_date
  const endDate = event.date_end ?? event.end_date
  const calendarId = event.calendar_id ?? event.calendar_key ?? null

  return {
    ...event,
    id: event.id ?? event.key ?? event.uid ?? null,
    start_date: startDate,
    date_start: startDate,
    end_date: endDate,
    date_end: endDate,
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
    getCalendarsByType: builder.query<
      Calendar[],
      'personal' | 'shared' | 'subscription'
    >({
      query: () => ({ url: 'calendars' }),
      transformResponse: (
        response: ApiCalendarsResponse | CalendarsResponse | Calendar[],
        _meta,
        type
      ) =>
        normalizeCalendarsResponse(response).filter(
          (calendar) =>
            calendar.type === type ||
            calendar.source_type === type ||
            (type === 'personal' &&
              calendar.source_type !== 'shared' &&
              calendar.source_type !== 'subscription')
        ),
      providesTags: (result, error, type) => [
        { type: CALENDARS_SLICE, id: type },
      ],
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

    // Calendar Events endpoints
    getCalendarEvents: builder.query<
      CalendarEventsResponse,
      GetCalendarEventsArgs
    >({
      query: ({
        calendarKey,
        calendarId,
        start_date_time,
        end_date_time,
        search,
      }) => ({
        url: calendarEventsUrl(calendarKey ?? calendarId ?? ''),
        params: {
          start_date_time,
          end_date_time,
          search,
        },
      }),
      transformResponse: (response: unknown) =>
        normalizeCalendarEventsResponse(
          response as
            | ApiCalendarEventsResponse
            | CalendarEventsResponse
            | CalendarEvent[]
        ),
      providesTags: (result, error, { calendarKey, calendarId }) => [
        {
          type: CALENDAR_EVENTS_SLICE,
          id: calendarKey ?? calendarId ?? 'calendar',
        },
      ],
    }),
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
      invalidatesTags: (result, error, { calendarKey }) => [
        { type: CALENDAR_EVENTS_SLICE, id: calendarKey },
        CALENDARS_SLICE,
      ],
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
      invalidatesTags: [CALENDAR_EVENTS_SLICE],
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
    deleteCalendarEvent: builder.mutation<void, string>({
      query: (eventKey) => ({ url: eventUrl(eventKey), method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [CALENDAR_EVENTS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyDeleteCalendarEvent(dispatch, queryFulfilled)
      },
    }),
    getAllEvents: builder.query<CalendarEventsResponse, CalendarEventQueryArgs>({
      query: (params) => ({ url: 'events', params }),
      transformResponse: (
        response:
          | ApiCalendarEventsResponse
          | CalendarEventsResponse
          | CalendarEvent[]
      ) => normalizeCalendarEventsResponse(response),
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
            const result = await baseQuery({
              url: calendarEventsUrl(calendarId),
              method: 'GET',
              params: {
                start_date_time: startDate,
                end_date_time: endDate,
              },
            })

            if (result.error) return

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
          })
        )

        return { data: allEvents }
      },
      providesTags: (result, error, { calendarIds }) =>
        calendarIds.map((id) => ({ type: CALENDAR_EVENTS_SLICE, id })),
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

          ;['personal', 'shared', 'subscription'].forEach((type) => {
            dispatch(
              updateQueryData<Calendar[]>(
                'getCalendarsByType',
                type as 'personal' | 'shared' | 'subscription',
                (draft) => {
                  const calendar = draft.find(
                    (cal) => cal.key === id || cal.id === id
                  )
                  if (calendar) {
                    calendar.u_hidden = hidden
                  }
                }
              )
            )
          })
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
  useGetCalendarsByTypeQuery,
  useUpdateCalendarMutation,
  useCreateCalendarMutation,
  useGetCalendarEventsQuery,
  useGetCalendarEventByIdQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useDeleteCalendarMutation,
  useGetAllEventsQuery,
  useGetEventsInTimeRangeQuery,
  useUpdateCalendarVisibilityMutation,
} = injectedEndpoints

export const calendarsApiEndpoints = injectedEndpoints
