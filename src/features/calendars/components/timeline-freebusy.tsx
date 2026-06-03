'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, {
  type CSSProperties,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import {
  type AvailabilityData,
  type Day,
  DEFAULT_APPOINTMENT_DURATION,
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_WORKING_DAYS,
  DEFAULT_WORKING_HOURS,
  generateAvailabilityData,
  getAllAvailableSlots,
  getVisibleHours,
  isPartOfOptimalSlot,
  type PersonAvailability,
  type TeamMember,
} from './utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type DayMeta = Day & {
  label: string
  isToday: boolean
  isCenter: boolean
}

type SlotArray = PersonAvailability['availability']

type SlotStatusFn = (
  avail: SlotArray,
  date: string,
  h: number,
  q: number
) => 'busy' | 'available' | 'non-working'

type HourStatusFn = (
  avail: SlotArray,
  date: string,
  h: number
) => 'busy' | 'available' | 'non-working' | 'mixed'

type CalendarsT = ReturnType<typeof useTranslations>

interface TimelineFreeBusyProps {
  teamMembers?: TeamMember[]
  workingDays?: number[]
  workingHours?: { start: number; end: number }
  appointmentDuration?: number
  data?: AvailabilityData
  isLoading?: boolean
  centerDate?: Date
}

interface GridHeaderProps {
  days: DayMeta[]
  hours: number[]
  workingDays: number[]
  workingHours: { start: number; end: number }
  t: CalendarsT
}

interface PersonRowProps {
  person: PersonAvailability
  index: number
  days: DayMeta[]
  hours: number[]
  workingDays: number[]
  workingHours: { start: number; end: number }
  appointmentDuration: number
  slotStatus: SlotStatusFn
  hourStatus: HourStatusFn
  isOptimal: (date: string, h: number, q: number) => boolean
  t: CalendarsT
}

