import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type { ApiTaskListResponse, ApiTaskResponse, Task } from '@/features/tasks/tasks-types'
import { normalizeTask } from '@/features/tasks/utils/normalize-task'
import { textMatchesSearch } from '@/lib/utils/strip-accents'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_TASKS_KEY = 'demo_tasks'

const DEFAULT_TASKS: Task[] = [
  {
    key: 'task-001',
    id: 'task-001',
    calendar_key: 'personal-cal-1',
    calendar_id: 'personal-cal-1',
    title: 'Prepare team meeting',
    description: 'Draft agenda and send invites',
    status: 'needs_action',
    priority: 1,
    due: new Date(Date.now() + 86400000).toISOString(),
    percent_complete: 0,
    component_type: 'task',
    created_at: '2024-06-01T10:00:00.000Z',
    updated_at: '2024-06-01T10:00:00.000Z',
  },
  {
    key: 'task-002',
    id: 'task-002',
    calendar_key: 'personal-cal-1',
    calendar_id: 'personal-cal-1',
    title: 'Review quarterly report',
    status: 'in_process',
    priority: 5,
    due: new Date(Date.now() + 3 * 86400000).toISOString(),
    percent_complete: 40,
    component_type: 'task',
    created_at: '2024-06-02T10:00:00.000Z',
    updated_at: '2024-06-03T10:00:00.000Z',
  },
  {
    key: 'task-003',
    id: 'task-003',
    calendar_key: 'personal-cal-2',
    calendar_id: 'personal-cal-2',
    title: 'Order birthday gift',
    status: 'completed',
    priority: 0,
    percent_complete: 100,
    completed_at: '2024-05-20T14:00:00.000Z',
    component_type: 'task',
    created_at: '2024-05-15T10:00:00.000Z',
    updated_at: '2024-05-20T14:00:00.000Z',
  },
]

export function getAllTasks(req: NextRequest): Task[] {
  return getDemoData(req, DEMO_TASKS_KEY, DEFAULT_TASKS)
}

export function getTasksForCalendar(
  req: NextRequest,
  calendarId: string
): Task[] {
  return getAllTasks(req).filter(
    (t) =>
      t.calendar_key === calendarId ||
      t.calendar_id === calendarId
  )
}

export function findTaskByKey(
  req: NextRequest,
  taskKey: string
): Task | undefined {
  return getAllTasks(req).find(
    (t) => t.key === taskKey || t.id === taskKey
  )
}

function saveTasks(req: NextRequest, tasks: Task[], res: NextResponse) {
  setDemoData(res, DEMO_TASKS_KEY, tasks, req)
}

function listResponse(tasks: Task[]): ApiTaskListResponse {
  return {
    data: { tasks, total_count: tasks.length },
    error_code: 'S000000',
    error_msg: 'No Error',
  }
}

function taskResponse(task: Task): ApiTaskResponse {
  return {
    data: normalizeTask(task),
    error_code: 'S000000',
    error_msg: 'No Error',
  }
}

export function filterTasks(
  tasks: Task[],
  searchParams: URLSearchParams
): Task[] {
  const search = searchParams.get('search')?.trim()
  const startDateTime = searchParams.get('start_date_time')
  const endDateTime = searchParams.get('end_date_time')

  let filtered = [...tasks]

  if (search && search.length >= 2) {
    filtered = filtered.filter((t) =>
      [t.title, t.description, ...(t.categories ?? [])].some((v) =>
        v ? textMatchesSearch(v, search) : false
      )
    )
  }

  if (startDateTime) {
    const start = new Date(startDateTime).getTime()
    filtered = filtered.filter((t) => {
      const due = t.due ? new Date(t.due).getTime() : Infinity
      return due >= start
    })
  }

  if (endDateTime) {
    const end = new Date(endDateTime).getTime()
    filtered = filtered.filter((t) => {
      const due = t.due ? new Date(t.due).getTime() : 0
      return due <= end
    })
  }

  return filtered
}

export function handleGetAllTasks(
  req: NextRequest
): NextResponse<ApiTaskListResponse> {
  const { searchParams } = new URL(req.url)
  const tasks = filterTasks(getAllTasks(req), searchParams)
  return NextResponse.json(listResponse(tasks))
}

export function handleGetCalendarTasks(
  req: NextRequest,
  calendarId: string
): NextResponse<ApiTaskListResponse> {
  const { searchParams } = new URL(req.url)
  const tasks = filterTasks(
    getTasksForCalendar(req, calendarId),
    searchParams
  )
  return NextResponse.json(listResponse(tasks))
}

export function handleGetTaskByKey(
  req: NextRequest,
  taskKey: string
): NextResponse<ApiTaskResponse | { error: string }> {
  const task = findTaskByKey(req, taskKey)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
  return NextResponse.json(taskResponse(task))
}

export async function handleCreateTask(
  req: NextRequest,
  calendarId: string
): Promise<NextResponse<ApiTaskResponse>> {
  const body = await req.json()
  const tasks = getAllTasks(req)
  const now = new Date().toISOString()
  const key = `task-${Date.now().toString(36)}`

  const newTask: Task = normalizeTask({
    ...body,
    due: body.date_due ?? body.due,
    key,
    id: key,
    calendar_key: calendarId,
    calendar_id: calendarId,
    status: body.status ?? 'needs_action',
    priority: body.priority ?? 0,
    percent_complete: body.percent_complete ?? 0,
    component_type: 'task',
    created_at: now,
    updated_at: now,
  })

  tasks.push(newTask)
  const response = NextResponse.json(taskResponse(newTask), { status: 201 })
  saveTasks(req, tasks, response)
  return response
}

export async function handleUpdateTask(
  req: NextRequest,
  taskKey: string
): Promise<NextResponse<ApiTaskResponse | { error: string }>> {
  const body = await req.json()
  const tasks = getAllTasks(req)
  const index = tasks.findIndex(
    (t) => t.key === taskKey || t.id === taskKey
  )

  if (index < 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const updated = normalizeTask({
    ...tasks[index],
    ...body,
    due: body.date_due ?? body.due,
    key: taskKey,
    id: taskKey,
    updated_at: new Date().toISOString(),
  })

  tasks[index] = updated
  const response = NextResponse.json(taskResponse(updated))
  saveTasks(req, tasks, response)
  return response
}

export function handleDeleteTask(
  req: NextRequest,
  taskKey: string
): NextResponse<{ success: boolean } | { error: string }> {
  const tasks = getAllTasks(req)
  const index = tasks.findIndex(
    (t) => t.key === taskKey || t.id === taskKey
  )

  if (index < 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  tasks.splice(index, 1)
  const response = NextResponse.json({ success: true })
  saveTasks(req, tasks, response)
  return response
}
