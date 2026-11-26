import {
  capShareFiles,
  savePendingShare,
} from '../features/offline/share/pending-share'
import {
  isAcceptedShareType,
  isForeignShareRequest,
} from '../features/offline/share/share-target-policy'
import {
  isOfflineLocale,
  pathnameFromRequestUrl,
  shareLocaleFromPathname,
} from './sw-runtime'

/** Exact `/{locale}/share` (manifest `share_target.action`) on this origin. */
export function isShareTargetRequest(
  request: Pick<Request, 'method' | 'url'>,
  origin: string
): boolean {
  if (request.method !== 'POST') return false
  let url: URL
  try {
    url = new URL(request.url)
  } catch {
    return false
  }
  if (url.origin !== origin) return false
  const segments = url.pathname.split('/')
  // ['', locale, 'share'] or ['', locale, 'share', ''] (trailing slash)
  if (segments.length < 3 || segments.length > 4) return false
  if (segments.length === 4 && segments[3] !== '') return false
  return segments[2] === 'share' && isOfflineLocale(segments[1] ?? '')
}

export function shareRedirectPath(
  locale: string,
  outcome: 'ok' | 'error' | 'rejected'
): string {
  const inbox = `/${locale}/u/0/INBOX`
  if (outcome === 'rejected') return inbox
  if (outcome === 'error') return `${inbox}?compose=1&share=1&share_error=1`
  return `${inbox}?compose=1&share=1`
}

export async function handleShareTarget(
  request: Request,
  origin: string
): Promise<Response> {
  const locale = shareLocaleFromPathname(pathnameFromRequestUrl(request.url))
  const redirect = (outcome: 'ok' | 'error' | 'rejected') =>
    Response.redirect(
      new URL(shareRedirectPath(locale, outcome), request.url),
      303
    )

  if (isForeignShareRequest(request, origin)) return redirect('rejected')

  try {
    const form = await request.formData()
    const title = String(form.get('title') ?? form.get('subject') ?? '')
    const text = String(form.get('text') ?? form.get('body') ?? '')
    const sharedUrl = String(form.get('url') ?? '')
    const files = capShareFiles(
      form.getAll('files').filter((entry): entry is File => {
        return (
          typeof File !== 'undefined' &&
          entry instanceof File &&
          isAcceptedShareType(entry.type)
        )
      })
    )

    await savePendingShare({
      to: '',
      subject: title,
      body: text,
      url: sharedUrl,
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        blob: file,
      })),
    })
  } catch {
    return redirect('error')
  }

  return redirect('ok')
}
