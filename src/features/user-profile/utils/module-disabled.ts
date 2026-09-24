/** True only when the domain disable-list contains this module. Empty, null, and undefined allow it. */
export function moduleDisabled(
  value: string[] | null | undefined,
  module: string
): boolean {
  return Array.isArray(value) && value.includes(module)
}
