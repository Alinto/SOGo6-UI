import {
  canRenameFolder,
  FOLDER_RENAME_API_ENABLED,
} from '../can-rename-folder'

const describeWhenRenameApiEnabled = FOLDER_RENAME_API_ENABLED
  ? describe
  : describe.skip

describe('canRenameFolder', () => {
  it('is disabled until backend folder rename API ships', () => {
    expect(FOLDER_RENAME_API_ENABLED).toBe(false)
    expect(canRenameFolder({ default: false, type: 'NORMAL' })).toBe(false)
  })

  describeWhenRenameApiEnabled('when FOLDER_RENAME_API_ENABLED is true', () => {
    it('returns false for default folders', () => {
      expect(canRenameFolder({ default: true, type: 'INBOX' })).toBe(false)
      expect(canRenameFolder({ default: true, type: 'DRAFTS' })).toBe(false)
      expect(canRenameFolder({ default: true, type: 'JUNK' })).toBe(false)
    })

    it('returns false for system folder types', () => {
      expect(canRenameFolder({ default: false, type: 'INBOX' })).toBe(false)
      expect(canRenameFolder({ default: false, type: 'TRASH' })).toBe(false)
    })

    it('returns true for user-created normal folders', () => {
      expect(canRenameFolder({ default: false })).toBe(true)
      expect(canRenameFolder({ default: false, type: 'NORMAL' })).toBe(true)
    })
  })
})
