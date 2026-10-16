import type { VCard } from '../../address-books-types'
import {
  getContactEmails,
  getContactPhones,
  getRecipientCardChanges,
} from '../recipient-card-changes'

const before: VCard = {
  id: '1',
  version: '4.0',
  firstName: 'Jean',
  lastName: 'Dupont',
  emails: ['jean@example.com'],
  phoneNumbers: ['0102030405'],
  photo: 'https://example.com/jean.png',
}

const { id: _id, ...unchanged } = before

describe('getContactEmails', () => {
  it('prefers structured emails, without duplicating the plain ones', () => {
    expect(
      getContactEmails({
        emails: ['a@example.com'],
        structuredEmails: [{ value: 'a@example.com' }, { value: '' }],
      })
    ).toEqual(['a@example.com'])
  })

  it('falls back to plain emails', () => {
    expect(getContactEmails({ emails: ['a@example.com'] })).toEqual([
      'a@example.com',
    ])
  })
})

describe('getContactPhones', () => {
  it('prefers structured phones', () => {
    expect(
      getContactPhones({
        phoneNumbers: ['111'],
        structuredPhones: [{ number: '222' }],
      })
    ).toEqual(['222'])
  })
})

describe('getRecipientCardChanges', () => {
  it('reports nothing when the card details are unchanged', () => {
    expect(
      getRecipientCardChanges(before, {
        ...unchanged,
        organization: 'ACME',
        note: 'met at the fair',
      })
    ).toEqual({ nameChanged: false, cardChanged: false })
  })

  it('reports a name change', () => {
    expect(
      getRecipientCardChanges(before, { ...unchanged, lastName: 'Martin' })
    ).toEqual({ nameChanged: true, cardChanged: true })
  })

  it.each([
    ['phone', { phoneNumbers: ['0600000000'] }],
    ['email', { emails: ['jean.dupont@example.com'] }],
    ['new photo', { photos: ['data:image/png;base64,AAA'] }],
    ['removed photo', { photos: [] }],
  ])('reports a %s change as a card change only', (_label, change) => {
    expect(
      getRecipientCardChanges(before, { ...unchanged, ...change })
    ).toEqual({ nameChanged: false, cardChanged: true })
  })

  it('compares a loaded contact (plain + structured fields) to the form payload', () => {
    // normalizeContact fills both variants from the API.
    const loaded: VCard = {
      ...before,
      structuredEmails: [{ value: 'jean@example.com' }],
      structuredPhones: [{ number: '0102030405' }],
    }
    expect(
      getRecipientCardChanges(loaded, { ...unchanged, note: 'edited' })
    ).toEqual({ nameChanged: false, cardChanged: false })
  })

  it('treats the kept photo (photos left undefined) as unchanged', () => {
    const { photo: _photo, ...withoutPhoto } = unchanged
    expect(getRecipientCardChanges(before, withoutPhoto).cardChanged).toBe(
      false
    )
  })

  it('counts everything as changed without the previous contact', () => {
    expect(getRecipientCardChanges(undefined, unchanged)).toEqual({
      nameChanged: true,
      cardChanged: true,
    })
  })
})
