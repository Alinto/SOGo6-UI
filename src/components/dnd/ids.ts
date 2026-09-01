export const dndId = {
  mail: (id: string) => `mail:${id}`,
  folder: (path: string) => `folder:${path}`,
  contact: (id: string) => `contact:${id}`,
  book: (id: string) => `book:${id}`,
} as const

export type DndEntityType = keyof typeof dndId

export type ParsedDndId = {
  type: DndEntityType
  value: string
}

const DND_ENTITY_TYPES = new Set<string>(Object.keys(dndId))

export function parseDndId(id: string | number): ParsedDndId | null {
  const raw = String(id)
  const separator = raw.indexOf(':')
  if (separator <= 0) return null
  const type = raw.slice(0, separator)
  const value = raw.slice(separator + 1)
  if (!DND_ENTITY_TYPES.has(type) || value.length === 0) return null
  return { type: type as DndEntityType, value }
}
