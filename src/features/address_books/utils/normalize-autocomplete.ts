import type {
  ApiAutocompleteData,
  ApiDataResponse,
} from '../address-books-api-types'
import type { ContactSuggestion } from '../address-books-api-types'
import { unwrapApiData } from './unwrap-api-data'

export function normalizeContactSuggestion(
  raw: ApiAutocompleteData['suggestions'][number]
): ContactSuggestion {
  return {
    type: raw.type,
    name: raw.name ?? undefined,
    email: raw.email ?? undefined,
    contactKey: raw.contact_key ?? undefined,
    listKey: raw.list_key ?? undefined,
    memberCount: raw.member_count ?? undefined,
    members: raw.members ?? undefined,
    addressBookKey: raw.address_book?.key ?? undefined,
    addressBookName: raw.address_book?.name ?? undefined,
  }
}

export function normalizeAutocompleteResponse(
  response: ApiDataResponse<ApiAutocompleteData> | ApiAutocompleteData | ContactSuggestion[]
): ContactSuggestion[] {
  if (Array.isArray(response)) return response

  const data = unwrapApiData(response)
  if (Array.isArray(data)) return data

  return (data.suggestions ?? []).map(normalizeContactSuggestion)
}
