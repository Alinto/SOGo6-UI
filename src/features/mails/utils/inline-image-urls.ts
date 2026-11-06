import { buildAttachmentUrl } from '@/features/mails/components/mail/utils'
import {
  decodedMailBody,
  findInlineImagePart,
  type InlineImagePart,
} from '@/features/mails/utils/prepare-mail-body-html'

const CID_SRC = /src\s*=\s*(['"])cid:([^'"]+)\1/gi

export type InlineImageFetchTarget = {
  name: string
  url: string
}

/**
 * Attachment URLs for cid images actually referenced in the HTML.
 * Each part is listed once, even when the same image is repeated.
 */
export function inlineImageFetchTargets(
  rawBody: string | undefined,
  parts: InlineImagePart[],
  attachmentsUrl: string
): InlineImageFetchTarget[] {
  if (!attachmentsUrl || !parts.length) return []
  const html = decodedMailBody(rawBody)
  const targets = new Map<string, string>()
  for (const match of html.matchAll(CID_SRC)) {
    const part = findInlineImagePart(match[2] ?? '', parts)
    if (!part?.name || targets.has(part.name)) continue
    const url = buildAttachmentUrl(`${attachmentsUrl}${part.name}`)
    if (url) targets.set(part.name, url)
  }
  return [...targets.entries()].map(([name, url]) => ({ name, url }))
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Download inline images with the session token.
 * `blob` is for the on-screen mail (revoke with URL.revokeObjectURL).
 * `data` is for print, so the document stays valid after the blob is gone.
 */
export async function fetchInlineImageDisplayUrls(
  targets: InlineImageFetchTarget[],
  token: string | null,
  kind: 'blob' | 'data'
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    targets.map(async (target) => {
      try {
        const response = await fetch(target.url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!response.ok) return null
        const blob = await response.blob()
        const displayUrl =
          kind === 'blob'
            ? URL.createObjectURL(blob)
            : await blobToDataUrl(blob)
        return [target.name, displayUrl] as const
      } catch {
        return null
      }
    })
  )
  return Object.fromEntries(
    entries.filter(
      (entry): entry is readonly [string, string] => entry !== null
    )
  )
}
