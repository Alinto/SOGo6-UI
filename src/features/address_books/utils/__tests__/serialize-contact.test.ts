import {
  serializeAddressBookCreate,
  serializeAddressBookPatch,
  serializeContactCreate,
  serializeContactFromForm,
  serializeContactPatch,
} from '../serialize-contact'

describe('serializeContactFromForm', () => {
  it('maps form values to create body', () => {
    expect(
      serializeContactFromForm({
        contactKind: 'individual',
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
