'use client'

/**
 * Utilities for form handling
 *
 * deepDiffNewValues: compare two objects and return only the new/changed values present in obj2.
 *
 * - If returnBoolean === true, returns a boolean indicating whether there are any differences.
 * - If fullObject === true and there are differences, returns obj2 instead of the diff object.
 */

export function deepDiffNewValues(
  obj1: any,
  obj2: any,
  fullObject = false,
  returnBoolean = false
): any {
  function isObject(v: any) {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
  }

  function compareObjects(o1: any = {}, o2: any = {}) {
    const diff: Record<string, any> = {}

    // iterate keys of o2 (we only care about new values present in o2)
    Object.keys(o2).forEach((key) => {
      const v2 = o2[key]
      const v1 = o1 ? o1[key] : undefined

      // arrays: compare via JSON stringify (simple but effective for config arrays)
      if (Array.isArray(v2)) {
        if (!Array.isArray(v1) || JSON.stringify(v1) !== JSON.stringify(v2)) {
          diff[key] = v2
        }
        return
      }

      // nested objects: recurse
      if (isObject(v2)) {
        const nestedDiff = compareObjects(isObject(v1) ? v1 : {}, v2)
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff
        }
        return
      }

      // primitives (including null/undefined)
      // Treat undefined in v1 and null differences as changes if they differ
      if (v1 !== v2) {
        diff[key] = v2
      }
    })

    return diff
  }

  const d = compareObjects(obj1 || {}, obj2 || {})

  if (returnBoolean) {
    return Object.keys(d).length > 0
  }

  if (fullObject && Object.keys(d).length > 0) {
    return obj2
  }

  return d
}

export default deepDiffNewValues
