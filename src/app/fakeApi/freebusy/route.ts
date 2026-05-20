import { NextResponse } from 'next/server'

function fmtCompactUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

/** `base` = UTC midnight of a calendar day; sets wall-clock time in UTC. */
function makeHour(base: Date, hour: number, minute = 0): Date {
  const d = new Date(base)
  d.setUTCHours(hour, minute, 0, 0)
  return d
}

export async function POST(request: Request) {
  const body = await request.json()
  const { target_uids } = body as {
    target_uids: string[]
    start?: string
    end?: string
    start_date_time?: string
    end_date_time?: string
  }
  const start = body.start_date_time ?? body.start
  const end = body.end_date_time ?? body.end

  if (!start || !end || !Array.isArray(target_uids) || target_uids.length === 0) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'INVALID_REQUEST',
        error_msg: 'target_uids, start_date_time and end_date_time are required',
      },
      { status: 400 }
    )
  }

  await new Promise((resolve) => setTimeout(resolve, 600))

  const rangeStart = new Date(start)
  const rangeEnd = new Date(end)

  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'INVALID_REQUEST',
        error_msg: 'Invalid start_date_time or end_date_time',
      },
      { status: 400 }
    )
  }
  // Midpoint of the free/busy range ≈ event day (aligned with UTC timeline).
  const centerInstant = new Date(
    (rangeStart.getTime() + rangeEnd.getTime()) / 2
  )

  const dayJ = new Date(
    Date.UTC(
      centerInstant.getUTCFullYear(),
      centerInstant.getUTCMonth(),
      centerInstant.getUTCDate(),
      0,
      0,
      0,
      0
    )
  )
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const dayJPlus1 = new Date(dayJ.getTime() + MS_PER_DAY)

  const attendees: Record<
    string,
    {
      periods: {
        start: string
        end: string
        type: string
        title: string | null
      }[]
    }
  > = {}

  target_uids.forEach((uid, index) => {
    const periods: {
      start: string
      end: string
      type: string
      title: string | null
    }[] = []

    if (index === 0) {
      periods.push({
        start: fmtCompactUtc(makeHour(dayJ, 9)),
        end: fmtCompactUtc(makeHour(dayJ, 11, 30)),
        type: 'busy',
        title: null,
      })
      periods.push({
        start: fmtCompactUtc(makeHour(dayJ, 14)),
        end: fmtCompactUtc(makeHour(dayJ, 16)),
        type: 'tentative',
        title: 'Team sync',
      })
      periods.push({
        start: fmtCompactUtc(makeHour(dayJPlus1, 16)),
        end: fmtCompactUtc(makeHour(dayJPlus1, 18)),
        type: 'busy',
        title: null,
      })
    } else if (index === 1) {
      periods.push({
        start: fmtCompactUtc(makeHour(dayJ, 10)),
        end: fmtCompactUtc(makeHour(dayJ, 13)),
        type: 'busy',
        title: '1:1 Manager',
      })
      periods.push({
        start: fmtCompactUtc(makeHour(dayJ, 15)),
        end: fmtCompactUtc(makeHour(dayJ, 17, 30)),
        type: 'busy',
        title: null,
      })
    } else {
      periods.push({
        start: fmtCompactUtc(makeHour(dayJ, 8, 30)),
        end: fmtCompactUtc(makeHour(dayJ, 10)),
        type: 'tentative',
        title: 'Standup',
      })
      periods.push({
        start: fmtCompactUtc(makeHour(dayJ, 13)),
        end: fmtCompactUtc(makeHour(dayJ, 14)),
        type: 'busy',
        title: null,
      })
      periods.push({
        start: fmtCompactUtc(makeHour(dayJPlus1, 9)),
        end: fmtCompactUtc(makeHour(dayJPlus1, 12)),
        type: 'busy',
        title: null,
      })
    }

    attendees[uid] = { periods }
  })

  return NextResponse.json({
    data: {
      start: fmtCompactUtc(rangeStart),
      end: fmtCompactUtc(rangeEnd),
      attendees,
      is_available: false,
    },
    error_code: null,
    error_msg: null,
  })
}
