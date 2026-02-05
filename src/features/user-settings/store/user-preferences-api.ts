import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { UserGeneral, UserPreferencesResponse } from './user-preferences-types'

export const userPreferencesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL PREFERENCES
    getUserPreferences: builder.query<UserPreferencesResponse, void>({
      query: () => 'api/user/v1/preferences',
      providesTags: ['preferences'],
    }),

    // PATCH — same endpoint for all forms
    updateUserPreferences: builder.mutation<
      UserPreferencesResponse,
      UserGeneral
    >({
      query: (body) => ({
        url: 'api/user/v1/preferences',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['preferences'],
    }),

    // PATCH — general
    updateUserPreferencesGeneral: builder.mutation<
      UserPreferencesResponse,
      UserGeneral
    >({
      query: (body) => ({
        url: 'api/user/v1/preferences',
        method: 'PATCH',
        body: {
          settings: {
            USER_GENERAL: { ...body },
          },
        },
      }),
      invalidatesTags: ['preferences'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'title.success.string',
          successMessage: 'message.success.string',
          errorTitle: 'title.error.string',
          errorMessage: 'message.error.string',
        })(undefined, { queryFulfilled })
      },
    }),
  }),
})

export const {
  useGetUserPreferencesQuery,
  useLazyGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useUpdateUserPreferencesGeneralMutation,
} = userPreferencesApi

// import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
// import { apiSlice } from '@/lib/redux/api/api-slice'
// import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
// import type {
//   UpdateUserPreferencesPayload,
//   UserPreferences,
// } from './user-preferences-types'

// const baseUrl = '/api/user/v1/preferences'

// const getUserPreferencesQuery = () => baseUrl

// const updateUserPreferencesQuery = ({
//   key,
//   value,
// }: UpdateUserPreferencesPayload) => ({
//   url: `${baseUrl}${encodeURIComponent(key)}`,
//   method: 'POST' as const,
//   body: { value },
// })

// const injectedEndpoints = apiSlice.injectEndpoints({
//   endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
//     /**
//      * Fetch all user preferences (including permissions dictionary)
//      */
//     getUserPreferences: builder.query<UserPreferences, void>({
//       query: getUserPreferencesQuery,
//       providesTags: ['user/preferences'],
//       keepUnusedDataFor: 3600, // 1 hour
//     }),

//     /**
//      * Update a single setting (e.g. a permission flag)
//      */
//     updateUserSetting: builder.mutation<void, UpdateUserPreferencesPayload>({
//       query: updateUserPreferencesQuery,
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         await createApiNotificationHandler(dispatch, {
//           successTitle: 'preferences.update.success.title',
//           successMessage: 'preferences.update.success.message',
//           errorTitle: 'preferences.update.error.title',
//           errorMessage: 'preferences.update.error.message',
//         })(undefined, { queryFulfilled })
//       },
//       invalidatesTags: ['user/preferences'],
//     }),
//   }),
//   overrideExisting: false,
// })

// export const { useGetUserPreferencesQuery } = injectedEndpoints

// export const userPreferencesApiEndpoints = injectedEndpoints

// export const { useLazyGetUserPreferencesQuery } = userPreferencesApiEndpoints

// export { getUserPreferencesQuery, updateUserPreferencesQuery }