interface LegendProps {
  t: CalendarsT
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const HOUR_W = 52
const NAME_W = 152
const ROW_H = 38
const HEAD_H = 44
const LABEL_H = 22

/** Shadow on the right edge of the sticky name column (horizontal scroll). */
const NAME_COL_EDGE_SHADOW = '2px 0 8px -2px rgba(0, 0, 0, 0.12)'

/** z-index: grid header above timeline body when scrolling vertically. */
const Z_GRID_HEADER = 10
const Z_EVENT_MARKER = 9
const Z_NAME_COL = 12
const Z_HEADER_NAME_CORNER = 18

// ─── Status styles (inline: avoids Tailwind purge) ───────────────────────────

const S: Record<string, CSSProperties> = {
  busy: { backgroundColor: 'rgba(245,158,11,0.88)' },
  tentative: { backgroundColor: 'rgba(251,191,36,0.65)' },
  available: { backgroundColor: 'rgba(52,211,153,0.18)' },
  optimal: { backgroundColor: 'rgba(16,185,129,0.82)' },
  nonworking: { backgroundColor: 'rgba(148,163,184,0.22)' },
}

const LEGEND_ITEM_KEYS: ReadonlyArray<{
  key: string
  style: CSSProperties
  i18nKey:
    | 'eventForm.attendees.legend_busy.string'
    | 'eventForm.attendees.legend_tentative.string'
    | 'eventForm.attendees.legend_free.string'
    | 'eventForm.attendees.legend_non_working.string'
}> = [
  {
    key: 'nonworking',
    style: S.nonworking,
    i18nKey: 'eventForm.attendees.legend_non_working.string',
  },
  { key: 'busy', style: S.busy, i18nKey: 'eventForm.attendees.legend_busy.string' },
  {
    key: 'tentative',
    style: S.tentative,
    i18nKey: 'eventForm.attendees.legend_tentative.string',
  },
  {
    key: 'available',
    style: S.available,
    i18nKey: 'eventForm.attendees.legend_free.string',
  },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="border-border bg-card rounded-xl border">
      {Array.from({ length: Math.max(rows, 1) }).map((_, i) => (
        <div
          key={i}
          className="border-border/40 flex items-center gap-3 border-b px-3 py-3 last:border-0"
        >
          <div className="w-36 shrink-0 space-y-1.5">
            <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            <div className="bg-muted/60 h-2 w-28 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-9 flex-1 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GridHeader({
  days,
  hours,
  workingDays,
  workingHours,
  t,
}: GridHeaderProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: Z_GRID_HEADER,
        display: 'flex',
        background: 'hsl(var(--card))',
        borderBottom: '1px solid var(--border)',
        height: HEAD_H + LABEL_H,
      }}
    >
      <div
        style={{
          position: 'sticky',
          left: 0,
          top: 0,
          zIndex: Z_HEADER_NAME_CORNER,
          width: NAME_W,
          minWidth: NAME_W,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'hsl(var(--card))',
          boxShadow: NAME_COL_EDGE_SHADOW,
        }}
      />

      {days.map((day) => (
        <div
          key={day.date}
          style={{
            width: hours.length * HOUR_W,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            background: day.isCenter
              ? 'rgba(var(--primary-rgb, 16 185 129) / 0.05)'
              : undefined,
          }}
        >
          <div
            style={{
              height: HEAD_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              borderBottom: '1px solid var(--border)',
              fontSize: day.isCenter ? 13 : 11,
              fontWeight: day.isCenter ? 600 : 400,
              color: day.isCenter
                ? 'var(--primary)'
                : 'var(--muted-foreground)',
              textTransform: 'capitalize',
            }}
          >
            {day.label}
          </div>

          <div style={{ height: LABEL_H, display: 'flex' }}>
            {hours.map((h) => {
              const inWorkDay = workingDays.includes(day.dayOfWeek)
              const inWorkHour =
                h >= workingHours.start && h <= workingHours.end
              return (
                <div
                  key={h}
                  style={{
                    width: HOUR_W,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 4,
                    borderRight: '1px solid rgba(148,163,184,0.15)',
                    background:
                      inWorkDay && inWorkHour
                        ? undefined
                        : 'rgba(148,163,184,0.08)',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: 'rgba(148,163,184,0.6)',
                    userSelect: 'none',
                  }}
                >
                  {h % 2 === 0
                    ? t('eventForm.attendees.timeline_hour.string', {
                        hour: String(h).padStart(2, '0'),
                      })
                    : null}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const PersonRow = React.memo(function PersonRow({
  person,
  index,
  days,
  hours,
  workingDays,
  workingHours,
  appointmentDuration,
  slotStatus,
  hourStatus,
  isOptimal,
  t,
}: PersonRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: ROW_H,
        borderBottom: '1px solid rgba(148,163,184,0.15)',
        background: index % 2 === 0 ? undefined : 'rgba(148,163,184,0.04)',
      }}
    >
      <div
        style={{
          position: 'sticky',
          left: 0,
          zIndex: Z_NAME_COL,
          width: NAME_W,
          minWidth: NAME_W,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
          padding: '0 12px',
          borderRight: '1px solid var(--border)',
          background:
            index % 2 === 0 ? 'hsl(var(--card))' : 'hsl(var(--muted))',
          boxShadow: NAME_COL_EDGE_SHADOW,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {person.personName}
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'var(--muted-foreground)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {person.email}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {days.map((day) => {
          const inWorkDay = workingDays.includes(day.dayOfWeek)
          return (
            <div
              key={day.date}
              style={{
                width: hours.length * HOUR_W,
                display: 'flex',
                height: '100%',
                borderRight: '1px solid rgba(148,163,184,0.15)',
                background: day.isCenter ? 'rgba(16,185,129,0.025)' : undefined,
              }}
            >
              {hours.map((h) => {
                const inWorkHour =
                  h >= workingHours.start && h <= workingHours.end
                const active = inWorkDay && inWorkHour
                const dominant = hourStatus(person.availability, day.date, h)

                // Per-quarter optimal coverage. If partial within the hour,
                // we must render quarter-by-quarter to respect the boundary
                // (e.g. busy ends at 17:30 → optimal starts at 17:30, not 17:00).
                const optimalFlags: readonly [
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                ] = [
                  isOptimal(day.date, h, 0),
                  isOptimal(day.date, h, 1),
                  isOptimal(day.date, h, 2),
                  isOptimal(day.date, h, 3),
                ]
                const optimalAll = optimalFlags.every(Boolean)
                const optimalAny = optimalFlags.some(Boolean)
                const optimalMixed = optimalAny && !optimalAll

                const useSingleCell = dominant !== 'mixed' && !optimalMixed

                if (useSingleCell) {
                  const optHour = dominant === 'available' && optimalAll
                  const st = optHour
                    ? S.optimal
                    : dominant === 'busy'
                      ? S.busy
                      : dominant === 'non-working' || !active
                        ? S.nonworking
                        : S.available
                  return (
                    <div
                      key={h}
                      title={
                        optHour
                          ? t('eventForm.attendees.tooltip_slot_optimal.string', {
                              duration: appointmentDuration,
                              time: `${String(h).padStart(2, '0')}:00`,
                            })
                          : dominant === 'busy'
                            ? t('eventForm.attendees.tooltip_slot_busy.string')
                            : dominant === 'available'
                              ? t('eventForm.attendees.tooltip_slot_free.string', {
                                  name:
                                    person.personName?.trim() || person.email,
                                  time: `${String(h).padStart(2, '0')}:00`,
                                })
                              : undefined
                      }
                      style={{
                        width: HOUR_W,
                        height: '100%',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        ...st,
                      }}
                    />
                  )
                }

                return (
                  <div
                    key={h}
                    style={{
                      width: HOUR_W,
                      height: '100%',
                      display: 'flex',
                      borderRight: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {[0, 1, 2, 3].map((q) => {
                      const raw = slotStatus(
                        person.availability,
                        day.date,
                        h,
                        q
                      )
                      const opt = optimalFlags[q] && raw === 'available'
                      const st = opt
                        ? S.optimal
                        : raw === 'busy'
                          ? S.busy
                          : raw === 'non-working' || !active
                            ? S.nonworking
                            : S.available
                      const mm = String(q * 15).padStart(2, '0')
                      return (
                        <div
                          key={q}
                          title={
                            opt
                              ? t('eventForm.attendees.tooltip_slot_optimal.string', {
                                  duration: appointmentDuration,
                                  time: `${String(h).padStart(2, '0')}:${mm}`,
                                })
                              : raw === 'busy'
                                ? t('eventForm.attendees.tooltip_slot_busy.string')
                                : raw === 'available'
                                  ? t('eventForm.attendees.tooltip_slot_free.string', {
                                      name:
                                        person.personName?.trim() ||
                                        person.email,
                                      time: `${String(h).padStart(2, '0')}:${mm}`,
                                    })
                                  : undefined
                          }
                          style={{
                            flex: 1,
                            height: '100%',
                            ...st,
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
})

function Legend({ t }: LegendProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px 20px',
        padding: '8px 16px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(148,163,184,0.05)',
      }}
    >
      {LEGEND_ITEM_KEYS.map(({ key, style, i18nKey }) => (
        <div
          key={key}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <div
            style={{
              width: 20,
              height: 12,
              borderRadius: 3,
              flexShrink: 0,
              ...style,
              opacity: 1,
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
            {t(i18nKey)}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 20,
            height: 12,
            borderRadius: 3,
            flexShrink: 0,
            ...S.optimal,
            opacity: 1,
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
          {t('eventForm.attendees.optimal_slot.string')}
        </span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TimelineFreeBusy = React.memo(function TimelineFreeBusy({
  workingDays = DEFAULT_WORKING_DAYS,
  workingHours = DEFAULT_WORKING_HOURS,
  teamMembers = DEFAULT_TEAM_MEMBERS,
  appointmentDuration = DEFAULT_APPOINTMENT_DURATION,
  data,
  isLoading,
  centerDate,
}: TimelineFreeBusyProps = {}) {
  const t = useTranslations('CALENDARS')
  const locale = useLocale()

  const scrollEl = useRef<HTMLDivElement>(null)

  const days = useMemo((): DayMeta[] => {
    const center = centerDate ?? new Date()
    const centerUtcMidnight = Date.UTC(
      center.getUTCFullYear(),
      center.getUTCMonth(),
      center.getUTCDate(),
      0,
      0,
      0,
      0
    )

    return [-1, 0, 1].map((offset) => {
      const d = new Date(centerUtcMidnight + offset * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const displayDate = new Date(d.getTime())

      return {
        date: dateStr,
        dayName: displayDate.toLocaleDateString(locale, {
          weekday: 'short',
          timeZone: 'UTC',
        }),
        dayMonth: displayDate.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }),
        dayOfWeek: d.getUTCDay(),
        label: displayDate.toLocaleDateString(locale, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        }),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isCenter: offset === 0,
      }
    })
  }, [centerDate, locale])

  const hours = useMemo(() => getVisibleHours(workingHours), [workingHours])

  const { data: persons, days: gridDays } = useMemo(
    () =>
      generateAvailabilityData(
        teamMembers,
        workingDays,
        workingHours,
        data ?? {},
        days
      ),
    [teamMembers, workingDays, workingHours, data, days]
  )

  const optimalSlots = useMemo(() => {
    if (isLoading) return []

    return getAllAvailableSlots(days, persons, appointmentDuration)
  }, [days, persons, appointmentDuration, isLoading])

  const isOptimal = useCallback(
    (date: string, h: number, q: number) =>
      isPartOfOptimalSlot(optimalSlots, date, h, q),
    [optimalSlots]
  )

  const eventLineX = useMemo(() => {
    if (!centerDate || !hours.length) return null
    const h = centerDate.getHours()
    const m = centerDate.getMinutes()
    const idx = hours.indexOf(h)
    if (idx < 0) return null
    // Layout: [NAME_W] [day-1 = dayW] [center day = dayW] [day+1 = dayW]
    // Marker is in the center column (days[1]), so skip NAME_W + one full day width.
    const dayW = hours.length * HOUR_W
    return NAME_W + dayW + (idx + m / 60) * HOUR_W
  }, [centerDate, hours])

  const totalW = NAME_W + days.length * hours.length * HOUR_W

  useLayoutEffect(() => {
    const el = scrollEl.current
    if (!el || !hours.length) return

    const applyScroll = () => {
      if (eventLineX != null && el.clientWidth > 0) {
        const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
        const desired = eventLineX - el.clientWidth / 2
        el.scrollLeft = Math.max(0, Math.min(maxScroll, desired))
        return
      }
      const dayW = hours.length * HOUR_W
      const startIdx = hours.indexOf(workingHours.start)
      const offset = startIdx >= 0 ? startIdx * HOUR_W : 0
      el.scrollLeft = NAME_W + dayW + offset
    }

    applyScroll()
    const id = requestAnimationFrame(applyScroll)
    return () => cancelAnimationFrame(id)
  }, [
    eventLineX,
    hours,
    workingHours.start,
    data,
    persons.length,
    totalW,
  ])

  const slotStatus = useCallback(
    (avail: SlotArray, date: string, h: number, q: number) => {
      const di = gridDays.findIndex((d) => d.date === date)
      if (di < 0) return 'non-working' as const
      return avail[di * 24 * 4 + h * 4 + q]?.status ?? 'non-working'
    },
    [gridDays]
  )

  const hourStatus = useCallback(
    (avail: SlotArray, date: string, h: number) => {
      const qs = [0, 1, 2, 3].map((q) => slotStatus(avail, date, h, q))
      if (qs.every((s) => s === 'busy')) return 'busy' as const
      if (qs.every((s) => s === 'available')) return 'available' as const
      if (qs.every((s) => s === 'non-working')) return 'non-working' as const
      return 'mixed' as const
    },
    [slotStatus]
  )

  // Keep grid visible during RTK refetch when data is already present.
  if (isLoading && !data) return <Skeleton rows={teamMembers?.length ?? 1} />

  if (!data) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {t('eventForm.attendees.no_data.string')}
      </p>
    )
  }

  return (
    <div
      className="border-border bg-card flex min-h-0 w-full max-w-full flex-col rounded-xl border shadow-sm"
      style={{
        maxHeight: 'min(320px, 55vh)',
      }}
    >
      <div
        ref={scrollEl}
        style={{
          flex: '0 1 auto',
          minHeight: 0,
          // ~legend block height so the scroll region + legend fit under the card cap
          maxHeight: 'calc(min(320px, 55vh) - 80px)',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(148,163,184,0.4) transparent',
        }}
      >
        <div style={{ minWidth: totalW, position: 'relative' }}>
          {eventLineX !== null && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: HEAD_H + LABEL_H,
                bottom: 0,
                left: eventLineX,
                width: 1,
                background: 'rgba(59,130,246,0.75)',
                zIndex: Z_EVENT_MARKER,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgb(59,130,246)',
                }}
              />
            </div>
          )}

          <GridHeader
            days={days}
            hours={hours}
            workingDays={workingDays}
            workingHours={workingHours}
            t={t}
          />

          {persons.map((person, pi) => (
            <PersonRow
              key={person.person}
              person={person}
              index={pi}
              days={days}
              hours={hours}
              workingDays={workingDays}
              workingHours={workingHours}
              appointmentDuration={appointmentDuration}
              slotStatus={slotStatus}
              hourStatus={hourStatus}
              isOptimal={isOptimal}
              t={t}
            />
          ))}
        </div>
      </div>

      <Legend t={t} />
    </div>
  )
})

export { TimelineFreeBusy }
