interface JwtPayload {
  uid: string
  cn: string
  email: string
}

export function decodeJwtPayload(token: string): JwtPayload {
  const [, payloadB64] = token.split('.')
  // Convertir base64url → base64 standard
  const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as JwtPayload
}
