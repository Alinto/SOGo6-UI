import { isContactDragData, isFolderDragData, isMailDragData } from '../types'

describe('drag data type guards', () => {
  it('recognizes mail drag data', () => {
    expect(
      isMailDragData({
        type: 'mail',
        mailId: '1',
        accountId: '0',
        folder: 'INBOX',
        subject: 'Hi',
        from: 'A',
        count: 1,
      })
    ).toBe(true)
    expect(isMailDragData({ type: 'folder', folderPath: 'INBOX' })).toBe(false)
    expect(isMailDragData(null)).toBe(false)
  })

  it('recognizes folder drag data', () => {
    expect(isFolderDragData({ type: 'folder', folderPath: 'Archive' })).toBe(
      true
    )
    expect(isFolderDragData({ type: 'mail', mailId: '1' })).toBe(false)
  })

  it('recognizes contact drag data', () => {
    expect(isContactDragData({ type: 'contact', contactId: 'c1' })).toBe(true)
    expect(isContactDragData({ type: 'book', bookId: 'b1' })).toBe(false)
  })
})
