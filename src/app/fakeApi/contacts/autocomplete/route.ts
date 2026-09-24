import type { ApiContactSuggestion } from '@/features/address_books/address-books-api-types'
import { NextResponse } from 'next/server'

const MOCK_ADDRESS_BOOK = { key: 'personal', name: 'Personal Address Book' }

const MOCK_CONTACTS = [
  { contact_key: 'jdupont', email: 'jdupont@sogo.eu', name: 'Jean Dupont' },
  { contact_key: 'mleblanc', email: 'mleblanc@sogo.eu', name: 'Marie Leblanc' },
  { contact_key: 'pmartin', email: 'pmartin@sogo.eu', name: 'Pierre Martin' },
  { contact_key: 'srobert', email: 'srobert@sogo.eu', name: 'Sophie Robert' },
  {
    contact_key: 'abernard',
    email: 'abernard@sogo.eu',
    name: 'Antoine Bernard',
  },
  { contact_key: 'lmoreau', email: 'lmoreau@sogo.eu', name: 'Lucie Moreau' },
  { contact_key: 'nthomas', email: 'nthomas@sogo.eu', name: 'Nicolas Thomas' },
  { contact_key: 'csimon', email: 'csimon@sogo.eu', name: 'Claire Simon' },
  { contact_key: 'vdubois', email: 'vdubois@sogo.eu', name: 'Victor Dubois' },
  { contact_key: 'eleroy', email: 'eleroy@sogo.eu', name: 'Émilie Leroy' },
]

const MOCK_SUGGESTIONS: ApiContactSuggestion[] = [
  ...MOCK_CONTACTS.map((contact) => ({
    type: 'contact' as const,
    ...contact,
    address_book: MOCK_ADDRESS_BOOK,
  })),
  {
    type: 'list',
    name: 'Design Team',
    list_key: 'design-team',
    member_count: 2,
    members: MOCK_CONTACTS.filter((c) =>
      ['mleblanc', 'csimon'].includes(c.contact_key)
    ),
    address_book: MOCK_ADDRESS_BOOK,
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
