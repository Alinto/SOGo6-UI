import type { AddressBookShareRights } from '../address-books-types'

/**
 * Sentinel `uid` for the "any authenticated user" pseudo-entry in an address
 * book's share list — not a real account, just a marker the UI/API layers
 * use to recognize it (e.g. to always sort/display this row last).
 */
export const ANY_AUTHENTICATED_UID = 'anyauthenticated'

export interface AddressBookPermissionDef {
  key: keyof AddressBookShareRights
  labelKey: string
}

/** Iteration order for the 4 permission checkboxes in the sharing UI. */
export const ADDRESS_BOOK_PERMISSIONS: AddressBookPermissionDef[] = [
  {
    key: 'can_view',
    labelKey: 'sharing.permissions.canView.label.string',
  },
  {
    key: 'can_create_objects',
    labelKey: 'sharing.permissions.canCreateObjects.label.string',
  },
  {
    key: 'can_edit_objects',
    labelKey: 'sharing.permissions.canEditObjects.label.string',
  },
  {
    key: 'can_erase_objects',
    labelKey: 'sharing.permissions.canEraseObjects.label.string',
  },
]

export function defaultAddressBookShareRights(): AddressBookShareRights {
  return {
    can_view: false,
    can_create_objects: false,
    can_edit_objects: false,
    can_erase_objects: false,
  }
}

/** Whether at least one right is actually granted (vs. a placeholder entry with everything left off). */
export function hasAnyAddressBookRight(rights: AddressBookShareRights): boolean {
  return (
    rights.can_view ||
    rights.can_create_objects ||
    rights.can_edit_objects ||
    rights.can_erase_objects
  )
}

/** Whether 'add', 'edit' or 'erase' rights are on, which forces 'view' on too. */
export function isAddressBookViewForced(
  rights: AddressBookShareRights
): boolean {
  return rights.can_create_objects || rights.can_edit_objects || rights.can_erase_objects
}

/** Standing invariant: create/edit/erase rights imply view rights (can't act on cards you can't see). */
export function enforceAddressBookHierarchy(
  rights: AddressBookShareRights
): AddressBookShareRights {
  if (!isAddressBookViewForced(rights) || rights.can_view) return rights
  return { ...rights, can_view: true }
}

export function applyAddressBookPermissionToggle(
  rights: AddressBookShareRights,
  key: keyof AddressBookShareRights,
  checked: boolean
): AddressBookShareRights {
  const next = { ...rights, [key]: checked }
  return enforceAddressBookHierarchy(next)
}
