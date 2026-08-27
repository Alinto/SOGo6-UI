export const LAST_ERROR_SNIPPET_MAX = 120

export function outboxLastErrorSnippet(
  lastError: string | null
): string | null {
  const trimmed = lastError?.trim()
  if (!trimmed) return null
  if (trimmed.length <= LAST_ERROR_SNIPPET_MAX) return trimmed
  return `${trimmed.slice(0, LAST_ERROR_SNIPPET_MAX)}…`
}
