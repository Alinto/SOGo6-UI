import { canRenameFolder } from '../can-rename-folder'

describe('canRenameFolder', () => {
  it('returns false for default system folders', () => {
    expect(canRenameFolder({ default: true, type: 'INBOX' })).toBe(false)
    expect(canRenameFolder({ default: true, type: 'DRAFTS' })).toBe(false)
    expect(canRenameFolder({ default: true, type: 'JUNK' })).toBe(false)
  })

  it('returns false for special folder types even when not default', () => {
    expect(canRenameFolder({ default: false, type: 'INBOX' })).toBe(false)
    expect(canRenameFolder({ default: false, type: 'TRASH' })).toBe(false)
  })

  it('returns true for user-created folders', () => {
    expect(canRenameFolder({ default: false })).toBe(true)
    expect(canRenameFolder({ default: false, type: 'NORMAL' })).toBe(true)
  })
})
