import { MFA_LOGIN_ENDPOINTS, PUBLIC_AUTH_ENDPOINTS } from './auth-token'

/**
 * 401 on an authenticated call ends the session. Login, the MFA login step
 * (no user session yet, the page handles it) and logout stay local.
 */
export function shouldEndSession(
  endpoint: string | undefined,
  status: unknown
): boolean {
  if (status !== 401 || !endpoint) return false
  if (
    PUBLIC_AUTH_ENDPOINTS.has(endpoint) ||
    MFA_LOGIN_ENDPOINTS.has(endpoint) ||
    endpoint === 'logout'
  )
    return false
  return true
}
