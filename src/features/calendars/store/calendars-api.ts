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
      invalidatesTags: (result, error, { calendarId, eventId }) => [
        { type: 'calendar_events', id: eventId },
        { type: 'calendar_events', id: calendarId },
        'calendars',
      ],
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
  }),
  overrideExisting: false,
})

export const {
  useGetCalendarsQuery,
  useGetCalendarByIdQuery,
  useGetCalendarsByTypeQuery,
  useUpdateCalendarMutation,
  useGetCalendarEventsQuery,
  useGetCalendarEventByIdQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
} = injectedEndpoints
