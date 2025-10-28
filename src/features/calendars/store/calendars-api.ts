import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  Calendar,
  CalendarEvent,
  CalendarEventsResponse,
  CalendarsResponse,
} from '../calendars-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getCalendars: builder.query<CalendarsResponse, void>({
      query: () => 'calendars',
      providesTags: ['calendars'],
    }),
    getCalendarById: builder.query<Calendar | null, string>({
      query: (id) => `calendars/${id}`,
      providesTags: (result, error, id) => [{ type: 'calendars', id }],
    }),
    getCalendarsByType: builder.query<
      Calendar[],
      'personal' | 'shared' | 'subscription'
    >({
      query: (type) => `calendars?type=${type}`,
      providesTags: (result, error, type) => [{ type: 'calendars', id: type }],
    }),
    updateCalendar: builder.mutation<
      Calendar,
      Partial<Calendar> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `calendars/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'calendars', id },
        'calendars',
      ],
    }),
    createCalendar: builder.mutation<Calendar, Partial<Calendar>>({
      query: (data) => ({
        url: 'calendars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['calendars'],
    }),

    // Calendar Events endpoints
    getCalendarEvents: builder.query<CalendarEventsResponse, string>({
      query: (calendarId) => `calendars/${calendarId}/events`,
      providesTags: (result, error, calendarId) => [
        { type: 'calendar_events', id: calendarId },
      ],
    }),
    getCalendarEventById: builder.query<
      CalendarEvent,
      { calendarId: string; eventId: string }
    >({
      query: ({ calendarId, eventId }) =>
        `calendars/${calendarId}/events/${eventId}`,
      providesTags: (result, error, { eventId }) => [
        { type: 'calendar_events', id: eventId },
      ],
    }),
    createCalendarEvent: builder.mutation<
      CalendarEvent,
      { calendarId: string; event: Partial<CalendarEvent> }
    >({
      query: ({ calendarId, event }) => ({
        url: `calendars/${calendarId}/events`,
        method: 'POST',
        body: event,
      }),
      invalidatesTags: (result, error, { calendarId }) => [
        { type: 'calendar_events', id: calendarId },
        'calendars',
      ],
    }),
    updateCalendarEvent: builder.mutation<
      CalendarEvent,
      { calendarId: string; eventId: string; event: Partial<CalendarEvent> }
    >({
      query: ({ calendarId, eventId, event }) => ({
        url: `calendars/${calendarId}/events/${eventId}`,
        method: 'PATCH',
        body: event,
      }),
      // Don't invalidate any tags - rely on local state updates
      invalidatesTags: () => [],
      // Use async thunk to prevent automatic cache updates
      async onQueryStarted(_, { queryFulfilled }) {
        // Wait for response but don't update cache
        try {
          await queryFulfilled
        } catch (error) {
          console.error('Failed to update event:', error)
        }
      },
    }),
    deleteCalendarEvent: builder.mutation<
      { success: boolean; deleted_id: string },
      { calendarId: string; eventId: string }
    >({
      query: ({ calendarId, eventId }) => ({
        url: `calendars/${calendarId}/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { calendarId, eventId }) => [
        { type: 'calendar_events', id: eventId },
        { type: 'calendar_events', id: calendarId },
        'calendars',
      ],
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
        api,
        options,
        baseQuery
      ) => {
        try {
          const allEvents: CalendarEvent[] = []
          const errors: { calendarId: string; error: unknown }[] = []

          // Fetch events from each calendar separately and asynchronously
          const promises = calendarIds.map(async (calendarId) => {
            try {
              const result = await baseQuery({
                url: `calendars/${calendarId}/events`,
                method: 'GET',
                params: {
                  start_date: startDate,
                  end_date: endDate,
                },
              })

              if (result.error) {
                errors.push({ calendarId, error: result.error })
              } else if (result.data) {
                const events = Array.isArray(result.data)
                  ? result.data
                  : (result.data as CalendarEventsResponse).events || []
                allEvents.push(...events.map((e) => ({ ...e, calendarId })))
              }
            } catch (error) {
              errors.push({ calendarId, error })
            }
          })

          // Wait for all requests to complete
          await Promise.all(promises)

          // Log errors if any, but still return successful results
          if (errors.length > 0) {
            // Helper to format error messages
            function formatErrorMessage(error: unknown): string {
              if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: unknown }).message === 'string'
              ) {
                return (error as { message: string }).message
              }
              return JSON.stringify(error)
            }

            const calendarIdsStr = errors.map((e) => e.calendarId).join(', ')
            const errorMessagesStr = errors
              .map((e) => formatErrorMessage(e.error))
              .join('; ')

            console.warn(
              `Failed to fetch events from calendars: [${calendarIdsStr}]. Errors: [${errorMessagesStr}]`
            )
          }

          return { data: allEvents }
        } catch (error) {
          return { error }
        }
      },
      providesTags: (result, error, { calendarIds }) =>
        calendarIds.map((id) => ({ type: 'calendar_events', id })),
    }),
    updateCalendarVisibility: builder.mutation<
      null,
      { id: string; hidden: boolean }
    >({
      queryFn: async () => {
        // This is a local-only update without API request
        // The mutation does not return any data
        return { data: null }
      },
      async onQueryStarted({ id, hidden }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled

          // Update all relevant cache entries in getCalendars
          dispatch(
            apiSlice.util.updateQueryData(
              'getCalendars',
              undefined,
              (draft) => {
                // Update calendars in all categories
                ;['personal', 'shared', 'subscriptions'].forEach((type) => {
                  if (draft[type as keyof typeof draft]) {
                    const calendar = draft[type as keyof typeof draft].find(
                      (cal) => cal.id === id
                    )
                    if (calendar) {
                      calendar.u_hidden = hidden
                    }
                  }
                })
              }
            )
          )

          // Update getCalendarById cache
          dispatch(
            apiSlice.util.updateQueryData('getCalendarById', id, (draft) => {
              if (draft) {
                draft.u_hidden = hidden
              }
            })
          )

          // Update getCalendarsByType cache for all types
          ;['personal', 'shared', 'subscription'].forEach((type) => {
            dispatch(
              apiSlice.util.updateQueryData(
                'getCalendarsByType',
                type as 'personal' | 'shared' | 'subscription',
                (draft) => {
                  const calendar = draft.find((cal) => cal.id === id)
                  if (calendar) {
                    calendar.u_hidden = hidden
                  }
                }
              )
            )
          })
        } catch (error) {
          console.error('Failed to update calendar visibility:', error)
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
  useGetEventsInTimeRangeQuery,
  useUpdateCalendarVisibilityMutation,
} = injectedEndpoints
