import type { TaskCreateBody, TaskUpdateBody } from '../tasks-types'

type TaskRelationApi = { uid: string; relation_type?: string }

export type ApiTaskWriteBody = Record<string, unknown>

function serializeRelatedTo(
  related: string[] | TaskRelationApi[]
): TaskRelationApi[] {
  if (related.length === 0) return []
  if (typeof related[0] === 'string') {
    return (related as string[]).map((uid) => ({ uid }))
  }
  return related as TaskRelationApi[]
}

/** Map front task body to backend API payload (date_due, no stray keys). */
export function serializeTaskBody(
  body: TaskCreateBody | TaskUpdateBody
): ApiTaskWriteBody {
  const result: ApiTaskWriteBody = {}

  if (body.title !== undefined) result.title = body.title
  if (body.description !== undefined) result.description = body.description
  if (body.date_start !== undefined) result.date_start = body.date_start
  if (body.due !== undefined) result.date_due = body.due
  if (body.status !== undefined) result.status = body.status
  if (body.visibility !== undefined) result.visibility = body.visibility
  if (body.priority !== undefined) result.priority = body.priority
  if (body.percent_complete !== undefined) {
    result.percent_complete = body.percent_complete
  }
  if (body.completed_at !== undefined) result.completed_at = body.completed_at
  if (body.categories !== undefined) result.categories = body.categories
  if (body.reminders !== undefined) result.reminders = body.reminders
  if (body.organizer !== undefined) result.organizer = body.organizer
  if (body.attendees !== undefined) result.attendees = body.attendees
  if (body.related_to !== undefined) {
    result.related_to = serializeRelatedTo(body.related_to)
  }

  return result
}
