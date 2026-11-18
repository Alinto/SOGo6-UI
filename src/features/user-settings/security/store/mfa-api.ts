import type {
  MfaCodeRequest,
  MfaEnrollBeginRequest,
  MfaEnrollBeginResponse,
} from '@/features/auth/components/store/auth.api'
import { apiSlice, MFA_SLICE } from '@/lib/redux/api/api-slice'

/** Active method of the user. Never contains the secret. */
export interface MfaMethodStatus {
  provider: string
  created_at: string | null
  last_used_at: string | null
}

export interface MfaStatus {
  enabled: boolean
  enforced: boolean
  allowed_methods: string[]
  method: MfaMethodStatus | null
}

export interface MfaStatusResponse {
  data: MfaStatus
  error_code: string
  error_msg: string
}

/** MFA of the authenticated user (preferences -> security), sent with the user session */
export const mfaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMfaStatus: builder.query<MfaStatusResponse, void>({
      query: () => 'mfa',
      providesTags: [MFA_SLICE],
    }),

    // Start a setup. `code` (current method) is required to replace an existing method.
    // Nothing is saved until confirmMfaSetup.
    beginMfaSetup: builder.mutation<
      MfaEnrollBeginResponse,
      MfaEnrollBeginRequest
    >({
      query: (body) => ({ url: 'mfa', method: 'POST', body }),
    }),

    confirmMfaSetup: builder.mutation<MfaStatusResponse, MfaCodeRequest>({
      query: (body) => ({ url: 'mfa/confirm', method: 'POST', body }),
      invalidatesTags: [MFA_SLICE],
    }),

    disableMfa: builder.mutation<MfaStatusResponse, MfaCodeRequest>({
      query: (body) => ({ url: 'mfa', method: 'DELETE', body }),
      invalidatesTags: [MFA_SLICE],
    }),
  }),
})

export const {
  useGetMfaStatusQuery,
  useBeginMfaSetupMutation,
  useConfirmMfaSetupMutation,
  useDisableMfaMutation,
} = mfaApi
