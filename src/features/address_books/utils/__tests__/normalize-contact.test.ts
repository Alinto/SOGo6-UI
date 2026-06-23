import { normalizeContact, normalizeContactsList } from '../normalize-contact'

describe('normalizeContact', () => {
  it('maps api contact to VCard', () => {
    const vcard = normalizeContact({
      key: 'ct-1',
      first_name: 'John',
      last_name: 'Doe',
      emails: [{ value: 'john@example.com' }],
      phones: [{ number: '+33123456789' }],
      urls: [{ value: 'https://example.com' }],
      addresses: [
        {
          street: '1 rue de Paris',
          locality: 'Paris',
          postal_code: '75001',
          country: 'France',
        },
      ],
      birthday: '1990-01-01',
    })

    expect(vcard.id).toBe('ct-1')
    expect(vcard.firstName).toBe('John')
    expect(vcard.emails).toEqual(['john@example.com'])
    expect(vcard.phoneNumbers).toEqual(['+33123456789'])
    expect(vcard.urls).toEqual(['https://example.com'])
    expect(vcard.addresses?.[0]).toContain('Paris')
    expect(vcard.birthday).toBe('1990-01-01')
  })

  it('returns VCard input unchanged when already normalized', () => {
    const existing = {
      id: 'c1',
      version: '4.0',
      firstName: 'Alice',
      lastName: 'Martin',
    }
    expect(normalizeContact(existing)).toBe(existing)
  })
})

describe('normalizeContactsList', () => {
  it('normalizes wrapped contacts collection', () => {
    const contacts = normalizeContactsList({
      data: {
        contacts: [
          {
            key: 'c1',
            first_name: 'Alice',
            last_name: 'Martin',
          },
        ],
      },
      error_code: 'S000000',
    })

    expect(contacts).toHaveLength(1)
    expect(contacts[0].firstName).toBe('Alice')
  })

  it('normalizes plain arrays', () => {
    const contacts = normalizeContactsList([
      { key: 'c1', first_name: 'Bob', last_name: 'Smith' },
    ])

    expect(contacts[0].lastName).toBe('Smith')
  })
})
