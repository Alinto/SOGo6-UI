import type { ListCreateBody, ListPatchBody } from '../address-books-api-types'
import type { DistributionListFormValues } from '../components/distribution-list-form'

export function serializeListFromForm(
  values: DistributionListFormValues
): ListCreateBody {
  return {
    name: values.name.trim(),
    description: values.note?.trim() || undefined,
    members: values.memberContactIds,
  }
}

export function serializeListPatch(input: {
  name?: string
  note?: string
  memberContactIds?: string[]
}): ListPatchBody {
  const body: ListPatchBody = {}
  if (input.name !== undefined) body.name = input.name.trim()
  if (input.note !== undefined) body.description = input.note.trim() || undefined
  if (input.memberContactIds !== undefined) {
    body.members = input.memberContactIds
  }
  return body
}

export function serializeListCreate(input: {
  name: string
  description?: string
  members: string[]
}): ListCreateBody {
  return {
    name: input.name,
    description: input.description,
    members: input.members,
  }
}
