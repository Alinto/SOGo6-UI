import type { ApiTaskListResponse, Task } from '../tasks-types'

/** Raw task payload from API (may include event-only fields). */
type RawTask = Partial<Task> & {
  date_end?: string | null
}

export function normalizeTask(raw: RawTask): Task {
  const key = raw.key ?? raw.id ?? undefined
  const calendarKey =
    raw.calendar_key ?? raw.calendar_id ?? undefined

  const { date_end: _dateEnd, ...rest } = raw

  return {
    ...rest,
    key,
    id: key ?? raw.id ?? null,
    calendar_key: calendarKey,
    calendar_id: calendarKey ?? raw.calendar_id ?? null,
    title: raw.title ?? '',
    due: raw.due ?? null,
    status: raw.status ?? 'needs_action',
    priority: raw.priority ?? 0,
    percent_complete: raw.percent_complete ?? null,
    component_type: 'task',
  }
}

export function normalizeTasksList(
  response: ApiTaskListResponse | Task[] | { tasks: Task[] }
): Task[] {
  if (Array.isArray(response)) {
    return response.map(normalizeTask)
  }
  if ('tasks' in response && Array.isArray(response.tasks)) {
    return response.tasks.map(normalizeTask)
  }
  if ('data' in response && response.data?.tasks) {
    return response.data.tasks.map(normalizeTask)
  }
  return []
}
