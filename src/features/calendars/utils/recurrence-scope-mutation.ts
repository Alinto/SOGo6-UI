import type { RecurrenceScope } from '@/features/calendars/components/recurrence-scope-dialog'

export type RecurrenceScopeMutationFields = {
  recurrence_id?: string
  recurrence_range?: 'THISANDFUTURE'
}

/** Maps UI recurrence scope to backend PATCH/DELETE fields. */
export function recurrenceScopeToMutationFields(
  scope: RecurrenceScope,
  recurrenceId?: string | null
): RecurrenceScopeMutationFields {
  if (scope === 'ALL') {
    return {}
  }

  const fields: RecurrenceScopeMutationFields = {}
  if (recurrenceId) {
    fields.recurrence_id = recurrenceId
  }
  if (scope === 'THISANDFUTURE') {
    fields.recurrence_range = 'THISANDFUTURE'
  }
  return fields
}

/** Drag/resize of a single expanded occurrence (backend: recurrence_id, no range). */
export function singleOccurrenceMutationFields(
  recurrenceId?: string | null
): Pick<RecurrenceScopeMutationFields, 'recurrence_id'> {
  if (!recurrenceId) {
    return {}
  }
  return { recurrence_id: recurrenceId }
}
