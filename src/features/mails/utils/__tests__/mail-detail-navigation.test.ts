import { getPostRemovalTarget } from '../mail-detail-navigation'

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
