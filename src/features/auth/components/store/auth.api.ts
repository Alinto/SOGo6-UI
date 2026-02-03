import { apiSlice } from '@/lib/redux/api/api-slice'
import type { User } from './auth.slice'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  data: {
    jwt_token: string
    user: User
  }
}

type AuthMode = 'ldap' | 'local' | 'sso'

interface AuthModeResponse {
  data: AuthMode
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/user/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Invalidate preferences cache after login to refetch user data
      invalidatesTags: ['preferences'],
    }),
    getAuthMode: builder.query<AuthModeResponse, { username: string }>({
      query: ({ username }) => ({
        url: '/api/user/v1/auth/mode',
        params: { username },
      }),
    }),
  }),
})

export const { useLoginMutation, useGetAuthModeQuery } = authApi
