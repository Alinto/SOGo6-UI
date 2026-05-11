import { apiSlice, PREFERENCES_SLICE } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { UserPreferences } from '../types/user-preferences'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getPreferences: builder.query<UserPreferences, void>({
      query: () => 'preferences',
      providesTags: [PREFERENCES_SLICE],
    }),
    updatePreferences: builder.mutation<
      UserPreferences,
      Partial<UserPreferences>
    >({
      query: (body) => ({
        url: 'preferences',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [PREFERENCES_SLICE],
    }),
  }),
  overrideExisting: false,
})

export const { useGetPreferencesQuery, useUpdatePreferencesMutation } =
  injectedEndpoints
