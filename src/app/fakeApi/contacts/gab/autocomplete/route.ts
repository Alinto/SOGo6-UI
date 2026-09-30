import type { ApiContactSuggestion } from '@/features/address_books/address-books-api-types'
import { NextResponse } from 'next/server'

const DIRECTORY = { key: 'ldap', name: 'Directory' }

const DIRECTORY_USERS: ApiContactSuggestion[] = [
  {
    type: 'contact',
    contact_key: 'jdupont',
    email: 'jean.dupont@sogo.eu',
    name: 'Jean Dupont',
    address_book: DIRECTORY,
  },
  {
    type: 'contact',
    contact_key: 'mleblanc',
    email: 'marie.leblanc@sogo.eu',
    name: 'Marie Leblanc',
    address_book: DIRECTORY,
  },
  {
    type: 'contact',
    contact_key: 'pmartin',
    email: 'pierre.martin@sogo.eu',
    name: 'Pierre Martin',
    address_book: DIRECTORY,
  },
  {
    type: 'contact',
    contact_key: 'srobert',
    email: 'sophie.robert@sogo.eu',
    name: 'Sophie Robert',
    address_book: DIRECTORY,
  },
]

/**
 * GET /fakeApi/contacts/gab/autocomplete?q=
 * Directory users only (no personal contacts, no distribution lists).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').toLowerCase().trim()

  await new Promise((r) => setTimeout(r, 200))

  const suggestions =
    q.length < 2
      ? []
      : DIRECTORY_USERS.filter(
          (user) =>
            user.name?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q) ||
            user.contact_key?.toLowerCase().includes(q)
        )

  return NextResponse.json({
    data: { suggestions },
    error_code: null,
    error_msg: null,
  })
}
