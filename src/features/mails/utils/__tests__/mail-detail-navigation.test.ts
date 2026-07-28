import {
  isMailDetailPath,
  resolveMailIdFromPath,
} from '../mail-detail-navigation'

describe('isMailDetailPath', () => {
  it('returns false on folder list URLs', () => {
    expect(isMailDetailPath('/en/u/0/INBOX', 'INBOX')).toBe(false)
    expect(isMailDetailPath('/u/0/INBOX', 'INBOX')).toBe(false)
  })

  it('returns true when a mail segment follows the folder', () => {
    expect(isMailDetailPath('/en/u/0/INBOX/inbox_001', 'INBOX')).toBe(true)
    expect(isMailDetailPath('/u/0/INBOX/inbox_001', 'INBOX')).toBe(true)
  })

  it('supports nested folder paths', () => {
    expect(isMailDetailPath('/en/u/0/Archive/Old', 'Archive/Old')).toBe(false)
    expect(isMailDetailPath('/en/u/0/Archive/Old/99', 'Archive/Old')).toBe(true)
  })
})

describe('resolveMailIdFromPath', () => {
  it('returns null on folder list URLs', () => {
    expect(resolveMailIdFromPath('/en/u/0/INBOX', 'INBOX')).toBeNull()
  })

  it('returns the mail id when present', () => {
    expect(resolveMailIdFromPath('/en/u/0/INBOX/inbox_001', 'INBOX')).toBe(
      'inbox_001'
    )
  })
})
