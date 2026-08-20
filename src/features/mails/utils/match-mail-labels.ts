export type MailLabelCategory = {
  name: string
  color: string
}

export type MailLabelBulkState = 'checked' | 'indeterminate'

/**
 * Matches IMAP flag strings against the user's mail categories, case-insensitively.
 * Flags with no matching category (system flags like `\Seen`, unknown keywords) are dropped.
 */
export function matchMailLabels<T extends MailLabelCategory>(
  flags: string[] | undefined,
  categories: T[]
): T[] {
  if (!flags || flags.length === 0 || categories.length === 0) return []

  const byName = new Map(
    categories.map((category) => [category.name.toLowerCase(), category])
  )

  const seenNames = new Set<string>()
  const matched: T[] = []
  for (const flag of flags) {
    const category = byName.get(flag.toLowerCase())
    if (!category) continue
    const key = category.name.toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    matched.push(category)
  }
  return matched
}

/**
 * For a set of selected mails, determines per-category whether it is applied
 * to every mail ('checked'), only some of them ('indeterminate'), or none
 * (absent from the returned map — i.e. unchecked).
 */
export function getMailLabelBulkStates<T extends { name: string }>(
  mailsFlags: (string[] | undefined)[],
  categories: T[]
): Map<string, MailLabelBulkState> {
  const states = new Map<string, MailLabelBulkState>()
  if (mailsFlags.length === 0 || categories.length === 0) return states

  for (const category of categories) {
    const lowerName = category.name.toLowerCase()
    let count = 0
    for (const flags of mailsFlags) {
      if (flags?.some((flag) => flag.toLowerCase() === lowerName)) count++
    }
    if (count === 0) continue
    states.set(
      category.name,
      count === mailsFlags.length ? 'checked' : 'indeterminate'
    )
  }
  return states
}
