import {
  blockExternalImages,
  decodeBase64,
  isBase64,
  replaceDataSrcWithSrc,
  sanitizeEmailHtml,
} from '@/features/mails/components/mail/utils'

export type PrepareMailBodyHtmlOptions = {
  includeExternalImages: boolean
}

/**
 * Shared pipeline for mail HTML display and print (decode → images policy → sanitize).
 */
export function prepareMailBodyHtml(
  rawBody: string | undefined,
  options: PrepareMailBodyHtmlOptions
): string {
  let html = rawBody ?? ''
  if (isBase64(html)) {
    html = decodeBase64(html)
  }
  if (options.includeExternalImages) {
    html = replaceDataSrcWithSrc(html)
  } else {
    html = blockExternalImages(html)
  }
  return sanitizeEmailHtml(html)
}
