import type { VCard } from '../../address-books-types'
import {
  CONTACT_PHONE_TYPES,
  isValidContactUrl,
  serializeAddressBookCreate,
  serializeAddressBookPatch,
  serializeContactCreate,
  serializeContactEditFromForm,
  serializeContactFromForm,
  serializeContactPatch,
  toFormFieldType,
} from '../serialize-contact'

describe('serializeContactFromForm', () => {
  it('maps form values to create body', () => {
    expect(
      serializeContactFromForm({
        contactKind: 'individual',
        name: '',
        firstName: 'Alice',
        lastName: 'Martin',
        middleName: '',
        prefix: '',
        suffix: '',
        nickname: '',
        organization: 'Acme',
        department: '',
        jobTitle: 'Engineer',
        title: '',
        emails: [{ value: 'alice@example.com' }],
        phoneNumbers: [{ value: '+33123456789' }],
        addresses: [
          {
            street: '1 Main St',
            city: 'Paris',
            postalCode: '75001',
            region: '',
            poBox: '',
            extended: '',
            country: 'France',
          },
        ],
        urls: [{ value: 'https://example.com' }],
        impp: [{ value: '' }],
        birthday: '1990-01-01',
        birthdayUnknownYear: false,
        anniversary: '',
        categories: ['VIP'],
        photoDataUri: 'data:image/png;base64,abc',
        clearPhoto: false,
        note: 'VIP',
      })
    ).toEqual({
      display_name: 'Alice Martin',
      first_name: 'Alice',
      last_name: 'Martin',
      organization: 'Acme',
      job_title: 'Engineer',
      emails: [{ value: 'alice@example.com' }],
      phones: [{ number: '+33123456789' }],
      addresses: [
        {
          street: '1 Main St',
          locality: 'Paris',
          postal_code: '75001',
          country: 'France',
          region: null,
          po_box: null,
          extended: null,
        },
      ],
      urls: [{ value: 'https://example.com' }],
      birthday: '1990-01-01',
      categories: ['VIP'],
      photos: ['data:image/png;base64,abc'],
      note: 'VIP',
      kind: 'individual',
    })
  })

  it('clears photos when clearPhoto is set', () => {
    expect(
      serializeContactFromForm({
        contactKind: 'individual',
        name: '',
        firstName: 'Alice',
        lastName: 'Martin',
        middleName: '',
        prefix: '',
        suffix: '',
        nickname: '',
        organization: '',
        department: '',
        jobTitle: '',
        title: '',
        emails: [{ value: '' }],
        phoneNumbers: [{ value: '' }],
        addresses: [
          {
            street: '',
            city: '',
            postalCode: '',
            region: '',
            poBox: '',
            extended: '',
            country: '',
          },
        ],
        urls: [{ value: '' }],
        impp: [{ value: '' }],
        birthday: '',
        birthdayUnknownYear: false,
        anniversary: '',
        categories: [],
        photoDataUri: undefined,
        clearPhoto: true,
        note: '',
      }).photos
    ).toEqual([])
  })
  it('maps org contacts with typed emails and phones', () => {
    expect(
      serializeContactFromForm({
        contactKind: 'org',
        name: '',
        firstName: '',
        lastName: '',
        middleName: '',
        prefix: '',
        suffix: '',
        nickname: '',
        organization: 'Acme Corp',
        department: '',
        jobTitle: '',
        title: '',
        emails: [{ value: 'info@acme.com', type: 'work', pref: true }],
        phoneNumbers: [{ value: '+33123456789', type: 'work', pref: false }],
        addresses: [
          {
            street: '',
            city: '',
            postalCode: '',
            region: '',
            poBox: '',
            extended: '',
            country: '',
          },
        ],
        urls: [{ value: '' }],
        impp: [{ value: '' }],
        birthday: '',
        birthdayUnknownYear: false,
        anniversary: '',
        categories: [],
        photoDataUri: undefined,
        clearPhoto: false,
        note: '',
      })
    ).toEqual(
      expect.objectContaining({
        display_name: 'Acme Corp',
        organization: 'Acme Corp',
        emails: [{ value: 'info@acme.com', types: ['work'], pref: 1 }],
        phones: [{ number: '+33123456789', types: ['work'] }],
        kind: 'org',
      })
    )
  })
})

