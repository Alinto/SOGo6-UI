import type {
  AddressBook,
  AddressBookShareRights,
} from '../address-books-types'
import {
  defaultAddressBookShareRights,
  enforceAddressBookHierarchy,
} from './address-book-permission-mapping'

export interface AddressBookPermissions {
  /** Browse the address book and its cards. */
  canView: boolean
  /** Add contacts / lists (also covers importing). */
  canCreate: boolean
  /** Modify existing contacts / lists (including their notes). */
  canEdit: boolean
  /** Delete contacts / lists. */
  canErase: boolean
}

export const NO_WRITE_PERMISSIONS: AddressBookPermissions = {
  canView: true,
  canCreate: false,
  canEdit: false,
  canErase: false,
}

export const FULL_ADDRESS_BOOK_PERMISSIONS: AddressBookPermissions = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canErase: true,
}

/**
 * Rights of the connected user as sent by the backend. Missing flags default
 * to false, write rights force view on; non-object values are ignored so the
 * legacy type-based behaviour applies.
 */
export function normalizeAddressBookRights(
  value: unknown
): AddressBookShareRights | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined
  }
  return enforceAddressBookHierarchy({
    ...defaultAddressBookShareRights(),
    ...(value as Partial<AddressBookShareRights>),
  })
}

/**
 * Rights carried by a GET /addressbooks/{key}/contacts payload, either inside
 * the `data` envelope or next to it.
 */
export function extractContactsRights(
  payload: unknown
): AddressBookShareRights | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  const envelope = payload as { rights?: unknown; data?: unknown }
  const data =
    typeof envelope.data === 'object' && envelope.data !== null
      ? (envelope.data as { rights?: unknown })
      : undefined
  return normalizeAddressBookRights(data?.rights ?? envelope.rights)
}

/** Whether at least one write right (create / edit / erase) is granted. */
export function hasAnyWritePermission(
  permissions: AddressBookPermissions
): boolean {
  return permissions.canCreate || permissions.canEdit || permissions.canErase
}

/**
 * What the connected user may do in an address book.
 *
 * The rights the backend sent for that book win when known. Until they have
 * been loaded (or without them, e.g. fake API), only personal address books
 * are fully writable. No book means viewing only.
 */
export function getAddressBookPermissions(
  book?: AddressBook | null,
  rights?: AddressBookShareRights | null
): AddressBookPermissions {
  if (rights) {
    return {
      canView: rights.can_view,
      canCreate: rights.can_create_objects,
      canEdit: rights.can_edit_objects,
      canErase: rights.can_erase_objects,
    }
  }

  if (!book) return NO_WRITE_PERMISSIONS

  return book.type === 'personal'
    ? FULL_ADDRESS_BOOK_PERMISSIONS
    : NO_WRITE_PERMISSIONS
}
