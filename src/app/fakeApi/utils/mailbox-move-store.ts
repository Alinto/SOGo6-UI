/** Cookie name used to persist demo mail moves (e.g. report as phishing/illegal → Junk). */
export const MAIL_MOVES_COOKIE = 'demo_mail_moves'

/**
 * Per-mail folder overrides, keyed by mail id (demo seed ids are unique across
 * folders, e.g. `inbox_001`, `junk_001`), mapping to the folder the mail was
 * moved into.
 */
export type MailMoveOverrides = Record<string, string>
