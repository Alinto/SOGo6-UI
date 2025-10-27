import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { Calendar, CalendarsResponse } from '../calendars-types'

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
  }),
  overrideExisting: false,
})

export const {
  useGetCalendarsQuery,
  useGetCalendarByIdQuery,
  useGetCalendarsByTypeQuery,
  useUpdateCalendarMutation,
} = injectedEndpoints
