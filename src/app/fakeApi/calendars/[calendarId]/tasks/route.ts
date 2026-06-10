import {
  handleCreateTask,
  handleGetCalendarTasks,
} from '@/app/fakeApi/utils/tasks-store'
import { NextRequest } from 'next/server'

/**
 * GET /fakeApi/calendars/[calendarId]/tasks
 * POST /fakeApi/calendars/[calendarId]/tasks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  return handleGetCalendarTasks(request, calendarId)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  return handleCreateTask(request, calendarId)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: { Allow: 'GET, POST' },
  })
}
