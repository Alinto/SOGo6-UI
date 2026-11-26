import { apiSlice } from '@/lib/redux/api/api-slice'

export interface LoginRequest {
  username: string
  password: string
}

/** Login done, the user session is issued */
export interface LoginSessionData {
  jwt_token: string
}

/** The user has an MFA method: send its code to auth/mfa/verify */
export interface LoginMfaRequiredData {
  mfa_required: true
  provider: string
  mfa_token: string
}

/** MFA is enforced and the user has no method: set one up with mfa + mfa/confirm */
export interface LoginEnrollmentRequiredData {
  enrollment_required: true
  allowed_methods: string[]
  mfa_token: string
}

export type LoginData =
  | LoginSessionData
  | LoginMfaRequiredData
  | LoginEnrollmentRequiredData

export interface LoginResponse {
  data: LoginData
  error_code: string
  error_msg: string
}

export interface MfaCodeRequest {
  code: string
}

/** Start of a method setup. TOTP: otpauth_uri (QR code) and secret (manual entry) */
export interface MfaEnrollBeginData {
  provider: string
  otpauth_uri?: string
  secret?: string
}

export interface MfaEnrollBeginRequest {
  provider?: string
  /** Code of the current method, required to replace it */
  code?: string
  /** Password of the user, required for the first method from a user session (not in the forced enrollment) */
  password?: string
}

export interface MfaEnrollBeginResponse {
  data: MfaEnrollBeginData
  error_code: string
  error_msg: string
}

export interface MfaSessionResponse {
  data: LoginSessionData
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

export interface LogoutResponse {
  data: null
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

    // Second login step, sent with the MFA token (see MFA_LOGIN_ENDPOINTS)
    mfaVerify: builder.mutation<MfaSessionResponse, MfaCodeRequest>({
      query: (body) => ({ url: 'auth/mfa/verify', method: 'POST', body }),
    }),

    // Forced enrollment at login, sent with the MFA token (see MFA_LOGIN_ENDPOINTS)
    mfaEnrollBegin: builder.mutation<
      MfaEnrollBeginResponse,
      MfaEnrollBeginRequest
    >({
      query: (body) => ({ url: 'mfa', method: 'POST', body }),
    }),

    mfaEnrollConfirm: builder.mutation<MfaSessionResponse, MfaCodeRequest>({
      query: (body) => ({ url: 'mfa/confirm', method: 'POST', body }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
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
  useMfaVerifyMutation,
  useMfaEnrollBeginMutation,
  useMfaEnrollConfirmMutation,
} = authApi
