/**
 * Utility functions for handling admin config field dependencies
 */

export interface ParsedDependency {
  fieldName: string
  operator: string
  value: string
}

/**
 * Parse dependency condition string
 * Format: "FIELD_NAME%%%OPERATOR%%%VALUE"
 * Example: "US_TYPE%%%equal%%%ldap"
 */
export function parseDependency(
  depends: string | null
): ParsedDependency | null {
  if (!depends) return null
  const parts = depends.split('%%%')
  if (parts.length !== 3) return null
  return {
    fieldName: parts[0],
    operator: parts[1],
    value: parts[2],
  }
}

/**
 * Try to normalize a "value" string into boolean/number if it looks like one,
 * otherwise return the original string.
 */
function parseValueString(valueStr: string): unknown {
  const s = valueStr.trim()

  // boolean (case insensitive)
  if (/^(true|false)$/i.test(s)) {
    return s.toLowerCase() === 'true'
  }

  // number
  const n = Number(s)
  if (!Number.isNaN(n) && s !== '') {
    return n
  }

  // try JSON parse (for arrays/objects) - safe fallback
  try {
    return JSON.parse(s)
  } catch {
    // fallback to original string
    return valueStr
  }
}

/**
 * Check if a field's dependency condition is met
 * Used to determine if child fields should be visible
 */
export function isDependencyMet(
  dependency: ParsedDependency,
  parentValue: unknown
): boolean {
  const { operator, value } = dependency

  // Prepare normalized comparison value when useful
  const normalizedRight = parseValueString(value)

  switch (operator) {
    case 'equal':
      // If normalizedRight is boolean or number, compare strict equality
      if (
        typeof normalizedRight === 'boolean' ||
        typeof normalizedRight === 'number'
      ) {
        return parentValue === normalizedRight
      }
      // fallback: compare strings case-insensitively
      return String(parentValue).toLowerCase() === String(value).toLowerCase()

    case 'notequal':
      if (
        typeof normalizedRight === 'boolean' ||
        typeof normalizedRight === 'number'
      ) {
        return parentValue !== normalizedRight
      }
      return String(parentValue).toLowerCase() !== String(value).toLowerCase()

    case 'contains':
      return Array.isArray(parentValue) && parentValue.includes(value)

    case 'notcontains':
      return Array.isArray(parentValue) && !parentValue.includes(value)

    case 'greaterthan': {
      const leftNum = Number(parentValue)
      const rightNum =
        typeof normalizedRight === 'number' ? normalizedRight : Number(value)
      if (Number.isNaN(leftNum) || Number.isNaN(rightNum)) return false
      return leftNum > rightNum
    }

    case 'lessthan': {
      const leftNum = Number(parentValue)
      const rightNum =
        typeof normalizedRight === 'number' ? normalizedRight : Number(value)
      if (Number.isNaN(leftNum) || Number.isNaN(rightNum)) return false
      return leftNum < rightNum
    }

    case 'exists':
      return parentValue != null

    case 'notexists':
      return parentValue == null

    default:
      return false
  }
}

/**
 * Get all visible children for a field based on its current value
 * This only returns direct children (one level deep)
 */
export function getVisibleChildren<
  T extends { depends: string | null; value?: unknown },
>(field: { value?: unknown; children?: Array<T> }): Array<T> {
  if (!field.children || field.children.length === 0) return []

  return field.children.filter((child) => {
    const dependency = parseDependency(child.depends)
    if (!dependency) return true // No dependency means always visible
    return isDependencyMet(dependency, field.value)
  })
}

/**
 * Recursively get all visible descendants (children, grandchildren, etc.)
 * Returns a flat array of all visible fields at any depth
 */
export function getAllVisibleDescendants<
  T extends { depends: string | null; value?: unknown; children?: Array<T> },
>(field: { value?: unknown; children?: Array<T> }): Array<T> {
  const visibleChildren = getVisibleChildren(field)
  const allDescendants: Array<T> = []

  visibleChildren.forEach((child) => {
    allDescendants.push(child)
    // Recursively get descendants of this child
    const childDescendants = getAllVisibleDescendants(child)
    allDescendants.push(...childDescendants)
  })

  return allDescendants
}

/**
 * Check if any descendants of a field are visible
 * Useful for showing/hiding entire sections
 */
export function hasVisibleDescendants<
  T extends { depends: string | null; value?: unknown; children?: Array<T> },
>(field: { value?: unknown; children?: Array<T> }): boolean {
  return getAllVisibleDescendants(field).length > 0
}
