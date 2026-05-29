import { handleGetAllTasks } from '@/app/fakeApi/utils/tasks-store'
import { NextRequest } from 'next/server'

/**
 * GET /fakeApi/tasks
 */
export async function GET(request: NextRequest) {
  return handleGetAllTasks(request)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: { Allow: 'GET' },
  })
}
