import { apiSlice } from '@/lib/redux/api/api-slice'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  data: { jwt_token: string }
  error_code: string
  error_msg: string
}

export interface AuthModeResponse {
  data: { kind: 'plain' | 'sso' | 'ldap'; location: string }
  error_code: string
  error_msg: string
}

export interface SystemResponse {
  data: { system: { SOGO_S_DIRECT_LOGIN: boolean } }
  error_code: string
  error_msg: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getAuthMode: builder.query<AuthModeResponse, { username: string }>({
      query: ({ username }) => ({
        url: 'auth/mode',
        params: { username },
      }),
      // Pas de cache — l'email change à chaque tentative de login
      keepUnusedDataFor: 0,
    }),

    getSystem: builder.query<SystemResponse, void>({
      query: () => 'system',
      // Configuration statique définie par l'admin, cache 1h
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const {
  useLoginMutation,
  useGetAuthModeQuery,
  useLazyGetAuthModeQuery,
  useGetSystemQuery,
} = authApi
