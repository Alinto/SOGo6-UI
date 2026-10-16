interface ComposeDraftContent {
  subject?: string
  body?: string
  toRecipients?: unknown[]
  ccRecipients?: unknown[]
  bccRecipients?: unknown[]
  attachments?: unknown[]
}

// Signature blocks inserted automatically by the editor (HTML widget and
// plain-text marker); they do not count as content the user wrote.
const SIGNATURE_SELECTOR = 'section.signature-widget, [data-signature-marker]'
const MEDIA_SELECTOR = 'img, table, iframe, video, audio, hr'

export function hasBodyContent(body: string | undefined): boolean {
  if (!body?.trim()) return false
  const doc = new DOMParser().parseFromString(body, 'text/html')
  doc.querySelectorAll(SIGNATURE_SELECTOR).forEach((node) => node.remove())
  if (doc.body.querySelector(MEDIA_SELECTOR)) return true
  return (doc.body.textContent ?? '').replace(/ /g, ' ').trim().length > 0
}

export function hasComposeDraftContent(draft: ComposeDraftContent): boolean {
  return (
    !!draft.subject?.trim() ||
    !!draft.toRecipients?.length ||
    !!draft.ccRecipients?.length ||
    !!draft.bccRecipients?.length ||
    !!draft.attachments?.length ||
    hasBodyContent(draft.body)
  )
}
