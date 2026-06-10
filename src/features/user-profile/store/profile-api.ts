import type {
  ProfileApiResponse,
  ProfileData,
} from '@/features/user-profile/profile-types'
import { apiSlice, PROFILE_SLICE } from '@/lib/redux/api/api-slice'

/**
 * API slice for the /profile endpoint
 * Pattern: injectEndpoints into main apiSlice
 */
export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /profile
     * Fetches complete profile: mailboxes, preferences, UI settings
     */
    getUserProfile: builder.query<ProfileData, void>({
      query: () => ({
        url: 'profile',
        method: 'GET',
      }),

      /**
       * Transform backend response to usable format
       * Backend always returns {data: {...}, error_code, error_msg}
       */
      transformResponse: (response: ProfileApiResponse): ProfileData => {
        // Check for backend error
        if (response.error_code !== 'S000000') {
          throw new Error(response.error_msg || 'Profile fetch failed')
        }

        return response.data
      },

      // Tag for cache invalidation
      providesTags: [PROFILE_SLICE],

      // Cache 5 minutes (profile changes rarely)
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: false,
})

// Export auto-generated hooks
export const { useGetUserProfileQuery } = profileApi
