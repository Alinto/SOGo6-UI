import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailLabel } from '../mail-labels-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailLabelsSettings: builder.query<MailLabel[], void>({
      query: () => 'settings/mail/labels',
      providesTags: ['mail_labels_settings'],
    }),
    updateMailLabelsSettings: builder.mutation<MailLabel[], Partial<MailLabel>>(
      {
        query: ({ ...patch }) => ({
          url: `settings/mail/labels`,
          method: 'PATCH',
          body: patch,
        }),
        invalidatesTags: ['mail_labels_settings'],
      }
    ),
  }),
  overrideExisting: false,
})

export const {
  useGetMailLabelsSettingsQuery,
  useUpdateMailLabelsSettingsMutation,
} = injectedEndpoints
