import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import type { MutationLifecycleApi } from '@reduxjs/toolkit/query'
import {
  UserCalendarCategory,
  UserCalendarGeneral,
  UserContactPreferences,
  UserGeneral,
  UserMailCategory,
  UserMailGeneral,
  UserPreferencesResponse,
} from './user-preferences-api-types'

const patchPreferences = (data: object) => {
  return {
    url: 'api/user/v1/preferences',
    method: 'PATCH',
    body: {
      settings: {
        ...data,
      },
    },
  }
}

const patchPreferencesOnQueryStarted = async (
  _arg: unknown,
  { dispatch, queryFulfilled }: MutationLifecycleApi
) => {
  await createApiNotificationHandler(dispatch, {
    successTitle: 'title.success.string',
    successMessage: 'message.success.string',
    errorTitle: 'title.error.string',
    errorMessage: 'message.error.string',
  })(undefined, { queryFulfilled })
}

export const userPreferencesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL PREFERENCES
    getUserPreferences: builder.query<UserPreferencesResponse, void>({
      query: () => 'api/user/v1/preferences',
      providesTags: ['preferences'],
    }),

    // // PATCH — same endpoint for all forms
    // updateUserPreferences: builder.mutation<
    //   UserPreferencesResponse,
    //   UserGeneral
    // >({
    //   query: (body) => patchPreferences('USER_GENERAL', body),
    //   invalidatesTags: ['preferences'],
    //   onQueryStarted: patchPreferencesOnQueryStarted,
    // }),

    // PATCH — general
    updateUserPreferencesGeneral: builder.mutation<
      UserPreferencesResponse,
      UserGeneral
    >({
      query: (body) => patchPreferences({ USER_GENERAL: body }),
      invalidatesTags: ['preferences'],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — mail general
    updateUserPreferencesMailGeneral: builder.mutation<
      UserPreferencesResponse,
      UserMailGeneral
    >({
      query: (body) => patchPreferences({ USER_MAIL_GENERAL_SETTINGS: body }),
      invalidatesTags: ['preferences'],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — mail category
    updateUserPreferencesMailCategory: builder.mutation<
      UserPreferencesResponse,
      UserMailCategory
    >({
      query: (body) => patchPreferences({ USER_MAIL_CATEGORY_SETTINGS: body }),
      invalidatesTags: ['preferences'],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — address-books
    updateUserPreferencesContact: builder.mutation<
      UserPreferencesResponse,
      UserContactPreferences
    >({
      query: (body) => patchPreferences({ ...body }),
      invalidatesTags: ['preferences'],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — calendar general
    updateUserPreferencesCalendarGeneral: builder.mutation<
      UserPreferencesResponse,
      UserCalendarGeneral
    >({
      query: (body) => patchPreferences({ USER_CALENDAR_GENERAL: body }),
      invalidatesTags: ['preferences'],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — calendar category
    updateUserPreferencesCalendarCategory: builder.mutation<
      UserPreferencesResponse,
      UserCalendarCategory
    >({
      query: (body) => patchPreferences({ USER_CALENDAR_CATEGORY: body }),
      invalidatesTags: ['preferences'],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
  }),
})

export const {
  useGetUserPreferencesQuery,
  useLazyGetUserPreferencesQuery,
  useUpdateUserPreferencesGeneralMutation,
  useUpdateUserPreferencesContactMutation,
  useUpdateUserPreferencesMailGeneralMutation,
  useUpdateUserPreferencesMailCategoryMutation,
  useUpdateUserPreferencesCalendarGeneralMutation,
  useUpdateUserPreferencesCalendarCategoryMutation,
} = userPreferencesApi
