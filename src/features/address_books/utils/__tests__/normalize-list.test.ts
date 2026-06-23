import {
  buildContactsByKey,
  normalizeDistributionList,
  normalizeListFromVCard,
  normalizeListsCollection,
  resolveListMembers,
} from '../normalize-list'
import { normalizeContactsList } from '../normalize-contact'

describe('resolveListMembers', () => {
  it('resolves member keys against contacts map', () => {
    const contacts = normalizeContactsList([
      {
        key: 'm1',
        first_name: 'Alice',
        last_name: 'Martin',
        emails: [{ value: 'alice@example.com' }],
      },
    ])
    const contactsByKey = buildContactsByKey(contacts)

    expect(resolveListMembers(['m1'], contactsByKey)).toEqual([
      {
        contactId: 'm1',
        email: 'alice@example.com',
        displayName: 'Alice Martin',
      },
    ])
  })

  it('returns placeholder member when contact is missing', () => {
    expect(resolveListMembers(['missing'], new Map())).toEqual([
      { contactId: 'missing', email: '' },
    ])
  })
})

describe('normalizeDistributionList', () => {
  it('maps list members using contact lookup', () => {
    const contacts = normalizeContactsList([
      {
        key: 'm1',
        first_name: 'Alice',
        last_name: 'Martin',
        emails: [{ value: 'alice@example.com' }],
      },
    ])

    const list = normalizeDistributionList(
      {
        key: 'list-1',
        name: 'Team',
        members: ['m1'],
      },
      buildContactsByKey(contacts)
    )

    expect(list.kind).toBe('group')
    expect(list.firstName).toBe('Team')
    expect(list.members?.[0].email).toBe('alice@example.com')
  })

  it('returns group VCard unchanged', () => {
    const group = {
      id: 'l1',
      version: '4.0',
      kind: 'group' as const,
      firstName: 'Team',
      lastName: '',
    }
    expect(normalizeDistributionList(group)).toBe(group)
  })
})

describe('normalizeListsCollection', () => {
  it('normalizes a collection of backend lists', () => {
    const contacts = normalizeContactsList([
      {
        key: 'c1',
        first_name: 'Bob',
        last_name: 'Smith',
        emails: [{ value: 'bob@example.com' }],
      },
    ])

    const lists = normalizeListsCollection(
      [{ key: 'l1', name: 'Team', members: ['c1'] }],
      contacts
    )

    expect(lists).toHaveLength(1)
    expect(lists[0].members?.[0].email).toBe('bob@example.com')
  })
})

describe('normalizeListFromVCard', () => {
  it('returns group entries unchanged', () => {
    const group = {
      id: 'l1',
      version: '4.0',
      kind: 'group' as const,
      firstName: 'Team',
      lastName: '',
    }
    expect(normalizeListFromVCard(group)).toBe(group)
  })
})
