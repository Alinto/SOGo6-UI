import type { GlobalAccessGrant } from '../access-api'
import { pivotGrantsByUser } from '../access-api'

const mailGrant = (overrides: Partial<GlobalAccessGrant> = {}): GlobalAccessGrant => ({
  domain: 'mail',
  itemKey: 'INBOX',
  itemName: 'Inbox',
  uid: 'alice',
  c_email: 'alice@example.com',
  rights: {},
  allItemUsers: [],
  ...overrides,
} as GlobalAccessGrant)

describe('pivotGrantsByUser', () => {
  it('returns an empty array for no grants', () => {
    expect(pivotGrantsByUser([])).toEqual([])
  })

  it('groups grants by uid when no email is present', () => {
    const result = pivotGrantsByUser([
      mailGrant({ uid: 'bob', c_email: undefined }),
      mailGrant({
        uid: 'bob',
        c_email: undefined,
        domain: 'calendar',
        itemKey: 'cal-1',
        itemName: 'My Calendar',
      }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].grants).toHaveLength(2)
  })

  it('merges grants across domains by email, case-insensitively', () => {
    const result = pivotGrantsByUser([
      mailGrant({ uid: 'alice-mail-uid', c_email: 'Alice@Example.com' }),
      mailGrant({
        uid: 'alice-calendar-uid',
        c_email: 'alice@example.com',
        domain: 'calendar',
        itemKey: 'cal-1',
        itemName: 'My Calendar',
      }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].grants).toHaveLength(2)
    expect(result[0].grants.map((g) => g.domain).sort()).toEqual([
      'calendar',
      'mail',
    ])
  })

  it('keeps distinct users separate', () => {
    const result = pivotGrantsByUser([
      mailGrant({ uid: 'alice', c_email: 'alice@example.com' }),
      mailGrant({ uid: 'bob', c_email: 'bob@example.com' }),
    ])
    expect(result).toHaveLength(2)
  })

  it('sorts users alphabetically by c_email (falling back to uid)', () => {
    const result = pivotGrantsByUser([
      mailGrant({ uid: 'zoe', c_email: 'zoe@example.com' }),
      mailGrant({ uid: 'amy', c_email: 'amy@example.com' }),
    ])
    expect(result.map((u) => u.c_email)).toEqual([
      'amy@example.com',
      'zoe@example.com',
    ])
  })

  it('backfills a missing c_email from a later grant for the same user', () => {
    const result = pivotGrantsByUser([
      mailGrant({ uid: 'carol@example.com', c_email: undefined }),
      mailGrant({
        uid: 'carol@example.com',
        c_email: 'carol@example.com',
        domain: 'contact',
        itemKey: 'book-1',
        itemName: 'My Contacts',
      }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].c_email).toBe('carol@example.com')
  })
})
