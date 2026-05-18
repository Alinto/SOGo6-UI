export interface TeamMember {
  name: string
  email: string
}

export interface BusyPeriod {
  from: string
  to: string
}

export interface AvailabilityData {
  [email: string]: {
    [dateKey: string]: BusyPeriod[]
  }
}

export interface Day {
  date: string
  dayName: string
  dayMonth: string
  dayOfWeek: number
}

export interface AvailabilitySlot {
  day: string
  hour: number
  quarter: number
  status: 'busy' | 'available' | 'non-working'
  isWorkingDay: boolean
  isWorkingHour: boolean
}

export interface PersonAvailability {
  person: string
  personName: string
  email: string
  availability: AvailabilitySlot[]
}

export interface OptimalSlot {
  /** YYYY-MM-DD UTC — same as `day.date` on the timeline */
  day: string
  /** Window start instant (UTC ms) */
  startMs: number
  /** Window end instant (UTC ms) */
  endMs: number
}

export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5] // Monday to Friday
export const DEFAULT_WORKING_HOURS = { start: 0, end: 23 } // 0 AM to 23 PM
export const DEFAULT_APPOINTMENT_DURATION = 90 // 90 minutes

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { name: 'Alice', email: 'alice@company.com' },
  { name: 'Bob', email: 'bob@company.com' },
  { name: 'Charlie', email: 'charlie@company.com' },
  { name: 'Diana', email: 'diana@company.com' },
  { name: 'Eva', email: 'eva@company.com' },
]

export const SAMPLE_API_DATA: AvailabilityData = {
  'alice@company.com': {
    '2025-09-15': [
      { from: '2025-09-15T09:15:00.000Z', to: '2025-09-15T10:15:00.000Z' },
      { from: '2025-09-15T14:00:00.000Z', to: '2025-09-15T15:00:00.000Z' },
      { from: '2025-09-15T16:00:00.000Z', to: '2025-09-15T16:30:00.000Z' },
    ],
    '2025-09-16': [
      { from: '2025-09-16T10:30:00.000Z', to: '2025-09-16T11:30:00.000Z' },
      { from: '2025-09-16T13:00:00.000Z', to: '2025-09-16T14:00:00.000Z' },
    ],
    '2025-09-17': [
      { from: '2025-09-17T09:00:00.000Z', to: '2025-09-17T10:00:00.000Z' },
      { from: '2025-09-17T12:00:00.000Z', to: '2025-09-17T13:00:00.000Z' },
    ],
  },
  'bob@company.com': {
    '2025-09-15': [
      { from: '2025-09-15T10:00:00.000Z', to: '2025-09-15T11:00:00.000Z' },
      { from: '2025-09-15T13:00:00.000Z', to: '2025-09-15T14:00:00.000Z' },
      { from: '2025-09-15T16:00:00.000Z', to: '2025-09-15T17:00:00.000Z' },
    ],
    '2025-09-16': [
      { from: '2025-09-16T09:45:00.000Z', to: '2025-09-16T10:45:00.000Z' },
      { from: '2025-09-16T12:00:00.000Z', to: '2025-09-16T13:00:00.000Z' },
    ],
    '2025-09-17': [
      { from: '2025-09-17T10:00:00.000Z', to: '2025-09-17T11:00:00.000Z' },
      { from: '2025-09-17T14:00:00.000Z', to: '2025-09-17T15:00:00.000Z' },
    ],
  },
  'charlie@company.com': {
    '2025-09-15': [
      { from: '2025-09-15T11:00:00.000Z', to: '2025-09-15T12:00:00.000Z' },
      { from: '2025-09-15T15:00:00.000Z', to: '2025-09-15T16:00:00.000Z' },
    ],
    '2025-09-16': [
      { from: '2025-09-16T09:00:00.000Z', to: '2025-09-16T10:00:00.000Z' },
      { from: '2025-09-16T14:00:00.000Z', to: '2025-09-16T15:00:00.000Z' },
      { from: '2025-09-16T16:00:00.000Z', to: '2025-09-16T16:30:00.000Z' },
    ],
  },
  'diana@company.com': {
    '2025-09-15': [
      { from: '2025-09-15T08:45:00.000Z', to: '2025-09-15T09:45:00.000Z' },
      { from: '2025-09-15T12:00:00.000Z', to: '2025-09-15T13:00:00.000Z' },
      { from: '2025-09-15T17:00:00.000Z', to: '2025-09-15T17:28:00.000Z' },
    ],
    '2025-09-16': [
      { from: '2025-09-16T11:30:00.000Z', to: '2025-09-16T12:30:00.000Z' },
      { from: '2025-09-16T15:00:00.000Z', to: '2025-09-16T16:00:00.000Z' },
    ],
    '2025-09-17': [
      { from: '2025-09-17T11:00:00.000Z', to: '2025-09-17T12:00:00.000Z' },
      { from: '2025-09-17T13:00:00.000Z', to: '2025-09-17T14:00:00.000Z' },
    ],
  },
  'eva@company.com': {
    '2025-09-15': [
      { from: '2025-09-15T08:15:00.000Z', to: '2025-09-15T09:15:00.000Z' },
      { from: '2025-09-15T14:30:00.000Z', to: '2025-09-15T15:30:00.000Z' },
    ],
    '2025-09-16': [
      { from: '2025-09-16T10:45:00.000Z', to: '2025-09-16T11:45:00.000Z' },
      { from: '2025-09-16T13:30:00.000Z', to: '2025-09-16T14:30:00.000Z' },
      { from: '2025-09-16T17:00:00.000Z', to: '2025-09-16T17:15:00.000Z' },
    ],
    '2025-09-17': [
      { from: '2025-09-17T09:30:00.000Z', to: '2025-09-17T10:30:00.000Z' },
      { from: '2025-09-17T15:00:00.000Z', to: '2025-09-17T16:00:00.000Z' },
    ],
  },
}

