import {
  getPostRemovalTarget,
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

describe('getPostRemovalTarget', () => {
  const navigation = {
    folderKey: '0/INBOX',
    orderedIds: ['A', 'B', 'C'],
    page: 1,
    totalPages: 1,
  }

  it('returns next when mail is in the middle', () => {
    expect(
      getPostRemovalTarget({
        mailId: 'B',
        navigation,
        currentFolderKey: '0/INBOX',
      })
    ).toEqual({ target: 'next', id: 'C' })
  })

  it('returns prev when mail is last', () => {
    expect(
      getPostRemovalTarget({
        mailId: 'C',
        navigation,
        currentFolderKey: '0/INBOX',
      })
    ).toEqual({ target: 'prev', id: 'B' })
  })

  it('returns list when navigation is missing', () => {
    expect(
      getPostRemovalTarget({
        mailId: 'B',
        currentFolderKey: '0/INBOX',
      })
    ).toEqual({ target: 'list' })
  })

  it('returns list when folderKey mismatches', () => {
    expect(
      getPostRemovalTarget({
        mailId: 'B',
        navigation: { ...navigation, folderKey: '0/Sent' },
        currentFolderKey: '0/INBOX',
      })
    ).toEqual({ target: 'list' })
  })

  it('returns list when mail is not in orderedIds', () => {
    expect(
      getPostRemovalTarget({
        mailId: 'Z',
        navigation,
        currentFolderKey: '0/INBOX',
      })
    ).toEqual({ target: 'list' })
  })
})
