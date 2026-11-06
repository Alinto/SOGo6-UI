import {
  blockExternalImages,
  decodeBase64,
  isBase64,
  replaceDataSrcWithSrc,
  sanitizeEmailHtml,
} from '@/features/mails/components/mail/utils'

export type InlineImagePart = {
  name: string
  contentId?: string
  /** Blob or data URL already fetched with the session token. */
  displayUrl?: string
}

export type PrepareMailBodyHtmlOptions = {
  includeExternalImages: boolean
  /** Inline images (cid:) rewritten to displayUrl. Unfetched cid: values stay unchanged. */
  inlineImages?: {
    parts: InlineImagePart[]
  }
}

/** 1×1 gif shown while an inline image is still being fetched. */
export const INLINE_IMAGE_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export function decodedMailBody(rawBody: string | undefined): string {
  let html = rawBody ?? ''
  if (isBase64(html)) {
    html = decodeBase64(html)
  }
  return html
}

export function findInlineImagePart(
  cid: string,
  parts: InlineImagePart[]
): InlineImagePart | undefined {
  const key = cidKey(cid)
  const local = cidLocal(cid)
  return parts.find((candidate) => {
    if (candidate.contentId) {
      return (
        cidKey(candidate.contentId) === key ||
        cidLocal(candidate.contentId) === local
      )
    }
    const name = candidate.name.toLowerCase()
    return name === key || name === local
  })
}

function cidKey(value: string): string {
  let key = value.trim()
  if (key.toLowerCase().startsWith('cid:')) {
    key = key.slice(4)
  }
  try {
    key = decodeURIComponent(key)
  } catch {
    // Keep the raw value when it is not percent-encoded.
  }
  if (key.startsWith('<') && key.endsWith('>')) {
    key = key.slice(1, -1).trim()
  }
  return key.trim().toLowerCase()
}

function cidLocal(value: string): string {
  const key = cidKey(value)
  const at = key.indexOf('@')
  return at === -1 ? key : key.slice(0, at)
}

/**
 * Replace cid: image sources with an already fetched display URL.
 * A cid without displayUrl is left as-is: the attachment route requires the
 * session token, which an img tag cannot send.
 */
export function replaceCidImages(
  html: string,
  options: PrepareMailBodyHtmlOptions['inlineImages']
): string {
  if (!html || !options?.parts.length) {
    return html
  }
  const { parts } = options
  return html.replace(
    /(\bsrc\s*=\s*)(['"])cid:([^'"]+)\2/gi,
    (full, attr: string, quote: string, cid: string) => {
      const part = findInlineImagePart(cid, parts)
      if (!part?.displayUrl) return full
      return `${attr}${quote}${part.displayUrl}${quote}`
    }
  )
}

/**
 * Shared pipeline for mail HTML display and print (decode → images policy → sanitize).
 */
export function prepareMailBodyHtml(
  rawBody: string | undefined,
  options: PrepareMailBodyHtmlOptions
): string {
  let html = replaceCidImages(decodedMailBody(rawBody), options.inlineImages)
  if (options.includeExternalImages) {
    html = replaceDataSrcWithSrc(html)
  } else {
    html = blockExternalImages(html)
  }
  return sanitizeEmailHtml(html)
}