export const getNext7Days = (): Day[] => {
  const days: Day[] = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayMonth: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      dayOfWeek: date.getDay(),
    })
  }

  return days
}

export const getDayKey = (dateString: string): string => {
  return dateString
}

export const isQuarterBusy = (
  dateString: string,
  hour: number,
  quarter: number,
  busyPeriods: BusyPeriod[]
): boolean => {
  // dateString is YYYY-MM-DD from toISOString().split('T')[0] (UTC calendar day).
  const [year, month, day] = dateString.split('-').map(Number)
  const slotStart = new Date(
    Date.UTC(year, month - 1, day, hour, quarter * 15, 0, 0)
  )
  const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000)

  return busyPeriods.some((period) => {
    const periodStart = new Date(period.from)
    const periodEnd = new Date(period.to)
    return slotStart < periodEnd && slotEnd > periodStart
  })
}

export const generateAvailabilityData = (
  teamMembers: TeamMember[],
  workingDays: number[],
  workingHours: { start: number; end: number },
  busyData: AvailabilityData,
  /** When set (e.g. day-1 / center / day+1), must match the days rendered by the timeline. */
  gridDays?: Day[]
): { data: PersonAvailability[]; days: Day[] } => {
  const days = gridDays && gridDays.length > 0 ? gridDays : getNext7Days()

  // Pre-calculate working day set for faster lookup
  const workingDaysSet = new Set(workingDays)

  // Pre-calculate total slots needed
  const totalSlots = days.length * 24 * 4

  const availabilityRecords: PersonAvailability[] = teamMembers.map(
    (member) => {
      const personData: PersonAvailability = {
        person: `${member.name} (${member.email})`,
        personName: member.name,
        email: member.email,
        availability: new Array(totalSlots),
      }

      // Get busy periods for this member once
      const memberBusyData = busyData[member.email] || {}

      let slotIndex = 0
      for (const day of days) {
        const isWorkingDay = workingDaysSet.has(day.dayOfWeek)
        const dayKey = getDayKey(day.date)
        const dayBusyPeriods = memberBusyData[dayKey] || []

        for (let hour = 0; hour < 24; hour++) {
          const isWorkingHour =
            hour >= workingHours.start && hour <= workingHours.end

          for (let quarter = 0; quarter < 4; quarter++) {
            let status: 'busy' | 'available' | 'non-working' = 'non-working'

            if (isWorkingDay && isWorkingHour) {
              const isBusy = isQuarterBusy(
                day.date,
                hour,
                quarter,
                dayBusyPeriods
              )
              status = isBusy ? 'busy' : 'available'
            }

            personData.availability[slotIndex] = {
              day: day.date,
              hour,
              quarter,
              status,
              isWorkingDay,
              isWorkingHour,
            }
            slotIndex++
          }
        }
      }

      return personData
    }
  )

  return { data: availabilityRecords, days }
}

