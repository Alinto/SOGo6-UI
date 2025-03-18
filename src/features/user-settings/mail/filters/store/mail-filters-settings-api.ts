import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailFilter } from '../mail-filters-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailFiltersSettings: builder.query<MailFilter[], void>({
      query: () => 'settings/mail/filters',
      providesTags: ['mail_filters_settings'],
    }),
    updateMailFiltersSettings: builder.mutation<
      MailFilter[],
      Partial<MailFilter>
    >({
      query: ({ ...patch }) => ({
        url: `settings/mail/filters`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['mail_filters_settings'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailFiltersSettingsQuery,
  useUpdateMailFiltersSettingsMutation,
} = injectedEndpoints
