import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type {
  CalendarShareData,
  CalendarShareUser,
  CalendarShareUserClass,
} from '@/features/calendars/calendars-types'
import { ANY_AUTHENTICATED_UID } from '@/features/calendars/utils/calendar-permission-mapping'
import { USER_CLASS_ANY } from '@/lib/constants/user-class'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_CALENDAR_SHARE_KEY = 'demo_calendar_share'
type ShareByCalendar = Record<string, CalendarShareData>

/**
 * Wire shape sent by the client: PUT body is a bare array of these. `uid` is
 * omitted by the client for the "any authenticated user" pseudo-entry
 * (user_class "anyone") — it isn't a real account.
 */
interface WireShareUser {
  c_email?: string
  uid?: string
  user_class?: string
  rights?: CalendarShareUser['rights']
}

function fromWireUserClass(userClass?: string): CalendarShareUserClass {
  return userClass === USER_CLASS_ANY ? 'any-authenticated-user' : 'normal-user'
}

function wireUserToCalendarShareUser(u: WireShareUser): CalendarShareUser {
  const userClass = fromWireUserClass(u.user_class)
  return {
    uid: u.uid ?? (userClass === 'any-authenticated-user' ? ANY_AUTHENTICATED_UID : ''),
    c_email: u.c_email,
    userClass,
    rights: u.rights ?? {
      public: 'none',
      confidential: 'none',
      private: 'none',
      can_create_objects: false,
      can_erase_objects: false,
    },
  }
}

function usersArrayToCalendarShareData(
  users: CalendarShareUser[]
): CalendarShareData {
  const usersRecord: CalendarShareData['users'] = {}
  for (const u of users) {
    usersRecord[u.uid] = { ...u }
  }
  return { users: usersRecord }
}

const okEnvelope = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await ctx.params
  const all = getDemoData<ShareByCalendar>(req, DEMO_CALENDAR_SHARE_KEY, {})
  return NextResponse.json(okEnvelope(all[calendarId] ?? { users: {} }))
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await ctx.params
  const body = (await req.json()) as WireShareUser[]
  const users = Array.isArray(body) ? body.map(wireUserToCalendarShareUser) : []
  const data = usersArrayToCalendarShareData(users)

  const all = getDemoData<ShareByCalendar>(req, DEMO_CALENDAR_SHARE_KEY, {})
  all[calendarId] = data

  const response = NextResponse.json(okEnvelope(data))
  setDemoData(response, DEMO_CALENDAR_SHARE_KEY, all, req)
  return response
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'PUT', 'OPTIONS'] })
}
