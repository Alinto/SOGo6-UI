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

const SSO_NONCE_STORAGE_KEY = 'sogo.sso_nonce'
const SSO_NONCE_PARAM = 'nonce'

function createNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
}

/**
 * Url of the SSO landing page given to `auth/mode` as `redirect`.
 * It carries a nonce kept in this tab: the API does not bind the login to the
 * browser, so the landing page checks it to refuse a login started elsewhere (login CSRF).
 */
export function buildSsoRedirectUrl(origin: string, locale: string): string {
  const nonce = createNonce()
  sessionStorage.setItem(SSO_NONCE_STORAGE_KEY, nonce)
  const url = new URL(`/${locale}/auth/login/sso`, origin)
  url.searchParams.set(SSO_NONCE_PARAM, nonce)
  return url.toString()
}

/**
 * True if the nonce of the landing page query is the one stored when this tab
 * started the SSO login. The stored nonce is removed: it can only be used once.
 */
export function consumeSsoNonce(search: string): boolean {
  const received = new URLSearchParams(search).get(SSO_NONCE_PARAM)
  let expected: string | null = null
  try {
    expected = sessionStorage.getItem(SSO_NONCE_STORAGE_KEY)
    sessionStorage.removeItem(SSO_NONCE_STORAGE_KEY)
  } catch {
    return false
  }
  return Boolean(received) && received === expected
}