export const getVisibleHours = (workingHours: {
  start: number
  end: number
}): number[] => {
  const start = Math.max(6, workingHours.start - 1)
  const end = Math.min(22, workingHours.end + 1)
  if (end < start) {
    return Array.from({ length: 13 }, (_, i) => 6 + i)
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export const calculateMinWidth = (visibleHours: number[]): number => {
  return Math.max(800, 200 + visibleHours.length * 7 * 80)
}

export const getAllAvailableSlots = (
  days: Day[],
  availabilityData: PersonAvailability[],
  appointmentDuration: number
): OptimalSlot[] => {
  if (availabilityData.length === 0) return []

  const durationMs = appointmentDuration * 60 * 1000
  const result: OptimalSlot[] = []
  const slotsPerDay = 24 * 4

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex]
    const [y, mo, d] = day.date.split('-').map(Number)

    let gapStartMs: number | null = null

    for (let h = 0; h < 24; h++) {
      for (let q = 0; q < 4; q++) {
        const slotIndex = dayIndex * slotsPerDay + h * 4 + q
        const slotStartMs = Date.UTC(y, mo - 1, d, h, q * 15, 0, 0)

        const allFree = availabilityData.every(
          (person) =>
            person.availability[slotIndex]?.status === 'available'
        )

        if (allFree) {
          if (gapStartMs === null) gapStartMs = slotStartMs
        } else {
          if (gapStartMs !== null) {
            if (slotStartMs - gapStartMs >= durationMs) {
              result.push({
                day: day.date,
                startMs: gapStartMs,
                endMs: slotStartMs,
              })
            }
            gapStartMs = null
          }
        }
      }
    }

    if (gapStartMs !== null) {
      const dayEndMs = Date.UTC(y, mo - 1, d, 24, 0, 0, 0)
      if (dayEndMs - gapStartMs >= durationMs) {
        result.push({
          day: day.date,
          startMs: gapStartMs,
          endMs: dayEndMs,
        })
      }
    }
  }

  return result
}

export const isPartOfOptimalSlot = (
  allAvailableSlots: OptimalSlot[],
  dayDate: string,
  hour: number,
  quarter: number
): boolean => {
  const [y, mo, d] = dayDate.split('-').map(Number)
  const slotStartMs = Date.UTC(y, mo - 1, d, hour, quarter * 15, 0, 0)
  const slotEndMs = slotStartMs + 15 * 60 * 1000

  return allAvailableSlots.some(
    (s) =>
      s.day === dayDate &&
      slotStartMs >= s.startMs &&
      slotEndMs <= s.endMs
  )
}

/**
 * Parse backend compact UTC format "YYYYMMDDTHHmmSSZ" into a JavaScript Date.
 * Example: "20260511T090000Z" → new Date("2026-05-11T09:00:00Z")
 */
export function parseCompactUtc(compact: string): Date {
  const clean = compact.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    '$1-$2-$3T$4:$5:$6Z'
  )
  return new Date(clean)
}

/**
 * Map backend `FreeBusyData.attendees` into `AvailabilityData`
 * (shape expected by TimelineFreeBusy).
 */
export function mapBackendFreeBusyToAvailability(
  attendeesMap: Record<string, { periods: { start: string; end: string; type: string }[] }>,
  teamMembers: TeamMember[]
): AvailabilityData {
  const result: AvailabilityData = {}

  for (const member of teamMembers) {
    const normalizedEmail = member.email.trim()
    const mapKey =
      Object.keys(attendeesMap).find(
        (uid) => uid.toLowerCase() === normalizedEmail.toLowerCase()
      ) ?? normalizedEmail
    const backendData = attendeesMap[mapKey]
    if (!backendData) {
      result[member.email] = {}
      continue
    }

    const busyByDate: Record<string, BusyPeriod[]> = {}

    for (const period of backendData.periods) {
      if (
        period.type === 'busy' ||
        period.type === 'tentative' ||
        period.type === 'unavailable'
      ) {
        const startDate = parseCompactUtc(period.start)
        const endDate = parseCompactUtc(period.end)
        // UTC calendar day — must match timeline day.date (ISO date part, UTC).
        const dateKey = [
          startDate.getUTCFullYear(),
          String(startDate.getUTCMonth() + 1).padStart(2, '0'),
          String(startDate.getUTCDate()).padStart(2, '0'),
        ].join('-')

        if (!busyByDate[dateKey]) busyByDate[dateKey] = []
        busyByDate[dateKey].push({
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        })
      }
    }

    result[member.email] = busyByDate
  }

  return result
}
