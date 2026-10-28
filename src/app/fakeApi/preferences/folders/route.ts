import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import { NextRequest, NextResponse } from 'next/server'

type FolderEntries = Record<string, { display: boolean }>
type FolderPreferences = {
  CALENDAR: Record<string, FolderEntries>
}

const COOKIE_NAME = 'demo_folder_preferences'

const DEFAULT_FOLDER_PREFERENCES: FolderPreferences = {
  CALENDAR: { OWNER: {}, SUBS: {} },
}

const buildResponsePayload = (data: FolderPreferences) => ({
  data,
  error_code: 'S000000',
  error_msg: 'No Error',
})

export async function GET(req: NextRequest) {
  const preferences = getDemoData(req, COOKIE_NAME, DEFAULT_FOLDER_PREFERENCES)
  return NextResponse.json(buildResponsePayload(preferences))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'PATCH'] }, { status: 200 })
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as Partial<FolderPreferences>
  const preferences = getDemoData(req, COOKIE_NAME, DEFAULT_FOLDER_PREFERENCES)

  Object.entries(body.CALENDAR ?? {}).forEach(([scope, entries]) => {
    preferences.CALENDAR[scope] = {
      ...preferences.CALENDAR[scope],
      ...entries,
    }
  })

  const response = NextResponse.json(buildResponsePayload(preferences))
  setDemoData(response, COOKIE_NAME, preferences, req)
  return response
}
