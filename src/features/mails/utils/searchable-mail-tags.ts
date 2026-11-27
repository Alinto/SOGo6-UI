/** A tag listed by `GET mailboxes/{id}/tags`. */
export type MailboxTag = {
  name: string
  color?: string | null
  is_default: boolean
}

/** Color used for a tag that has none: follows the active UI theme. */
export const DEFAULT_TAG_COLOR = 'hsl(var(--primary))'

/** IMAP keywords the server sets for its own bookkeeping, not user tags. */
const SERVER_KEYWORDS = new Set(['junk', 'nonjunk'])

/** The tag's own color, or the theme color when it has none. */
export function tagColor(tag: Pick<MailboxTag, 'color'>): string {
  return tag.color?.trim() || DEFAULT_TAG_COLOR
}

/**
 * Keeps the user tags listed by `GET mailboxes/{id}/tags`: drops system
 * flags (`\Seen`), `$`-prefixed keywords (`$Forwarded`, `$MDNSent`) and the
 * server's Junk/NonJunk markers.
 */
export function toSearchableMailTags(
  tags: MailboxTag[] | undefined
): MailboxTag[] {
  if (!tags) return []
  return tags.filter((tag) => {
    const trimmed = tag.name?.trim()
    if (!trimmed) return false
    if (trimmed.startsWith('\\') || trimmed.startsWith('$')) return false
    return !SERVER_KEYWORDS.has(trimmed.toLowerCase())
  })
}

/**
 * Label filter options: the user's categories first, then the tags found on
 * mails that no category matches (compared case-insensitively). A kept entry
 * without a color takes the color of a skipped duplicate.
 */
export function mergeLabelOptions(
  categories: MailboxTag[],
  mailboxTags: MailboxTag[]
): MailboxTag[] {
  const byKey = new Map<string, MailboxTag>()
  for (const tag of [...categories, ...mailboxTags]) {
    const key = tag.name.toLowerCase()
    const kept = byKey.get(key)
    if (!kept) {
      byKey.set(key, tag)
    } else if (!kept.color?.trim() && tag.color?.trim()) {
      byKey.set(key, { ...kept, color: tag.color })
    }
  }
  return [...byKey.values()]
}