describe('serializeContactPatch', () => {
  it('maps partial VCard fields to patch body', () => {
    expect(
      serializeContactPatch({
        firstName: 'Bob',
        lastName: 'Smith',
        emails: ['bob@example.com'],
        phoneNumbers: ['+33987654321'],
        urls: ['https://example.com'],
        birthday: '1985-05-05',
      })
    ).toEqual({
      first_name: 'Bob',
      last_name: 'Smith',
      display_name: 'Bob Smith',
      emails: [{ value: 'bob@example.com' }],
      phones: [{ number: '+33987654321' }],
      urls: [{ value: 'https://example.com' }],
      birthday: '1985-05-05',
    })
  })
})

describe('serializeContactCreate', () => {
  it('reuses patch serializer for create payloads', () => {
    expect(
      serializeContactCreate({
        firstName: 'Carol',
        lastName: 'Jones',
      })
    ).toEqual({
      first_name: 'Carol',
      last_name: 'Jones',
      display_name: 'Carol Jones',
    })
  })
})

describe('serializeAddressBook helpers', () => {
  it('maps address book create payload', () => {
    expect(
      serializeAddressBookCreate({
        name: 'Work',
        description: 'Team contacts',
      })
    ).toEqual({
      name: 'Work',
      description: 'Team contacts',
    })
  })

  it('maps default flag to is_default', () => {
    expect(
      serializeAddressBookPatch({
        name: 'Personal',
        default: true,
      })
    ).toEqual({
      name: 'Personal',
      is_default: true,
    })
  })
})

