/**
 * Wall-clock helpers: the calendar grid and the event form work with Date
 * objects whose *local* fields hold the time shown in a chosen timezone.
 * These helpers convert between such "wall-clock" Dates and real instants.
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    formatterCache.set(timeZone, formatter)
  }
  return formatter
}

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function timeZoneOffsetMs(instantMs: number, timeZone: string): number {
  const parts = getFormatter(timeZone).formatToParts(new Date(instantMs))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  )
  return asUtc - Math.floor(instantMs / 1000) * 1000
}

/** Date whose local fields show `instant` as seen in `timeZone`. */
export function toWallClock(instant: Date | string, timeZone: string): Date {
  const ms = new Date(instant).getTime()
  const shifted = new Date(ms + timeZoneOffsetMs(ms, timeZone))
  return new Date(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    shifted.getUTCHours(),
    shifted.getUTCMinutes(),
    shifted.getUTCSeconds(),
    shifted.getUTCMilliseconds()
  )
}

/** Real instant for a wall-clock Date (local fields) read in `timeZone`. */
export function fromWallClock(wall: Date, timeZone: string): Date {
  const asUtc = Date.UTC(
    wall.getFullYear(),
    wall.getMonth(),
    wall.getDate(),
    wall.getHours(),
    wall.getMinutes(),
    wall.getSeconds(),
    wall.getMilliseconds()
  )
  // Two passes settle the offset around DST transitions.
  let instant = asUtc - timeZoneOffsetMs(asUtc, timeZone)
  instant = asUtc - timeZoneOffsetMs(instant, timeZone)
  return new Date(instant)
}

/**
 * All-day bounds are stored as UTC midnights: show them as the same
 * calendar day at local midnight, whatever the browser timezone.
 */
export function allDayToLocalDate(iso: string): Date {
  const date = new Date(iso)
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/** Inverse of allDayToLocalDate: local calendar day → UTC midnight ISO. */
export function localDateToAllDayIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString()
}
