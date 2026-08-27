import type { FolderShareRights } from '../../mails-types'
import {
  ADVANCED_PERMISSIONS,
  applyAdvancedToggle,
  applySimplifiedToggle,
  buildRightsFromPermissions,
  computeSimplifiedStates,
  enforceHierarchy,
  getActiveAdvancedCodes,
  isReadForced,
  isSimplifiedChainForced,
  SIMPLIFIED_PERMISSIONS,
} from '../permission-mapping'

describe('permission-mapping', () => {
  describe('computeSimplifiedStates', () => {
    it('marks a simplified key checked only when all of its fields are 1', () => {
      const rights: FolderShareRights = {
        userCanViewFolder: 1,
        userCanReadMails: 1,
      }
      expect(computeSimplifiedStates(rights).read).toBe(true)
    })

    it('marks a simplified key unchecked when only some of its fields are 1', () => {
      const rights: FolderShareRights = {
        userCanViewFolder: 1,
        userCanReadMails: 0,
      }
      expect(computeSimplifiedStates(rights).read).toBe(false)
    })

    it('marks a simplified key unchecked when its fields are undefined', () => {
      expect(computeSimplifiedStates({}).delete).toBe(false)
    })

    it('computes all 6 simplified keys independently', () => {
      const rights: FolderShareRights = {
        userCanViewFolder: 1,
        userCanReadMails: 1,
        userCanMarkMailsRead: 1,
        userCanWriteMails: 1,
        userCanInsertMails: 1,
        userIsAdministrator: 1,
      }
      const states = computeSimplifiedStates(rights)
      expect(states).toEqual({
        read: true,
        modify: true,
        delete: false,
        move: true,
        administerRights: true,
        administerSubfolders: false,
      })
    })
  })

  describe('enforceHierarchy', () => {
    it('leaves rights unchanged when neither modify nor delete is on', () => {
      const rights: FolderShareRights = { userCanInsertMails: 1 }
      expect(enforceHierarchy(rights)).toEqual(rights)
    })

    it('forces read on when modify (s/w) is on', () => {
      const rights: FolderShareRights = { userCanWriteMails: 1 }
      const result = enforceHierarchy(rights)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })

    it('forces read on when delete (t/e) is on', () => {
      const rights: FolderShareRights = { userCanEraseMails: 1 }
      const result = enforceHierarchy(rights)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })

    it('forces read on when both modify and delete are on', () => {
      const rights: FolderShareRights = {
        userCanMarkMailsRead: 1,
        userCanExpungeFolder: 1,
      }
      const result = enforceHierarchy(rights)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })
  })

  describe('isReadForced', () => {
    it('returns false when modify and delete fields are all off', () => {
      expect(isReadForced({ userCanInsertMails: 1 })).toBe(false)
    })

    it('returns true when any modify/delete field is on', () => {
      expect(isReadForced({ userCanMarkMailsRead: 1 })).toBe(true)
      expect(isReadForced({ userCanWriteMails: 1 })).toBe(true)
      expect(isReadForced({ userCanEraseMails: 1 })).toBe(true)
      expect(isReadForced({ userCanExpungeFolder: 1 })).toBe(true)
    })

    it('is independent of the current value of read fields', () => {
      expect(
        isReadForced({ userCanWriteMails: 1, userCanReadMails: 0 })
      ).toBe(true)
    })
  })

  describe('applySimplifiedToggle', () => {
    it('checking read sets both underlying fields to 1', () => {
      const result = applySimplifiedToggle({}, 'read', true)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })

    it('unchecking read sets both underlying fields to 0 when nothing forces it', () => {
      const rights: FolderShareRights = {
        userCanViewFolder: 1,
        userCanReadMails: 1,
      }
      const result = applySimplifiedToggle(rights, 'read', false)
      expect(result.userCanViewFolder).toBe(0)
      expect(result.userCanReadMails).toBe(0)
    })

    it('re-forces read back on when unchecking it while modify is still on', () => {
      const rights: FolderShareRights = {
        userCanViewFolder: 1,
        userCanReadMails: 1,
        userCanWriteMails: 1,
      }
      const result = applySimplifiedToggle(rights, 'read', false)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })

    it('checking delete also forces read on', () => {
      const result = applySimplifiedToggle({}, 'delete', true)
      expect(result.userCanEraseMails).toBe(1)
      expect(result.userCanExpungeFolder).toBe(1)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })

    it('checking move cascades to force read, modify, and delete on too', () => {
      const result = applySimplifiedToggle({}, 'move', true)
      expect(result.userCanInsertMails).toBe(1)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
      expect(result.userCanMarkMailsRead).toBe(1)
      expect(result.userCanWriteMails).toBe(1)
      expect(result.userCanEraseMails).toBe(1)
      expect(result.userCanExpungeFolder).toBe(1)
    })

    it('checking delete cascades to force modify and read on too', () => {
      const result = applySimplifiedToggle({}, 'delete', true)
      expect(result.userCanEraseMails).toBe(1)
      expect(result.userCanExpungeFolder).toBe(1)
      expect(result.userCanMarkMailsRead).toBe(1)
      expect(result.userCanWriteMails).toBe(1)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
    })

    it('checking modify cascades to force read on, but not delete/move', () => {
      const result = applySimplifiedToggle({}, 'modify', true)
      expect(result.userCanMarkMailsRead).toBe(1)
      expect(result.userCanWriteMails).toBe(1)
      expect(result.userCanViewFolder).toBe(1)
      expect(result.userCanReadMails).toBe(1)
      expect(result.userCanEraseMails).toBeUndefined()
      expect(result.userCanInsertMails).toBeUndefined()
    })

    it('checking administerRights only sets userIsAdministrator (not part of the chain)', () => {
      const result = applySimplifiedToggle({}, 'administerRights', true)
      expect(result.userIsAdministrator).toBe(1)
      expect(result.userCanViewFolder).toBeUndefined()
    })

    it('checking administerSubfolders sets both create and delete subfolder rights (not part of the chain)', () => {
      const result = applySimplifiedToggle({}, 'administerSubfolders', true)
      expect(result.userCanCreateSubfolders).toBe(1)
      expect(result.userCanRemoveFolder).toBe(1)
      expect(result.userCanViewFolder).toBeUndefined()
    })
  })

  describe('isSimplifiedChainForced', () => {
    it('forces read when modify is on', () => {
      const rights = applySimplifiedToggle({}, 'modify', true)
      expect(isSimplifiedChainForced(rights, 'read')).toBe(true)
    })

    it('forces read and modify when delete is on', () => {
      const rights = applySimplifiedToggle({}, 'delete', true)
      expect(isSimplifiedChainForced(rights, 'read')).toBe(true)
      expect(isSimplifiedChainForced(rights, 'modify')).toBe(true)
      expect(isSimplifiedChainForced(rights, 'delete')).toBe(false)
    })

    it('does not force move (nothing follows it in the chain)', () => {
      const rights = applySimplifiedToggle({}, 'move', true)
      expect(isSimplifiedChainForced(rights, 'move')).toBe(false)
    })

    it('is false for all chain keys when nothing is checked', () => {
      expect(isSimplifiedChainForced({}, 'read')).toBe(false)
      expect(isSimplifiedChainForced({}, 'modify')).toBe(false)
      expect(isSimplifiedChainForced({}, 'delete')).toBe(false)
    })

    it('always returns false for administerRights/administerSubfolders', () => {
      const rights = applySimplifiedToggle({}, 'move', true)
      expect(isSimplifiedChainForced(rights, 'administerRights')).toBe(false)
      expect(isSimplifiedChainForced(rights, 'administerSubfolders')).toBe(false)
    })
  })

  describe('chain independence from administerRights/administerSubfolders', () => {
    it('checking administerRights does not force any chain permission', () => {
      const rights = applySimplifiedToggle({}, 'administerRights', true)
      expect(computeSimplifiedStates(rights).read).toBe(false)
    })

    it('checking move does not force administerRights or administerSubfolders', () => {
      const rights = applySimplifiedToggle({}, 'move', true)
      const states = computeSimplifiedStates(rights)
      expect(states.administerRights).toBe(false)
      expect(states.administerSubfolders).toBe(false)
    })
  })

  describe('advanced toggles are unaffected by the simplified-only chain', () => {
    it('checking a single advanced field does not cascade like the simplified chain would', () => {
      const rights = applyAdvancedToggle({}, 'userCanInsertMails', true)
      expect(rights.userCanInsertMails).toBe(1)
      expect(rights.userCanMarkMailsRead).toBeUndefined()
      expect(rights.userCanEraseMails).toBeUndefined()
    })
  })

  describe('applyAdvancedToggle', () => {
    it('toggling a single advanced field only affects that field', () => {
      const result = applyAdvancedToggle({}, 'userCanPostMails', true)
      expect(result.userCanPostMails).toBe(1)
      expect(result.userCanViewFolder).toBeUndefined()
    })

    it('unchecking read directly while modify stays on re-forces it back on', () => {
      const rights: FolderShareRights = {
        userCanViewFolder: 1,
        userCanReadMails: 1,
        userCanWriteMails: 1,
      }
      const result = applyAdvancedToggle(rights, 'userCanReadMails', false)
      expect(result.userCanReadMails).toBe(1)
      expect(result.userCanViewFolder).toBe(1)
    })

    it('bidirectional sync: toggling an advanced field is reflected in computeSimplifiedStates', () => {
      let rights: FolderShareRights = {}
      rights = applyAdvancedToggle(rights, 'userCanViewFolder', true)
      rights = applyAdvancedToggle(rights, 'userCanReadMails', true)
      expect(computeSimplifiedStates(rights).read).toBe(true)
    })
  })

  describe('bidirectional sync round-trip', () => {
    it('simplified toggle then advanced read reflects the same rights', () => {
      const rights = applySimplifiedToggle({}, 'modify', true)
      const advancedField = ADVANCED_PERMISSIONS.find(
        (d) => d.field === 'userCanWriteMails'
      )
      expect(advancedField).toBeDefined()
      expect(rights.userCanWriteMails).toBe(1)
      expect(rights.userCanMarkMailsRead).toBe(1)
    })

    it('every simplified permission key has a matching definition', () => {
      const keys = SIMPLIFIED_PERMISSIONS.map((d) => d.key)
      expect(keys).toEqual([
        'read',
        'modify',
        'delete',
        'move',
        'administerRights',
        'administerSubfolders',
      ])
    })

    it('advanced permissions list has all 11 IMAP-equivalent fields in order', () => {
      expect(ADVANCED_PERMISSIONS.map((d) => d.imapCode)).toEqual([
        'l',
        'r',
        's',
        'w',
        'i',
        'p',
        'k',
        'x',
        't',
        'e',
        'a',
      ])
    })
  })

  describe('getActiveAdvancedCodes', () => {
    it('returns the IMAP codes for every right currently on', () => {
      const rights: FolderShareRights = {
        userCanReadMails: 1,
        userCanMarkMailsRead: 1,
      }
      expect(getActiveAdvancedCodes(rights)).toEqual(['r', 's'])
    })

    it('returns an empty array when no rights are on', () => {
      expect(getActiveAdvancedCodes({})).toEqual([])
    })
  })

  describe('buildRightsFromPermissions', () => {
    it('rebuilds rights from IMAP codes', () => {
      const rights = buildRightsFromPermissions(['r', 'p'])
      expect(rights.userCanReadMails).toBe(1)
      expect(rights.userCanPostMails).toBe(1)
      expect(rights.userCanViewFolder).toBeUndefined()
    })

    it('applies the read hierarchy when rebuilding from advanced codes', () => {
      const rights = buildRightsFromPermissions(['w'])
      expect(rights.userCanViewFolder).toBe(1)
      expect(rights.userCanReadMails).toBe(1)
    })

    it('is the inverse of getActiveAdvancedCodes (round-trip)', () => {
      const original = applySimplifiedToggle({}, 'delete', true)
      const permissions = getActiveAdvancedCodes(original)
      const rebuilt = buildRightsFromPermissions(permissions)
      expect(rebuilt).toEqual(original)
    })

    it('ignores unknown IMAP codes', () => {
      const rights = buildRightsFromPermissions(['not-a-real-code'])
      expect(rights).toEqual({})
    })
  })
})
