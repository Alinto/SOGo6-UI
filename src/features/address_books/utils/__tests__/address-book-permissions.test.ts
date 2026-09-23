import type {
  AddressBook,
  AddressBookShareRights,
} from '../../address-books-types'
import {
  extractContactsRights,
  FULL_ADDRESS_BOOK_PERMISSIONS,
  getAddressBookPermissions,
  hasAnyWritePermission,
  NO_WRITE_PERMISSIONS,
  normalizeAddressBookRights,
} from '../address-book-permissions'

const book = (overrides: Partial<AddressBook> = {}): AddressBook => ({
  id: 'b1',
  name: 'Book',
  description: '',
  type: 'shared',
  ...overrides,
})

const rights = (
  overrides: Partial<AddressBookShareRights> = {}
): AddressBookShareRights => ({
  can_view: true,
  can_create_objects: false,
  can_edit_objects: false,
  can_erase_objects: false,
  ...overrides,
})

describe('normalizeAddressBookRights', () => {
  it('keeps a complete permissions object', () => {
    const value = rights({ can_create_objects: true, can_edit_objects: true })
    expect(normalizeAddressBookRights(value)).toEqual(value)
  })

  it('defaults missing flags to false', () => {
    expect(
      normalizeAddressBookRights({
        can_view: true,
        can_erase_objects: true,
      })
    ).toEqual(rights({ can_erase_objects: true }))
  })

  it('forces view when a write right is granted', () => {
    expect(normalizeAddressBookRights({ can_edit_objects: true })).toEqual(
      rights({ can_edit_objects: true })
    )
  })

  it('ignores non-object values', () => {
    expect(normalizeAddressBookRights(undefined)).toBeUndefined()
    expect(normalizeAddressBookRights(null)).toBeUndefined()
    expect(normalizeAddressBookRights('readwrite')).toBeUndefined()
    expect(normalizeAddressBookRights([])).toBeUndefined()
  })
})

describe('extractContactsRights', () => {
  const backendRights = {
    can_view: true,
    can_create_objects: true,
    can_edit_objects: true,
    can_erase_objects: false,
  }

  it('reads rights inside the data envelope', () => {
    expect(
      extractContactsRights({ data: { contacts: [], rights: backendRights } })
    ).toEqual(backendRights)
  })

  it('reads rights next to the data envelope', () => {
    expect(
      extractContactsRights({ data: { contacts: [] }, rights: backendRights })
    ).toEqual(backendRights)
  })

  it('returns undefined when the payload carries none', () => {
    expect(extractContactsRights({ data: { contacts: [] } })).toBeUndefined()
    // `rights` is the only backend key
    expect(
      extractContactsRights({
        data: { contacts: [], permissions: backendRights },
      })
    ).toBeUndefined()
    expect(extractContactsRights([])).toBeUndefined()
    expect(extractContactsRights(null)).toBeUndefined()
  })
})

describe('getAddressBookPermissions', () => {
  it('maps the rights loaded for the book', () => {
    expect(
      getAddressBookPermissions(book(), rights({ can_create_objects: true }))
    ).toEqual({
      canView: true,
      canCreate: true,
      canEdit: false,
      canErase: false,
    })
  })

  it('lets the loaded rights win over the book type', () => {
    expect(
      getAddressBookPermissions(book({ type: 'personal' }), rights())
    ).toEqual(NO_WRITE_PERMISSIONS)
  })

  it('applies the rights even when the book itself is unknown', () => {
    expect(
      getAddressBookPermissions(null, rights({ can_erase_objects: true }))
    ).toMatchObject({ canErase: true })
  })

  it('falls back to full rights on personal books without loaded rights', () => {
    expect(getAddressBookPermissions(book({ type: 'personal' }))).toEqual(
      FULL_ADDRESS_BOOK_PERMISSIONS
    )
  })

  it('falls back to view-only on other books without loaded rights', () => {
    expect(getAddressBookPermissions(book({ type: 'shared' }))).toEqual(
      NO_WRITE_PERMISSIONS
    )
    expect(getAddressBookPermissions(book({ type: 'global' }))).toEqual(
      NO_WRITE_PERMISSIONS
    )
  })

  it('is view-only when there is no book', () => {
    expect(getAddressBookPermissions(null)).toEqual(NO_WRITE_PERMISSIONS)
    expect(getAddressBookPermissions(undefined)).toEqual(NO_WRITE_PERMISSIONS)
  })
})

describe('hasAnyWritePermission', () => {
  it('is true as soon as one write right is granted', () => {
    expect(hasAnyWritePermission(NO_WRITE_PERMISSIONS)).toBe(false)
    expect(
      hasAnyWritePermission({ ...NO_WRITE_PERMISSIONS, canErase: true })
    ).toBe(true)
    expect(
      hasAnyWritePermission({ ...NO_WRITE_PERMISSIONS, canEdit: true })
    ).toBe(true)
    expect(
      hasAnyWritePermission({ ...NO_WRITE_PERMISSIONS, canCreate: true })
    ).toBe(true)
  })
})
