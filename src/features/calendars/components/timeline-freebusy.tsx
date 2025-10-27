'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useCallback, useMemo } from 'react'
import {
  type AvailabilityData,
  DEFAULT_APPOINTMENT_DURATION,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_WORKING_DAYS,
  DEFAULT_WORKING_HOURS,
  SAMPLE_API_DATA,
  type TeamMember,
  calculateMinWidth,
  generateAvailabilityData,
  getAllAvailableSlots,
  getVisibleHours,
  hasOptimalSlot,
  isPartOfOptimalSlot,
} from './utils'

interface TimelineFreeBusyProps {
  workingDays?: number[]
  workingHours?: { start: number; end: number }
  teamMembers?: TeamMember[]
  appointmentDuration?: number
  data?: AvailabilityData
}

const DEFAULT_DATA: AvailabilityData = SAMPLE_API_DATA

// Memoized sub-component for hour headers
const HourHeader = React.memo(function HourHeader({
  day,
  hour,
  workingHours,
  workingDays,
  isOptimalSlot,
}: {
  day: { date: string; dayName: string; dayMonth: string; dayOfWeek: number }
  hour: number
  workingHours: { start: number; end: number }
  workingDays: number[]
  isOptimalSlot: (_dayDate: string, _hour: number) => boolean
}) {
  const hasOptimalSlotInHour = isOptimalSlot(day.date, hour)
  const isWorkingHour = hour >= workingHours.start && hour <= workingHours.end
  const isWorkingDay = workingDays.includes(day.dayOfWeek)

  return (
    <div
      className={`flex-[0.2] border-l border-gray-200 py-1 text-center text-xs font-medium ${
        hasOptimalSlotInHour
          ? 'border-yellow-300 bg-yellow-100'
          : isWorkingDay && isWorkingHour
            ? 'bg-white'
            : 'bg-gray-100'
      }`}
    >
      {hour.toString().padStart(2, '0')}
      {hasOptimalSlotInHour && (
        <div className="flex justify-center">
          <div className="h-1 w-1 rounded-full bg-yellow-500"></div>
        </div>
      )}
    </div>
  )
})

// Memoized sub-component for quarter slots
const QuarterSlot = React.memo(function QuarterSlot({
  day,
  hour,
  quarter,
  person,
  days,
  isPartOfOptimal,
}: {
  day: { date: string }
  hour: number
  quarter: number
  person: {
    availability: Array<{ status: 'busy' | 'available' | 'non-working' }>
  }
  days: Array<{ date: string }>
  isPartOfOptimal: (
    _dayDate: string,
    _hour: number,
    _quarter: number
  ) => boolean
}) {
  const slotIndex = days.indexOf(day) * 24 * 4 + hour * 4 + quarter
  const slot = person.availability[slotIndex]
  const isPartOfOptimalSlot = isPartOfOptimal(day.date, hour, quarter)

  return (
    <div
      className={`hover flex-1 ${
        slot?.status === 'busy'
          ? 'bg-primary'
          : slot?.status === 'available'
            ? isPartOfOptimalSlot
              ? 'border-yellow-400 bg-yellow-200'
              : 'bg-secondary'
            : 'bg-gray-300'
      }`}
    />
  )
})

const TimelineFreeBusy = React.memo(function TimelineFreeBusy({
  workingDays = DEFAULT_WORKING_DAYS,
  workingHours = DEFAULT_WORKING_HOURS,
  teamMembers = DEFAULT_TEAM_MEMBERS,
  appointmentDuration = DEFAULT_APPOINTMENT_DURATION,
  data = DEFAULT_DATA,
}: TimelineFreeBusyProps = {}) {
  const { data: availabilityData, days } = useMemo(
    () =>
      generateAvailabilityData(teamMembers, workingDays, workingHours, data),
    [teamMembers, workingDays, workingHours, data]
  )

  const visibleHours = useMemo(
    () => getVisibleHours(workingHours),
    [workingHours]
  )

  const minWidth = useMemo(
    () => calculateMinWidth(visibleHours),
    [visibleHours]
  )

  const allAvailableSlots = useMemo(
    () => getAllAvailableSlots(days, availabilityData, appointmentDuration),
    [days, availabilityData, appointmentDuration]
  )

  const labels = useMemo(
    () => ({
      available: 'Available',
      busy: 'Busy',
      nonWorking: 'Non-working Hours',
      optimal: `Optimal ${appointmentDuration}min Appointment`,
    }),
    [appointmentDuration]
  )

  const isOptimalSlot = useCallback(
    (dayDate: string, hour: number) =>
      hasOptimalSlot(allAvailableSlots, dayDate, hour),
    [allAvailableSlots]
  )

  const isPartOfOptimal = useCallback(
    (dayDate: string, hour: number, quarter: number) =>
      isPartOfOptimalSlot(allAvailableSlots, dayDate, hour, quarter),
    [allAvailableSlots]
  )

  return (
    <Card className="w-full">
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: `${minWidth}px` }}>
            {/* Header with days and hours */}
            <div className="mb-2 flex">
              <div className="w-[200px] flex-shrink-0"></div>
              {/* Days header */}
              <div className="flex flex-[0.2]">
                {days.map((day) => (
                  <div
                    key={day.date}
                    className="flex-[0.2] border-l border-gray-200"
                  >
                    <div className="border-b border-gray-200 bg-gray-50 py-2 text-center text-sm font-medium">
                      {day.dayName} {day.dayMonth}
                    </div>
                    {/* Hours header for each day */}
                    <div className="flex">
                      {visibleHours.map((hour) => (
                        <HourHeader
                          key={`${day.date}-${hour}`}
                          day={day}
                          hour={hour}
                          workingHours={workingHours}
                          workingDays={workingDays}
                          isOptimalSlot={isOptimalSlot}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart rows */}
            <div className="space-y-[0.5]">
              {availabilityData.map((person) => (
                <div key={person.person} className="flex items-center">
                  {/* Person name */}
                  <div className="w-[200px] flex-shrink-0 truncate pr-4 text-sm font-medium">
                    {person.personName}
                    <div className="truncate text-xs text-gray-500">
                      {person.email}
                    </div>
                  </div>

                  {/* Availability bars */}
                  <div className="flex flex-[0.2]">
                    {days.map((day) => (
                      <div
                        key={`${person.personName}-${day.date}`}
                        className="flex h-10 flex-1 rounded-4xl"
                      >
                        {visibleHours.map((hour) => (
                          <div
                            key={`${day.date}-${hour}`}
                            className="flex flex-[0.2] cursor-pointer hover:opacity-80"
                          >
                            {/* Display 4 quarters within each hour */}
                            {[0, 1, 2, 3].map((quarter) => (
                              <QuarterSlot
                                key={`${day.date}-${hour}-${quarter}`}
                                day={day}
                                hour={hour}
                                quarter={quarter}
                                person={person}
                                days={days}
                                isPartOfOptimal={isPartOfOptimal}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="bg-secondary h-4 w-4 rounded"></div>
                <span className="text-sm">{labels.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary h-4 w-4 rounded"></div>
                <span className="text-sm">{labels.busy}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-300"></div>
                <span className="text-sm">{labels.nonWorking}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-yellow-400 bg-yellow-200"></div>
                <span className="text-sm">{labels.optimal}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export { TimelineFreeBusy }
