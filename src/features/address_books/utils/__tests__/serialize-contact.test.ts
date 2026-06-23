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
        firstName: 'Alice',
        lastName: 'Martin',
        organization: 'Acme',
        jobTitle: 'Engineer',
        emails: [{ value: 'alice@example.com' }],
        phoneNumbers: [{ value: '+33123456789' }],
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
      note: 'VIP',
      kind: 'individual',
    })
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
