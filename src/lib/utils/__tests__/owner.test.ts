import { isOtherOwner, sortByOwnerThenName } from '../owner'

describe('isOtherOwner', () => {
  const user = { uid: 'test@tutu.fr', email: 'test@tutu.fr' }

  it('returns false when the owner is the connected account', () => {
    expect(isOtherOwner('test@tutu.fr', user)).toBe(false)
  })

  it('compares case-insensitively and ignores surrounding spaces', () => {
    expect(isOtherOwner('  Test@Tutu.FR ', user)).toBe(false)
  })

  it('matches either the email or the uid of the user', () => {
    expect(isOtherOwner('login', { uid: 'login', email: 'a@b.fr' })).toBe(false)
    expect(isOtherOwner('a@b.fr', { uid: 'login', email: 'a@b.fr' })).toBe(
      false
    )
  })

  it('returns true when the owner is someone else', () => {
    expect(isOtherOwner('other@tutu.fr', user)).toBe(true)
  })

  it('returns false when the owner is missing', () => {
    expect(isOtherOwner(undefined, user)).toBe(false)
    expect(isOtherOwner('', user)).toBe(false)
    expect(isOtherOwner(null, user)).toBe(false)
  })

  it('returns false when the connected user is unknown', () => {
    expect(isOtherOwner('other@tutu.fr', null)).toBe(false)
    expect(isOtherOwner('other@tutu.fr', { uid: '', email: '' })).toBe(false)
  })
})

describe('sortByOwnerThenName', () => {
  it('sorts by owner email, then by name', () => {
    const items = [
      { owner: 'zoe@tutu.fr', name: 'Alpha' },
      { owner: 'bob@tutu.fr', name: 'Work' },
      { owner: 'bob@tutu.fr', name: 'Agenda' },
      { owner: 'alice@tutu.fr', name: 'Zeta' },
    ]
    expect(sortByOwnerThenName(items)).toEqual([
      { owner: 'alice@tutu.fr', name: 'Zeta' },
      { owner: 'bob@tutu.fr', name: 'Agenda' },
      { owner: 'bob@tutu.fr', name: 'Work' },
      { owner: 'zoe@tutu.fr', name: 'Alpha' },
    ])
  })

  it('ignores case and accents', () => {
    const items = [
      { owner: 'Bob@tutu.fr', name: 'école' },
      { owner: 'bob@tutu.fr', name: 'Dossier' },
      { owner: 'alice@tutu.fr', name: 'x' },
    ]
    expect(sortByOwnerThenName(items).map((item) => item.name)).toEqual([
      'x',
      'Dossier',
      'école',
    ])
  })

  it('puts items without owner first and does not mutate the input', () => {
    const items = [{ owner: 'bob@tutu.fr', name: 'A' }, { name: 'B' }]
    const sorted = sortByOwnerThenName(items)
    expect(sorted.map((item) => item.name)).toEqual(['B', 'A'])
    expect(items[0].name).toBe('A')
  })
})
