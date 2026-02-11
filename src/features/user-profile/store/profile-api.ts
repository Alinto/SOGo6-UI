import { apiSlice } from '@/lib/redux/api/api-slice'
import type { ProfileApiResponse, ProfileData } from '@/features/user-profile/profile-types'

// Tag for cache invalidation
const PROFILE_TAG = 'profile' as const

/**
 * API slice for the /api/user/v1/profile endpoint
 * Pattern: injectEndpoints into main apiSlice
 */
export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/user/v1/profile
     * Fetches complete profile: mailboxes, preferences, UI settings
     */
    getUserProfile: builder.query<ProfileData, void>({
      query: () => ({
        url: '/api/user/v1/profile',
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
      providesTags: [PROFILE_TAG],

      // Cache 5 minutes (profile changes rarely)
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: false,
})

// Export auto-generated hooks
export const { useGetUserProfileQuery } = profileApi
