import { apiSlice } from '@/lib/redux/api/api-slice'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  data: {
    jwt_token: string
  }
  error_code: string
  error_msg: string
}

interface AuthModeResponse {
  data: string
  error_code: string
  error_msg: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/user/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
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
