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

export type AuthKind = 'plain' | 'openid' | 'cas' | 'saml2'

export interface AuthModeResponse {
  data: { kind: AuthKind; location: string }
  error_code: string
  error_msg: string
}

export interface SystemResponse {
  data: { system: { SOGO_S_DIRECT_LOGIN: boolean } }
  error_code: string
  error_msg: string
}

export interface LogoutResponse {
  // location: SSO only, url of the identity provider where the browser must go to end its session too, empty if none
  data: { location: string } | null
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

    // redirect: page where the API sends the user back after a SSO login (see login-sso-callback)
    getAuthMode: builder.query<
      AuthModeResponse,
      { username: string; redirect?: string }
    >({
      query: ({ username, redirect }) => ({
        url: 'auth/mode',
        params: { username, redirect },
      }),
      // Pas de cache — l'email change à chaque tentative de login
      keepUnusedDataFor: 0,
    }),

    getSystem: builder.query<SystemResponse, void>({
      query: () => 'system',
      // Configuration statique définie par l'admin, cache 1h
      keepUnusedDataFor: 3600,
    }),

    // redirect: page where the identity provider sends the user back after its own logout (SSO)
    logout: builder.mutation<LogoutResponse, { redirect?: string } | void>({
      query: (args) => ({
        url: 'auth/logout',
        method: 'POST',
        params: args?.redirect ? { redirect: args.redirect } : undefined,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useGetAuthModeQuery,
  useLazyGetAuthModeQuery,
  useGetSystemQuery,
  useLogoutMutation,
} = authApi
