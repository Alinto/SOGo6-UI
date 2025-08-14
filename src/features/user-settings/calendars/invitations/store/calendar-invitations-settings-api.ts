import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { CalendarInvitations } from '../calendars-invitations-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getCalendarInvitationsSettings: builder.query<CalendarInvitations, void>({
      query: () => 'settings/calendar/invitations',
      providesTags: ['calendar_invitations_settings'],
    }),
    updateCalendarInvitationsSettings: builder.mutation<
    CalendarInvitations,
      Partial<CalendarInvitations>
    >({
      query: ({ ...patch }) => ({
        url: `settings/calendar/invitations`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['calendar_invitations_settings'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCalendarInvitationsSettingsQuery,
  useUpdateCalendarInvitationsSettingsMutation,
} = injectedEndpoints
