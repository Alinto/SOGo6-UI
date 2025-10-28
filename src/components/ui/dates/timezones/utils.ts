import type { Timezone } from './types'

/**
 * Get timezone offset in GMT format (e.g., "GMT+02:00" or "GMT-05:00")
 */
export function getTimezoneOffset(timeZone: string, locale?: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: 'shortOffset',
    })

    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find((part) => part.type === 'timeZoneName')

    if (offsetPart && offsetPart.value) {
      return formatOffsetFromPart(offsetPart.value)
    }

    // Fallback: calculate offset manually
    return calculateOffsetManually(timeZone, locale)
  } catch {
    return 'GMT+00:00'
  }
}

/**
 * Format offset from Intl format to GMT format
 */
function formatOffsetFromPart(offsetValue: string): string {
  const offset = offsetValue.replace('GMT', '')
  if (offset === '') return 'GMT+00:00'

  const match = offset.match(/([+-])(\d+)(?::(\d+))?/)
  if (match) {
    const sign = match[1]
    const hours = match[2].padStart(2, '0')
    const minutes = match[3] || '00'
    return `GMT${sign}${hours}:${minutes}`
  }

  return 'GMT+00:00'
}

/**
 * Calculate timezone offset manually as fallback
 */
function calculateOffsetManually(timeZone: string, locale?: string): string {
  const now = new Date()
  const utcDate = new Date(now.toLocaleString(locale, { timeZone: 'UTC' }))
  const tzDate = new Date(now.toLocaleString(locale, { timeZone }))
  const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000

  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absOffset = Math.abs(offsetMinutes)
  const hours = Math.floor(absOffset / 60)
    .toString()
    .padStart(2, '0')
  const minutes = (absOffset % 60).toString().padStart(2, '0')

  return `GMT${sign}${hours}:${minutes}`
}

/**
 * Parse offset string to numeric value for sorting
 */
export function parseOffset(offset: string): number {
  return parseFloat(offset.replace(':', '.'))
}

/**
 * Format timezone name for display
 */
export function formatTimezoneName(timeZone: string): string {
  return timeZone.replace(/_/g, ' ')
}

/**
 * Get all available timezones using Intl API
 */
export function getTimezones(locale?: string): Timezone[] {
  const timezones: Timezone[] = []

  // Get all supported timezones from Intl API
  const timeZoneNames = Intl.supportedValuesOf('timeZone')

  for (const timeZone of timeZoneNames) {
    const offset = getTimezoneOffset(timeZone, locale)
    const label = `${offset} ${formatTimezoneName(timeZone)}`

    timezones.push({
      value: timeZone,
      label,
      offset: offset.replace('GMT', ''),
    })
  }

  // Sort by offset, then by name
  timezones.sort((a, b) => {
    const offsetA = parseOffset(a.offset)
    const offsetB = parseOffset(b.offset)
    if (offsetA !== offsetB) {
      return offsetA - offsetB
    }
    return a.value.localeCompare(b.value)
  })

  return timezones
}