describe('serializeContactEditFromForm', () => {
  const emptied = {
    contactKind: 'individual' as const,
    name: '',
    firstName: 'Alice',
    lastName: 'Martin',
    middleName: '',
    prefix: '',
    suffix: '',
    nickname: '',
    organization: '  ',
    department: '',
    jobTitle: '',
    title: '',
    emails: [{ value: '' }],
    phoneNumbers: [],
    addresses: [],
    urls: [{ value: '' }],
    impp: [],
    birthday: '',
    birthdayUnknownYear: false,
    anniversary: '',
    categories: [],
    photoDataUri: undefined,
    clearPhoto: false,
    note: '',
  }

  it('sends emptied multi-valued fields as empty lists', () => {
    const body = serializeContactEditFromForm(emptied)
    expect(body).toEqual(
      expect.objectContaining({
        emails: [],
        phones: [],
        addresses: [],
        urls: [],
        impp: [],
        categories: [],
      })
    )
  })

  it('sends emptied note, organization and job title as null', () => {
    const body = serializeContactEditFromForm(emptied)
    expect(body).toEqual(
      expect.objectContaining({
        note: null,
        organization: null,
        job_title: null,
      })
    )
  })

  it('keeps the cleared keys through JSON encoding', () => {
    const sent = JSON.parse(
      JSON.stringify(serializeContactEditFromForm(emptied))
    )
    for (const key of [
      'emails',
      'phones',
      'addresses',
      'urls',
      'impp',
      'categories',
      'note',
      'organization',
      'job_title',
    ]) {
      expect(sent).toHaveProperty(key)
    }
  })

  it('keeps filled values as they are', () => {
    const body = serializeContactEditFromForm({
      ...emptied,
      organization: 'Acme',
      jobTitle: 'Engineer',
      note: 'VIP',
      phoneNumbers: [{ value: '+33123456789' }],
      categories: ['Work'],
    })
    expect(body).toEqual(
      expect.objectContaining({
        organization: 'Acme',
        job_title: 'Engineer',
        note: 'VIP',
        phones: [{ number: '+33123456789' }],
        categories: ['Work'],
      })
    )
  })

  it('does not change the create body', () => {
    const created = JSON.parse(
      JSON.stringify(serializeContactFromForm(emptied))
    )
    expect(created).not.toHaveProperty('emails')
    expect(created).not.toHaveProperty('categories')
    expect(created.note).toBeUndefined()
    expect(created.organization).toBeUndefined()
    expect(created.job_title).toBeUndefined()
  })
  describe('round trip with the stored contact', () => {
    const stored: VCard = {
      id: 'c1',
      version: '4.0',
      firstName: 'Alice',
      lastName: 'Martin',
      nickname: 'Ali',
      structuredEmails: [
        { value: 'alice@work.example', types: ['work', 'internet'], pref: 2 },
      ],
      structuredPhones: [{ number: '+331', types: ['cell'], pref: 1 }],
      structuredAddresses: [
        {
          street: '1 Main St',
          locality: 'Paris',
          region: null,
          po_box: null,
          extended: null,
          postal_code: '75001',
          country: 'France',
          types: ['home'],
          pref: 1,
        },
      ],
      structuredUrls: [{ value: 'https://alice.example', type: 'home' }],
      structuredImpp: [{ uri: 'xmpp:alice@chat.example', type: 'work' }],
    }

    // What the form holds once loaded from `stored`.
    const loaded = {
      ...emptied,
      nickname: 'Ali',
      emails: [
        {
          sourceIndex: 0,
          value: 'alice@work.example',
          type: 'work' as const,
          pref: false,
        },
      ],
      phoneNumbers: [
        { sourceIndex: 0, value: '+331', type: '_none' as const, pref: true },
      ],
      addresses: [
        {
          sourceIndex: 0,
          street: '1 Main St',
          city: 'Paris',
          postalCode: '75001',
          region: '',
          poBox: '',
          extended: '',
          country: 'France',
        },
      ],
      urls: [{ sourceIndex: 0, value: 'https://alice.example' }],
      impp: [{ sourceIndex: 0, value: 'xmpp:alice@chat.example' }],
    }

    it('sends the stored sub-objects back unchanged', () => {
      const body = serializeContactEditFromForm(loaded, stored)
      expect(body.emails).toEqual(stored.structuredEmails)
      expect(body.phones).toEqual(stored.structuredPhones)
      expect(body.addresses).toEqual(stored.structuredAddresses)
      expect(body.urls).toEqual(stored.structuredUrls)
      expect(body.impp).toEqual(stored.structuredImpp)
    })

    it('does not resend the display name when the name is untouched', () => {
      const body = serializeContactEditFromForm(loaded, stored)
      expect(body).not.toHaveProperty('display_name')
      expect(
        serializeContactEditFromForm({ ...loaded, lastName: 'Durand' }, stored)
          .display_name
      ).toBe('Alice Durand')
    })

    it('replaces the type the user changed and keeps the row data', () => {
      const body = serializeContactEditFromForm(
        {
          ...loaded,
          emails: [{ ...loaded.emails[0], type: 'home' as const, pref: true }],
        },
        stored
      )
      expect(body.emails).toEqual([
        { value: 'alice@work.example', types: ['home'], pref: 1 },
      ])
    })

    it('clears emptied text fields', () => {
      const body = serializeContactEditFromForm(
        { ...loaded, nickname: '' },
        stored
      )
      expect(body).toEqual(
        expect.objectContaining({
          nickname: null,
          middle_name: null,
          prefix: null,
          suffix: null,
          department: null,
          role: null,
          birthday: null,
          anniversary: null,
        })
      )
    })
  })

  it('adds https:// to a URL typed without scheme', () => {
    const body = serializeContactEditFromForm({
      ...emptied,
      urls: [{ value: 'www.example.fr' }],
    })
    expect(body.urls).toEqual([{ value: 'https://www.example.fr' }])
  })
})

describe('contact form helpers', () => {
  it('accepts URLs without scheme and rejects garbage', () => {
    expect(isValidContactUrl('www.example.fr')).toBe(true)
    expect(isValidContactUrl('https://example.fr/a?b=1')).toBe(true)
    expect(isValidContactUrl('')).toBe(true)
    expect(isValidContactUrl('not a url')).toBe(false)
  })

  it('maps stored types to the select, case-insensitively', () => {
    expect(toFormFieldType(['WORK', 'voice'], CONTACT_PHONE_TYPES)).toBe('work')
    expect(toFormFieldType(['cell'], CONTACT_PHONE_TYPES)).toBe('_none')
    expect(toFormFieldType(undefined, CONTACT_PHONE_TYPES)).toBe('_none')
  })
})
