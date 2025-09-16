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
  day: string
  hour: number
  quarter: number
  duration: number
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
  // Create the start and end times for this 15-minute quarter
  const dayDate = new Date(dateString + 'T00:00:00.000Z')
  const slotStart = new Date(dayDate)
  slotStart.setUTCHours(hour, quarter * 15, 0, 0)
  const slotEnd = new Date(slotStart)
  slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + 15)

  // Check if this quarter overlaps with any busy period
  return busyPeriods.some((period) => {
    const periodStart = new Date(period.from)
    const periodEnd = new Date(period.to)

    // Check if slot overlaps with busy period
    return slotStart < periodEnd && slotEnd > periodStart
  })
}

export const generateAvailabilityData = (
  teamMembers: TeamMember[],
  workingDays: number[],
  workingHours: { start: number; end: number },
  busyData: AvailabilityData
): { data: PersonAvailability[]; days: Day[] } => {
  const days = getNext7Days()

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
  const startHour = Math.max(0, workingHours.start - 1)
  const endHour = Math.min(23, workingHours.end + 1)
  const visibleHours: number[] = []

  for (let hour = startHour; hour <= endHour; hour++) {
    visibleHours.push(hour)
  }

  return visibleHours
}

export const calculateMinWidth = (visibleHours: number[]): number => {
  return Math.max(800, 200 + visibleHours.length * 7 * 80)
}

export const getAllAvailableSlots = (
  days: Day[],
  availabilityData: PersonAvailability[],
  appointmentDuration: number
): OptimalSlot[] => {
  const allAvailableSlots: OptimalSlot[] = []
  const durationInQuarters = Math.ceil(appointmentDuration / 15)
  const totalQuartersPerDay = 24 * 4

  // Pre-build availability matrix for faster lookup
  const availabilityMatrix: boolean[][] = availabilityData.map((person) =>
    person.availability.map((slot) => slot.status === 'available')
  )

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex]

    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        let consecutiveAvailable = true

        // Check if we have enough consecutive quarters
        for (let q = 0; q < durationInQuarters; q++) {
          const currentHour = hour + Math.floor((quarter + q) / 4)
          const currentQuarter = (quarter + q) % 4
          const currentSlotIndex =
            dayIndex * totalQuartersPerDay + currentHour * 4 + currentQuarter

          // Break if we go beyond the day or beyond available slots
          if (
            currentHour >= 24 ||
            currentSlotIndex >= availabilityMatrix[0]?.length
          ) {
            consecutiveAvailable = false
            break
          }

          // Check if all people are available for this slot
          const isAllAvailable = availabilityMatrix.every(
            (personAvailability) => personAvailability[currentSlotIndex]
          )

          if (!isAllAvailable) {
            consecutiveAvailable = false
            break
          }
        }

        if (consecutiveAvailable) {
          allAvailableSlots.push({
            day: day.date,
            hour,
            quarter,
            duration: durationInQuarters,
          })
        }
      }
    }
  }

  return allAvailableSlots
}

export const hasOptimalSlot = (
  allAvailableSlots: OptimalSlot[],
  dayDate: string,
  hour: number
): boolean => {
  return allAvailableSlots.some((slot) => {
    const slotStartHour = slot.hour
    const slotEndHour =
      slotStartHour + Math.floor((slot.quarter + slot.duration - 1) / 4)
    return slot.day === dayDate && hour >= slotStartHour && hour <= slotEndHour
  })
}

export const isPartOfOptimalSlot = (
  allAvailableSlots: OptimalSlot[],
  dayDate: string,
  hour: number,
  quarter: number
): boolean => {
  return allAvailableSlots.some((optimalSlot) => {
    if (optimalSlot.day !== dayDate) return false

    const slotStartIndex = optimalSlot.hour * 4 + optimalSlot.quarter
    const slotEndIndex = slotStartIndex + optimalSlot.duration - 1
    const currentIndex = hour * 4 + quarter

    return currentIndex >= slotStartIndex && currentIndex <= slotEndIndex
  })
}
