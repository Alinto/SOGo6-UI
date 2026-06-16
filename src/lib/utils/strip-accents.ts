/**
 * Lowercase and strip accents for accent-insensitive text comparison.
 * Mirrors the backend strip_accents behaviour closely enough for fakeApi parity.
 */
export function stripAccents(text: string): string {
  const decomposed = text.normalize('NFKD')
  const noAccents = [...decomposed]
    .filter((char) => !/\p{M}/u.test(char))
    .join('')
  return noAccents.toLowerCase()
}

export function textMatchesSearch(haystack: string, query: string): boolean {
  const normalizedQuery = stripAccents(query.trim())
  if (normalizedQuery.length < 2) return true
  return stripAccents(haystack).includes(normalizedQuery)
}
