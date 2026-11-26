/** MIME types advertised in the manifest `share_target.params.files.accept`. */
export const SHARE_TARGET_ACCEPT = [
  'image/*',
  'text/plain',
  'text/html',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

/** True when `type` matches the manifest accept list (`image/*` wildcard included). */
export function isAcceptedShareType(type: string): boolean {
  const mime = type.split(';')[0]?.trim().toLowerCase() ?? ''
  if (!mime) return false
  return SHARE_TARGET_ACCEPT.some((accepted) =>
    accepted.endsWith('/*')
      ? mime.startsWith(accepted.slice(0, -1)) &&
        mime.length > accepted.length - 1
      : mime === accepted
  )
}

/**
 * A genuine OS share is a browser-initiated navigation (`Sec-Fetch-Site: none`).
 * Another site posting a form to `/{locale}/share` is `cross-site` / `same-site`.
 */
export function isForeignFetchSite(secFetchSite: string | null): boolean {
  return secFetchSite === 'cross-site' || secFetchSite === 'same-site'
}

/**
 * Service-worker variant: `Sec-Fetch-*` headers are added after the SW, so the
 * request referrer is the only initiator hint. Empty / `about:client` (browser
 * share sheet) and same-origin referrers are accepted.
 */
export function isForeignShareRequest(
  request: { headers: Pick<Headers, 'get'>; referrer: string },
  origin: string
): boolean {
  if (isForeignFetchSite(request.headers.get('sec-fetch-site'))) return true
  const referrer = request.referrer
  if (!referrer || referrer === 'about:client') return false
  try {
    return new URL(referrer).origin !== origin
  } catch {
    return true
  }
}
