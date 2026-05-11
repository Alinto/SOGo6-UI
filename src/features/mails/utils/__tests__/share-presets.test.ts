import '@testing-library/jest-dom'
import { detectPreset, SHARE_PRESETS } from '../share-presets'
import type { FolderShareRights, ShareRightPreset } from '../../mails-types'

describe('share-presets', () => {
  describe('SHARE_PRESETS', () => {
    const presets: ShareRightPreset[] = ['none', 'read', 'write', 'admin']

    it('should define all ShareRightPreset keys', () => {
      presets.forEach((key) => {
        expect(SHARE_PRESETS[key]).toBeDefined()
      })
    })

    describe('none', () => {
      it('should zero out all rights flags', () => {
        const r = SHARE_PRESETS.none
        expect(r.userCanViewFolder).toBe(0)
        expect(r.userCanReadMails).toBe(0)
        expect(r.userCanWriteMails).toBe(0)
        expect(r.userIsAdministrator).toBe(0)
      })
    })

    describe('read', () => {
      it('should enable view and read only', () => {
        const r = SHARE_PRESETS.read
        expect(r.userCanViewFolder).toBe(1)
        expect(r.userCanReadMails).toBe(1)
        expect(r.userCanWriteMails).toBeUndefined()
      })
    })

    describe('write', () => {
      it('should enable read and write-related flags', () => {
        const r = SHARE_PRESETS.write
        expect(r.userCanReadMails).toBe(1)
        expect(r.userCanWriteMails).toBe(1)
        expect(r.userCanInsertMails).toBe(1)
        expect(r.userCanPostMails).toBe(1)
      })
    })

    describe('admin', () => {
      it('should enable administrator and destructive rights', () => {
        const r = SHARE_PRESETS.admin
        expect(r.userIsAdministrator).toBe(1)
        expect(r.userCanCreateSubfolders).toBe(1)
        expect(r.userCanRemoveFolder).toBe(1)
        expect(r.userCanExpungeFolder).toBe(1)
      })
    })
  })

  describe('detectPreset', () => {
    it('should return admin when userIsAdministrator is 1', () => {
      const rights: FolderShareRights = {
        userIsAdministrator: 1,
        userCanWriteMails: 1,
        userCanReadMails: 1,
      }
      expect(detectPreset(rights)).toBe('admin')
    })

    it('should return write when userCanWriteMails is 1 and not admin', () => {
      const rights: FolderShareRights = {
        userCanWriteMails: 1,
        userCanReadMails: 1,
      }
      expect(detectPreset(rights)).toBe('write')
    })

    it('should return read when only userCanReadMails is 1', () => {
      const rights: FolderShareRights = {
        userCanReadMails: 1,
        userCanViewFolder: 1,
      }
      expect(detectPreset(rights)).toBe('read')
    })

    it('should return none when no meaningful rights', () => {
      expect(detectPreset({})).toBe('none')
      expect(
        detectPreset({
          userCanReadMails: 0,
          userCanWriteMails: 0,
        })
      ).toBe('none')
    })

    it('should prefer admin over write when both would apply', () => {
      const rights: FolderShareRights = {
        userIsAdministrator: 1,
        userCanWriteMails: 1,
      }
      expect(detectPreset(rights)).toBe('admin')
    })
  })
})
