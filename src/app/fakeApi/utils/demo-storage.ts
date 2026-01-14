import { NextRequest, NextResponse } from 'next/server'

/**
 * Configuration for cookies for demo data storage
 */
const COOKIE_CONFIG = {
  maxAge: 60 * 60 * 24 * 30, // 30 jours
  sameSite: 'lax' as const,
  httpOnly: false, // Necessary for the client to read (if needed)
  secure: process.env.NODE_ENV === 'production',
}

/**
 * Taille maximale recommandée pour un cookie (4KB est la limite standard)
 * On utilise 3.5KB comme seuil de warning
 */
const MAX_COOKIE_SIZE = 3500 // bytes

/**
 * Read data from a cookie or return default data
 *
 * @param req - The Next.js request
 * @param cookieName - The name of the cookie to read
 * @param defaultValue - The default data if the cookie does not exist or is invalid
 * @returns The data parsed from the cookie or the default data
 *
 * @example
 * ```typescript
 * const calendars = getDemoData(req, 'demo_calendars', DEFAULT_CALENDARS)
 * ```
 */
export function getDemoData<T>(
  req: NextRequest,
  cookieName: string,
  defaultValue: T
): T {
  try {
    const cookieValue = req.cookies.get(cookieName)?.value

    // If the cookie does not exist, return the default data
    if (!cookieValue) {
      return defaultValue
    }

    // Parse the JSON from the cookie
    const parsed = JSON.parse(cookieValue) as T

    // Basic validation: check that it is an object
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn(
        `[demo-storage] Invalid data structure in cookie "${cookieName}", using defaults`
      )
      return defaultValue
    }

    // Return the parsed data
    return parsed
  } catch (error) {
    // If the parsing fails (invalid JSON), log the error and return the default data
    console.warn(
      `[demo-storage] Failed to parse cookie "${cookieName}":`,
      error instanceof Error ? error.message : 'Unknown error'
    )
    return defaultValue
  }
}

/**
 * Write data into a cookie in the response
 *
 * @param response - The Next.js response to which to add the cookie
 * @param cookieName - The name of the cookie
 * @param data - The data to store (will be serialized to JSON)
 *
 * @example
 * ```typescript
 * const response = NextResponse.json(newCalendar, { status: 201 })
 * setDemoData(response, 'demo_calendars', updatedCalendars)
 * return response
 * ```
 */
export function setDemoData<T>(
  response: NextResponse,
  cookieName: string,
  data: T
): void {
  try {
    // Serialize the data to JSON
    const jsonString = JSON.stringify(data)

    // Calculate the size in bytes (compatible with Node.js and browser)
    const sizeInBytes = Buffer.byteLength(jsonString, 'utf8')

    // Warning if the size exceeds the recommended threshold
    if (sizeInBytes > MAX_COOKIE_SIZE) {
      console.warn(
        `[demo-storage] Cookie "${cookieName}" size (${sizeInBytes} bytes) exceeds recommended limit (${MAX_COOKIE_SIZE} bytes). This may cause issues in some browsers.`
      )
    }

    // Set the cookie in the response
    response.cookies.set(cookieName, jsonString, COOKIE_CONFIG)
  } catch (error) {
    // Log the error but do not block the response
    console.error(
      `[demo-storage] Failed to set cookie "${cookieName}":`,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

/**
 * Clean the data if it exceeds a certain size
 * Useful to limit the growth of data in cookies
 * If the data has a created_at field, sort by date (most recent first)
 * Otherwise, keep only the last added items (FIFO)
 *
 * @param data - The data to clean
 * @param maxItems - Maximum number of items to keep
 * @returns The cleaned data
 *
 * @example
 * ```typescript
 * // Keep only the 50 most recent personal calendars
 * userCalendars.personal = cleanupOldData(userCalendars.personal, 50)
 * ```
 */
export function cleanupOldData<T>(data: T[], maxItems: number): T[] {
  if (data.length <= maxItems) {
    return data
  }

  // Check if the data has a valid created_at field
  const hasCreatedAt = data.some(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'created_at' in item &&
      typeof (item as { created_at?: unknown }).created_at === 'string'
  )

  if (hasCreatedAt) {
    // Sort by creation date (most recent first)
    const sorted = [...data].sort((a, b) => {
      const getDate = (item: T): number => {
        if (
          typeof item === 'object' &&
          item !== null &&
          'created_at' in item &&
          typeof (item as { created_at?: unknown }).created_at === 'string'
        ) {
          return new Date((item as { created_at: string }).created_at).getTime()
        }
        return 0
      }

      return getDate(b) - getDate(a)
    })
    return sorted.slice(0, maxItems)
  }

  // Otherwise, keep only the last added items (FIFO - First In, First Out)
  return data.slice(-maxItems)
}
