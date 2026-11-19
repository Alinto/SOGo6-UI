/** IMAP keywords the server sets for its own bookkeeping, not user tags. */
const SERVER_KEYWORDS = new Set(['junk', 'nonjunk'])

/**
 * Keeps the user tags from the raw IMAP flags listed by
 * `GET mailboxes/{id}/tags`: drops system flags (`\Seen`), `$`-prefixed
 * keywords (`$Forwarded`, `$MDNSent`) and the server's Junk/NonJunk markers.
 */
export function toSearchableMailTags(tags: string[] | undefined): string[] {
  if (!tags) return []
  return tags.filter((tag) => {
    const trimmed = tag.trim()
    if (!trimmed) return false
    if (trimmed.startsWith('\\') || trimmed.startsWith('$')) return false
    return !SERVER_KEYWORDS.has(trimmed.toLowerCase())
  })
}

/**
 * Label filter options: the user's categories first, then the tags found on
 * mails that no category matches (compared case-insensitively).
 */
export function mergeLabelOptions(
  categoryNames: string[],
  mailboxTags: string[]
): string[] {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const name of [...categoryNames, ...mailboxTags]) {
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(name)
  }
  return merged
}
