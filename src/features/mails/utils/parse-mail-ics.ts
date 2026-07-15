export type ImipMethod = 'REQUEST' | 'REPLY' | 'CANCEL' | 'unknown'

export type IcsAttendeeStatus =
  | 'needs-action'
  | 'accepted'
  | 'declined'
  | 'tentative'

export interface ParsedMailOrganizer {
  name?: string
  email: string
}

export interface ParsedMailInvitation {
  method: ImipMethod
  uid: string
  summary: string
  location?: string
  dtStart: string
  dtEnd?: string
  allDay: boolean
  organizer?: ParsedMailOrganizer
  /** PARTSTAT from REPLY messages (attendee who responded). */
  replyAttendeeStatus?: IcsAttendeeStatus
  replyAttendeeEmail?: string
  recurrenceId?: string
}

function unfoldIcsLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const unfolded = normalized.replace(/\n[ \t]/g, '')
  return unfolded.split('\n').map((line) => line.trim())
}

function parseMethod(lines: string[]): ImipMethod {
  for (const line of lines) {
    const upper = line.toUpperCase()
    if (upper.startsWith('METHOD:')) {
      const value = upper.slice('METHOD:'.length).trim()
      if (value === 'REQUEST' || value === 'REPLY' || value === 'CANCEL') {
        return value
      }
      return 'unknown'
    }
  }
  return 'unknown'
}

function parsePropertyValue(line: string, prefix: string): string | null {
  const upper = line.toUpperCase()
  const prefixUpper = prefix.toUpperCase()
  if (!upper.startsWith(prefixUpper)) return null
  const colonIdx = line.indexOf(':')
  if (colonIdx === -1) return null
  return line.slice(colonIdx + 1).trim()
}

function parseMailto(value: string): { name?: string; email: string } {
  const mailtoMatch = value.match(/mailto:([^;\s]+)/i)
  const email = (mailtoMatch?.[1] ?? value).trim().toLowerCase()
  const cnMatch = value.match(/CN=([^;:]+)/i)
  const name = cnMatch?.[1]?.replace(/^"|"$/g, '').trim()
  return { email, name: name || undefined }
}

function parsePartstat(line: string): IcsAttendeeStatus | undefined {
  const match = line.match(/PARTSTAT=([^;:\s]+)/i)
  if (!match) return undefined
  const raw = match[1].toLowerCase().replace(/_/g, '-')
  if (
    raw === 'needs-action' ||
    raw === 'accepted' ||
    raw === 'declined' ||
    raw === 'tentative'
  ) {
    return raw
  }
  return undefined
}

function parseDateValue(raw: string): { iso: string; allDay: boolean } {
  const value = raw.trim()
  if (/^\d{8}$/.test(value)) {
    const y = value.slice(0, 4)
    const m = value.slice(4, 6)
    const d = value.slice(6, 8)
    return { iso: `${y}-${m}-${d}T00:00:00.000Z`, allDay: true }
  }
  if (/^\d{8}T\d{6}Z?$/i.test(value)) {
    const y = value.slice(0, 4)
    const mo = value.slice(4, 6)
    const d = value.slice(6, 8)
    const h = value.slice(9, 11)
    const mi = value.slice(11, 13)
    const s = value.slice(13, 15)
    const z = value.endsWith('Z') ? 'Z' : ''
    return {
      iso: `${y}-${mo}-${d}T${h}:${mi}:${s}.000${z}`,
      allDay: false,
    }
  }
  return { iso: value, allDay: false }
}

function findVeventBlock(lines: string[]): string[] {
  const start = lines.findIndex((l) => l.toUpperCase() === 'BEGIN:VEVENT')
  if (start === -1) return lines
  const end = lines.findIndex(
    (l, i) => i > start && l.toUpperCase() === 'END:VEVENT'
  )
  if (end === -1) return lines.slice(start + 1)
  return lines.slice(start + 1, end)
}

/**
 * Parses a minimal subset of iCalendar/iMIP data for mail invitation display.
 * Returns null when the payload is empty or lacks a VEVENT UID.
 */
export function parseMailIcs(
  raw: string,
  options?: { currentUserEmail?: string }
): ParsedMailInvitation | null {
  const trimmed = raw?.trim()
  if (!trimmed || !trimmed.includes('BEGIN:VCALENDAR')) return null

  const lines = unfoldIcsLines(trimmed)
  const method = parseMethod(lines)
  const veventLines = findVeventBlock(lines)

  let uid: string | null = null
  let summary = ''
  let location: string | undefined
  let dtStart = ''
  let dtEnd: string | undefined
  let allDay = false
  let organizer: ParsedMailOrganizer | undefined
  let replyAttendeeStatus: IcsAttendeeStatus | undefined
  let replyAttendeeEmail: string | undefined
  let recurrenceId: string | undefined

  const normalizedUser = options?.currentUserEmail?.trim().toLowerCase()

  for (const line of veventLines) {
    const uidVal = parsePropertyValue(line, 'UID')
    if (uidVal) {
      uid = uidVal
      continue
    }

    const summaryVal = parsePropertyValue(line, 'SUMMARY')
    if (summaryVal) {
      summary = summaryVal
      continue
    }

    const locationVal = parsePropertyValue(line, 'LOCATION')
    if (locationVal) {
      location = locationVal
      continue
    }

    const dtStartVal = parsePropertyValue(line, 'DTSTART')
    if (dtStartVal) {
      const parsed = parseDateValue(dtStartVal)
      dtStart = parsed.iso
      allDay = parsed.allDay
      continue
    }

    const dtEndVal = parsePropertyValue(line, 'DTEND')
    if (dtEndVal) {
      dtEnd = parseDateValue(dtEndVal).iso
      continue
    }

    const recIdVal = parsePropertyValue(line, 'RECURRENCE-ID')
    if (recIdVal) {
      recurrenceId = parseDateValue(recIdVal).iso
      continue
    }

    if (line.toUpperCase().startsWith('ORGANIZER')) {
      const colonIdx = line.indexOf(':')
      if (colonIdx !== -1) {
        const parsed = parseMailto(line.slice(colonIdx + 1))
        const cnMatch = line.match(/CN=([^;:]+)/i)
        const cnName = cnMatch?.[1]?.replace(/^"|"$/g, '').trim()
        organizer = {
          email: parsed.email,
          name: cnName || parsed.name,
        }
      }
      continue
    }

    if (line.toUpperCase().startsWith('ATTENDEE')) {
      const colonIdx = line.indexOf(':')
      if (colonIdx !== -1) {
        const parsed = parseMailto(line.slice(colonIdx + 1))
        const partstat = parsePartstat(line)
        if (method === 'REPLY' && partstat) {
          replyAttendeeStatus = partstat
          replyAttendeeEmail = parsed.email
        } else if (
          normalizedUser &&
          parsed.email === normalizedUser &&
          partstat
        ) {
          replyAttendeeStatus = partstat
          replyAttendeeEmail = parsed.email
        }
      }
    }
  }

  if (!uid) return null

  return {
    method,
    uid,
    summary: summary || '(No title)',
    location,
    dtStart,
    dtEnd,
    allDay,
    organizer,
    replyAttendeeStatus,
    replyAttendeeEmail,
    recurrenceId,
  }
}
