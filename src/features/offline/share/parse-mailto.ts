export interface ParsedMailto {
  to: { email: string; name?: string }[]
  subject: string
  body: string
}

function decodeMailtoPart(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

/** Parse `mailto:a@b.c?subject=Hi&body=Hello` (protocol handler %s). */
export function parseMailto(raw: string): ParsedMailto {
  const trimmed = raw.trim()
  const withoutScheme = trimmed.replace(/^mailto:/i, '')
  const [addressPart, queryPart] = withoutScheme.split('?')
  const to = decodeMailtoPart(addressPart)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((email) => ({ email }))

  const params = new URLSearchParams(queryPart ?? '')
  return {
    to,
    subject: decodeMailtoPart(params.get('subject') ?? ''),
    body: decodeMailtoPart(params.get('body') ?? ''),
  }
}
