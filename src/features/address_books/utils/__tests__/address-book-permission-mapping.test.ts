import {
  ADDRESS_BOOK_PERMISSIONS,
  ANY_AUTHENTICATED_UID,
  applyAddressBookPermissionToggle,
  defaultAddressBookShareRights,
  enforceAddressBookHierarchy,
  hasAnyAddressBookRight,
  isAddressBookViewForced,
} from '../address-book-permission-mapping'

describe('address-book-permission-mapping', () => {
  describe('ANY_AUTHENTICATED_UID', () => {
    it('is a stable sentinel string', () => {
      expect(ANY_AUTHENTICATED_UID).toBe('anyauthenticated')
    })
  })

  describe('ADDRESS_BOOK_PERMISSIONS', () => {
    it('has exactly the 4 permission checkboxes in order', () => {
      expect(ADDRESS_BOOK_PERMISSIONS.map((p) => p.key)).toEqual([
        'can_view',
        'can_create_objects',
        'can_edit_objects',
        'can_erase_objects',
      ])
    })

    it('each definition has a labelKey', () => {
      for (const def of ADDRESS_BOOK_PERMISSIONS) {
        expect(def.labelKey).toEqual(expect.any(String))
        expect(def.labelKey.length).toBeGreaterThan(0)
      }
    })
  })

  describe('defaultAddressBookShareRights', () => {
    it('defaults every right to false', () => {
      expect(defaultAddressBookShareRights()).toEqual({
        can_view: false,
        can_create_objects: false,
        can_edit_objects: false,
        can_erase_objects: false,
      })
    })

    it('returns a fresh object on every call (not a shared reference)', () => {
      const a = defaultAddressBookShareRights()
      const b = defaultAddressBookShareRights()
      expect(a).not.toBe(b)
      a.can_view = true
      expect(b.can_view).toBe(false)
    })
  })

  describe('isAddressBookViewForced', () => {
    it('is false when only can_view is on', () => {
      expect(
        isAddressBookViewForced({
          can_view: true,
          can_create_objects: false,
          can_edit_objects: false,
          can_erase_objects: false,
        })
      ).toBe(false)
    })

    it.each(['can_create_objects', 'can_edit_objects', 'can_erase_objects'] as const)(
      'is true when %s is on',
      (key) => {
        const rights = { ...defaultAddressBookShareRights(), [key]: true }
        expect(isAddressBookViewForced(rights)).toBe(true)
      }
    )
  })

  describe('enforceAddressBookHierarchy', () => {
    it('leaves rights untouched when nothing forces view', () => {
      const rights = defaultAddressBookShareRights()
      expect(enforceAddressBookHierarchy(rights)).toEqual(rights)
    })

    it('forces can_view on when can_create_objects is on', () => {
      const rights = {
        ...defaultAddressBookShareRights(),
        can_create_objects: true,
      }
      expect(enforceAddressBookHierarchy(rights).can_view).toBe(true)
    })

    it('forces can_view on when can_edit_objects is on', () => {
      const rights = {
        ...defaultAddressBookShareRights(),
        can_edit_objects: true,
      }
      expect(enforceAddressBookHierarchy(rights).can_view).toBe(true)
    })

    it('forces can_view on when can_erase_objects is on', () => {
      const rights = {
        ...defaultAddressBookShareRights(),
        can_erase_objects: true,
      }
      expect(enforceAddressBookHierarchy(rights).can_view).toBe(true)
    })
  })

  describe('applyAddressBookPermissionToggle', () => {
    it('toggles a permission on', () => {
      const rights = defaultAddressBookShareRights()
      const next = applyAddressBookPermissionToggle(rights, 'can_view', true)
      expect(next.can_view).toBe(true)
    })

    it('toggling can_erase_objects on also forces can_view on', () => {
      const rights = defaultAddressBookShareRights()
      const next = applyAddressBookPermissionToggle(
        rights,
        'can_erase_objects',
        true
      )
      expect(next).toEqual({
        can_view: true,
        can_create_objects: false,
        can_edit_objects: false,
        can_erase_objects: true,
      })
    })

    it('toggling can_view off while can_edit_objects is on re-forces can_view back on', () => {
      const rights = {
        ...defaultAddressBookShareRights(),
        can_edit_objects: true,
        can_view: true,
      }
      const next = applyAddressBookPermissionToggle(rights, 'can_view', false)
      expect(next.can_view).toBe(true)
    })

    it('does not mutate the input object', () => {
      const rights = defaultAddressBookShareRights()
      applyAddressBookPermissionToggle(rights, 'can_view', true)
      expect(rights.can_view).toBe(false)
    })
  })

  describe('hasAnyAddressBookRight', () => {
    it('returns false for the default (all off) rights', () => {
      expect(hasAnyAddressBookRight(defaultAddressBookShareRights())).toBe(false)
    })

    it('returns true when any single right is on', () => {
      for (const def of ADDRESS_BOOK_PERMISSIONS) {
        const rights = { ...defaultAddressBookShareRights(), [def.key]: true }
        expect(hasAnyAddressBookRight(rights)).toBe(true)
      }
    })
  })
})
