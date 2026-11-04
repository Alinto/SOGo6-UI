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
