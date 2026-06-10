import {
  apiSlice,
  MAIL_VACATION_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailVacation } from '../mail-vacation-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailVacationSettings: builder.query<MailVacation, void>({
      query: () => 'settings/mail/vacation',
      providesTags: [MAIL_VACATION_SETTINGS_SLICE],
    }),
    updateMailVacationSettings: builder.mutation<
      MailVacation,
      Partial<MailVacation>
    >({
      query: ({ ...patch }) => ({
        url: `settings/mail/vacation`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [MAIL_VACATION_SETTINGS_SLICE],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailVacationSettingsQuery,
  useUpdateMailVacationSettingsMutation,
} = injectedEndpoints
