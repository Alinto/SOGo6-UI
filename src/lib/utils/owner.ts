type OwnerIdentity = {
  uid?: string | null
  email?: string | null
}

const normalize = (value: string) => value.trim().toLowerCase()

/**
 * An element (calendar, address book) is shared with the connected user when
 * its `owner` is set and is not one of the user's own identifiers.
 * Returns false when the owner or the user is unknown.
 */
export function isOtherOwner(
  owner: string | null | undefined,
  user: OwnerIdentity | null | undefined
): boolean {
  if (!owner || !user) return false

  const own = [user.email, user.uid]
    .filter((value): value is string => Boolean(value))
    .map(normalize)
  if (own.length === 0) return false

  return !own.includes(normalize(owner))
}

const compareText = (
  a: string | null | undefined,
  b: string | null | undefined
) =>
  (a ?? '').trim().localeCompare((b ?? '').trim(), undefined, {
    sensitivity: 'base',
    numeric: true,
  })

/**
 * Sorts shared elements alphabetically by owner email, then by name.
 * Case and accents are ignored. Returns a new array.
 */
export function sortByOwnerThenName<
  T extends { owner?: string | null; name?: string | null },
>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => compareText(a.owner, b.owner) || compareText(a.name, b.name)
  )
}
