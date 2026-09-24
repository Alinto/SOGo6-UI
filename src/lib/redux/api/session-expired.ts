const PUBLIC_AUTH_ENDPOINTS = new Set(['getSystem', 'getAuthMode', 'login'])

/** 401 on an authenticated call ends the session. Login and logout stay local. */
export function shouldEndSession(
  endpoint: string | undefined,
  status: unknown
): boolean {
  if (status !== 401 || !endpoint) return false
  if (PUBLIC_AUTH_ENDPOINTS.has(endpoint) || endpoint === 'logout') return false
  return true
}
