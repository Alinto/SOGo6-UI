/** Cookie name used to persist per-mail IMAP flag overrides (e.g. custom mail categories). */
export const MAIL_FLAGS_COOKIE = 'demo_mail_flags'

export type MailFlagsOverrides = Record<string, string[]>

export function buildMailFlagsKey(folder: string, mailId: string): string {
  return `${folder}:${mailId}`
}

function normalizeActionData(
  data: string | string[] | null | undefined
): string[] {
  if (data == null) return []
  return Array.isArray(data) ? data : [data]
}

/**
 * Applies a `tag`/`untag` mail action to a flags array (used to persist custom
 * mail categories in the fake API, since IMAP keywords and categories share the
 * same flags array).
 */
export function applyFlagAction(
  currentFlags: string[],
  action: string,
  data: string | string[] | null | undefined
): string[] {
  const values = normalizeActionData(data)
  if (values.length === 0) return currentFlags

  if (action === 'tag') {
    const next = new Set(currentFlags)
    values.forEach((value) => next.add(value))
    return Array.from(next)
  }

  if (action === 'untag') {
    return currentFlags.filter((flag) => !values.includes(flag))
  }

  return currentFlags
}
