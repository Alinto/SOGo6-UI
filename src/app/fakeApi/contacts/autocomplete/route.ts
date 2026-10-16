import {
  AUTOCOMPLETE_ADDRESS_BOOK,
  AUTOCOMPLETE_CONTACTS,
} from '@/app/fakeApi/utils/autocomplete-contacts'
import type { ApiContactSuggestion } from '@/features/address_books/address-books-api-types'
import { NextResponse } from 'next/server'

const MOCK_SUGGESTIONS: ApiContactSuggestion[] = [
  ...AUTOCOMPLETE_CONTACTS.map((contact) => ({
    type: 'contact' as const,
    ...contact,
    address_book: AUTOCOMPLETE_ADDRESS_BOOK,
  })),
  {
    type: 'list',
    name: 'Design Team',
    list_key: 'design-team',
    member_count: 2,
    members: AUTOCOMPLETE_CONTACTS.filter((c) =>
      ['mleblanc', 'csimon'].includes(c.contact_key)
    ),
    address_book: AUTOCOMPLETE_ADDRESS_BOOK,
  },
]

/**
 * GET /fakeApi/contacts/autocomplete?q=
 * Returns contacts and distribution lists matching the query (min 2 chars).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').toLowerCase().trim()

  await new Promise((r) => setTimeout(r, 200))

  const suggestions =
    q.length < 2
      ? []
      : MOCK_SUGGESTIONS.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        )

  return NextResponse.json({
    data: { suggestions },
    error_code: null,
    error_msg: null,
  })
}
