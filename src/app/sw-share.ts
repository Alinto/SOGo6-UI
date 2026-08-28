import { savePendingShare } from '../features/offline/share/pending-share'
import { pathnameFromRequestUrl } from './sw-runtime'

export function isShareTargetRequest(
  request: Pick<Request, 'method' | 'url'>
): boolean {
  if (request.method !== 'POST') return false
  return /\/share\/?$/.test(pathnameFromRequestUrl(request.url))
}

export async function handleShareTarget(request: Request): Promise<Response> {
  const form = await request.formData()
  const title = String(form.get('title') ?? form.get('subject') ?? '')
  const text = String(form.get('text') ?? form.get('body') ?? '')
  const sharedUrl = String(form.get('url') ?? '')
  const files = form.getAll('files').filter((entry): entry is File => {
    return typeof File !== 'undefined' && entry instanceof File
  })

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

  const locale =
    pathnameFromRequestUrl(request.url).split('/').filter(Boolean)[0] ?? 'en'
  const dest = new URL(`/${locale}/u/0/INBOX?compose=1&share=1`, request.url)
  return Response.redirect(dest, 303)
}
