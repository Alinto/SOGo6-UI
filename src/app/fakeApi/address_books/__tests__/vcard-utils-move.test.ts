import type { VCard } from '@/features/address_books/address-books-types'
import {
  normalizeGroupMembers,
  normalizeGroupMembersForBook,
  removeContactFromAllDistributionLists,
} from '../vcard-utils'

describe('vcard-utils move helpers', () => {
  it('removes contact references from all distribution lists', () => {
    const store: Record<string, VCard[]> = {
      work: [
        {
          id: 'list-1',
          version: '4.0',
          kind: 'group',
          firstName: 'Team',
          lastName: '',
          members: [
            { contactId: 'c1', email: 'a@example.com' },
            { contactId: 'c2', email: 'b@example.com' },
          ],
        },
      ],
      home: [
        {
          id: 'list-2',
          version: '4.0',
          kind: 'group',
          firstName: 'Family',
          lastName: '',
          members: [{ contactId: 'c1', email: 'a@example.com' }],
        },
      ],
    }

    removeContactFromAllDistributionLists(store, 'c1')

    expect(store.work[0].members).toEqual([
      { contactId: 'c2', email: 'b@example.com' },
    ])
    expect(store.home[0].members).toEqual([])
  })

  it('keeps members linked by contactId without email', () => {
    const members = normalizeGroupMembers([
      { contactId: 'c1', email: 'a@example.com', displayName: 'Alice' },
      { contactId: 'c2', email: '', displayName: 'Bob NoMail' },
    ])

    expect(members).toEqual([
      { contactId: 'c1', email: 'a@example.com', displayName: 'Alice' },
      { contactId: 'c2', email: '', displayName: 'Bob NoMail' },
    ])
  })

  it('strips invalid contactId refs when normalizing for target book', () => {
    const bookContacts: VCard[] = [
      {
        id: 'local-1',
        version: '4.0',
        firstName: 'Local',
        lastName: 'User',
        emails: ['local@example.com'],
      },
    ]

    const members = normalizeGroupMembersForBook(bookContacts, [
      { contactId: 'local-1', email: 'local@example.com', displayName: 'Local' },
      { contactId: 'missing', email: 'ext@example.com', displayName: 'External' },
    ])

    expect(members).toEqual([
      { contactId: 'local-1', email: 'local@example.com', displayName: 'Local' },
      { email: 'ext@example.com', displayName: 'External' },
    ])
  })
})
