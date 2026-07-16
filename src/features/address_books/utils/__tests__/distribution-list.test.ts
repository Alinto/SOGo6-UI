import type { VCard } from '../../address-books-types'
import {
  getDistributionListEmails,
  getDistributionListMemberCount,
  getDistributionListName,
  getMemberDisplayLabel,
  isDistributionList,
  isIndividualContact,
  membersFromContacts,
} from '../distribution-list'

const individual = (id: string): VCard => ({
  id,
  version: '4.0',
  firstName: 'Alice',
  lastName: 'Martin',
  emails: [`${id}@example.com`],
})

const group: VCard = {
  id: 'list-1',
  version: '4.0',
  kind: 'group',
  firstName: 'Team',
  lastName: '',
  members: [
    { contactId: '1', email: 'a@example.com', displayName: 'Alice' },
    { contactId: '2', email: 'b@example.com', displayName: 'Bob' },
  ],
}

describe('distribution-list utils', () => {
  it('detects distribution lists', () => {
    expect(isDistributionList(group)).toBe(true)
    expect(isIndividualContact(individual('1'))).toBe(true)
  })

  it('returns list name from firstName only', () => {
    expect(getDistributionListName(group)).toBe('Team')
  })

  it('counts members and extracts emails', () => {
    expect(getDistributionListMemberCount(group)).toBe(2)
    expect(getDistributionListEmails(group)).toEqual([
      'a@example.com',
      'b@example.com',
    ])
  })

  it('builds members from selected contacts', () => {
    const members = membersFromContacts([
      individual('1'),
      group,
      individual('2'),
    ])
    expect(members).toHaveLength(2)
    expect(members[0].contactId).toBe('1')
  })

  it('includes contacts without email when building members from selection', () => {
    const noEmail: VCard = {
      id: 'no-mail',
      version: '4.0',
      firstName: 'Bob',
      lastName: 'Sans',
      emails: [],
    }
    const members = membersFromContacts([individual('1'), noEmail])
    expect(members).toHaveLength(2)
    expect(members[1]).toEqual({
      contactId: 'no-mail',
      email: '',
      displayName: 'Bob Sans',
    })
  })

  it('falls back to contact id when member has no display name or email', () => {
    expect(
      getMemberDisplayLabel({ contactId: 'missing-contact', email: '' })
    ).toBe('missing-contact')
  })
})
