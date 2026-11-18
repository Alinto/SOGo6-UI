export interface JwtPayload {
  uid: string
  cn: string
  email: string
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) return false
  const payload = value as Record<string, unknown>
  return (
    typeof payload.uid === 'string' &&
    typeof payload.cn === 'string' &&
    typeof payload.email === 'string'
  )
}

export function decodeJwtPayload(token: string): JwtPayload {
  const [, payloadB64] = token.split('.')
  if (!payloadB64) {
    throw new Error('Invalid JWT')
  }

  const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))

  if (!isJwtPayload(parsed)) {
    throw new Error('Invalid JWT payload')
  }

  return parsed
}

export function isAbsoluteHttpUrl(location: string): boolean {
  try {
    const url = new URL(location)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function redirectToExternalLogin(location: string): void {
  window.location.assign(location)
}

export function hasSsoCallbackResult(hash: string): boolean {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(raw)
  return params.has('token') || params.has('error')
}

// Login CSRF protection for SSO: the API does not bind the login to the browser,
// so the UI puts a random nonce in the redirect url given to /auth/mode and keeps it
// in sessionStorage. The SSO landing page only accepts a result carrying the nonce
// of this browser tab: a callback link (or a #token= link) sent by someone else is refused.
export const SSO_NONCE_PARAM = 'sso_nonce'
const SSO_NONCE_STORAGE_KEY = 'sogo.sso_login_nonce'

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes)
  window.crypto.getRandomValues(values)
  return Array.from(values, (value) =>
    value.toString(16).padStart(2, '0')
  ).join('')
}

/**
 * Create the nonce of a new SSO login, kept by this browser tab, and return the
 * url of the SSO landing page with it. Throws if sessionStorage is not usable.
 */
export function createSsoRedirectUrl(origin: string, locale: string): string {
  const nonce = randomHex(32)
  window.sessionStorage.setItem(SSO_NONCE_STORAGE_KEY, nonce)
  const params = new URLSearchParams({ [SSO_NONCE_PARAM]: nonce })
  return `${origin}/${locale}/auth/login/sso?${params.toString()}`
}

/**
 * Check the nonce received on the SSO landing page against the one kept when the
 * login started, and forget it: a nonce is single use.
 */
export function consumeSsoNonce(received: string | null): boolean {
  let expected: string | null = null
  try {
    expected = window.sessionStorage.getItem(SSO_NONCE_STORAGE_KEY)
    window.sessionStorage.removeItem(SSO_NONCE_STORAGE_KEY)
  } catch {
    return false
  }
  return !!expected && !!received && expected === received
}
