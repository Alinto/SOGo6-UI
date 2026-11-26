export interface ParsedMailto {
  to: { email: string; name?: string }[]
  subject: string
  body: string
}

/** RFC 6068: percent-decoding only — `+` is a literal plus sign. */
function decodeMailtoPart(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function splitAddresses(value: string): { email: string }[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((email) => ({ email }))
}

/**
 * Parse `mailto:a@b.c?subject=Hi&body=Hello` (protocol handler %s) per
 * RFC 6068: the first `?` starts the header fields, each `name=value` pair
 * is percent-decoded exactly once, and a `to` field adds recipients.
 */
export function parseMailto(raw: string): ParsedMailto {
  const withoutScheme = raw.trim().replace(/^mailto:/i, '')
  const queryStart = withoutScheme.indexOf('?')
  const addressPart =
    queryStart === -1 ? withoutScheme : withoutScheme.slice(0, queryStart)
  const queryPart = queryStart === -1 ? '' : withoutScheme.slice(queryStart + 1)

  const to = splitAddresses(decodeMailtoPart(addressPart))
  let subject = ''
  let body = ''

  for (const field of queryPart.split('&')) {
    if (!field) continue
    const eq = field.indexOf('=')
    const name = decodeMailtoPart(eq === -1 ? field : field.slice(0, eq))
      .trim()
      .toLowerCase()
    const value = eq === -1 ? '' : decodeMailtoPart(field.slice(eq + 1))
    if (name === 'subject') subject = value
    else if (name === 'body') body = value.replace(/\r\n?/g, '\n')
    else if (name === 'to') to.push(...splitAddresses(value))
  }

  return { to, subject, body }
}
