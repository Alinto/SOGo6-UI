import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  PREFERENCES_SLICE,
  PROFILE_SLICE,
} from '@/lib/redux/api/api-slice'
import {
  UserCalendarCategory,
  UserCalendarGeneral,
  UserContactPreferences,
  UserGeneral,
  UserMailCategory,
  UserMailGeneral,
  UserPreferencesResponse,
  UserSecurity,
} from './user-preferences-api-types'

const patchPreferences = (data: object) => ({
  url: 'preferences',
  method: 'PATCH',
  body: {
    settings: {
      ...data,
    },
  },
})

const patchPreferencesOnQueryStarted = async (
  _arg: unknown,
  { dispatch, queryFulfilled }: { dispatch: any; queryFulfilled: Promise<any> }
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
      query: () => 'preferences',
      providesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
    }),

    // // PATCH — same endpoint for all forms
    // updateUserPreferences: builder.mutation<
    //   UserPreferencesResponse,
    //   UserGeneral
    // >({
    //   query: (body) => patchPreferences('USER_GENERAL', body),
    //   invalidatesTags: [TAG_PREFERENCES],
    //   onQueryStarted: patchPreferencesOnQueryStarted,
    // }),

    // PATCH — general
    updateUserPreferencesGeneral: builder.mutation<
      UserPreferencesResponse,
      UserGeneral
    >({
      query: (body) => patchPreferences({ USER_GENERAL: body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — mail general
    updateUserPreferencesMailGeneral: builder.mutation<
      UserPreferencesResponse,
      UserMailGeneral
    >({
      query: (body) => patchPreferences({ USER_MAIL_GENERAL_SETTINGS: body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — mail category
    updateUserPreferencesMailCategory: builder.mutation<
      UserPreferencesResponse,
      UserMailCategory
    >({
      query: (body) => patchPreferences({ USER_MAIL_CATEGORY_SETTINGS: body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — address-books
    updateUserPreferencesContact: builder.mutation<
      UserPreferencesResponse,
      UserContactPreferences
    >({
      query: (body) => patchPreferences({ ...body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — calendar general
    updateUserPreferencesCalendarGeneral: builder.mutation<
      UserPreferencesResponse,
      UserCalendarGeneral
    >({
      query: (body) => patchPreferences({ USER_CALENDAR_GENERAL: body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — calendar category
    updateUserPreferencesCalendarCategory: builder.mutation<
      UserPreferencesResponse,
      UserCalendarCategory
    >({
      query: (body) => patchPreferences({ USER_CALENDAR_CATEGORY: body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
      onQueryStarted: patchPreferencesOnQueryStarted,
    }),
    // PATCH — security
    updateUserPreferencesSecurity: builder.mutation<
      UserPreferencesResponse,
      UserSecurity
    >({
      query: (body) => patchPreferences({ USER_SECURITY: body }),
      invalidatesTags: [PREFERENCES_SLICE, PROFILE_SLICE],
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
  useUpdateUserPreferencesSecurityMutation,
} = userPreferencesApi