/** RTK endpoint names that must not send Authorization (pre-login / public). */
export const PUBLIC_AUTH_ENDPOINTS = new Set([
  'getSystem',
  'getAuthMode',
  'login',
])

/**
 * RTK endpoint names of the second login step. They send the MFA token
 * (returned by /auth/login), not the user session token.
 */
export const MFA_LOGIN_ENDPOINTS = new Set([
  'mfaVerify',
  'mfaEnrollBegin',
  'mfaEnrollConfirm',
])

interface AuthTokens {
  token: string | null
  mfaPending?: { token: string } | null
}

/** Token to send as Bearer for this endpoint, null for none. */
export function pickAuthToken(
  auth: AuthTokens | undefined,
  endpoint: string
): string | null {
  if (!auth || PUBLIC_AUTH_ENDPOINTS.has(endpoint)) return null
  if (MFA_LOGIN_ENDPOINTS.has(endpoint)) return auth.mfaPending?.token ?? null
  return auth.token
}
