import {
  handleDeleteTask,
  handleGetTaskByKey,
  handleUpdateTask,
} from '@/app/fakeApi/utils/tasks-store'
import { NextRequest } from 'next/server'

/**
 * GET /fakeApi/tasks/[taskKey]
 * PATCH /fakeApi/tasks/[taskKey]
 * DELETE /fakeApi/tasks/[taskKey]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskKey: string }> }
) {
  const { taskKey } = await params
  return handleGetTaskByKey(request, taskKey)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskKey: string }> }
) {
  const { taskKey } = await params
  return handleUpdateTask(request, taskKey)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskKey: string }> }
) {
  const { taskKey } = await params
  return handleDeleteTask(request, taskKey)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: { Allow: 'GET, PATCH, DELETE' },
  })
}
