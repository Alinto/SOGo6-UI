import { iconSelector, nameSelector } from '../utils'

describe('iconSelector', () => {
  it('returns "inbox" for INBOX path', () => {
    expect(iconSelector('INBOX')).toBe('inbox')
  })

  it('returns "send" for Sent path', () => {
    expect(iconSelector('Sent')).toBe('send')
  })

  it('returns "file-text" for Drafts path', () => {
    expect(iconSelector('Drafts')).toBe('file-text')
  })

  it('returns "trash-2" for Trash path', () => {
    expect(iconSelector('Trash')).toBe('trash-2')
  })

  it('returns "alert-triangle" for Junk path', () => {
    expect(iconSelector('Junk')).toBe('alert-triangle')
  })

  it('returns defaultIcon if provided and path not matched', () => {
    expect(iconSelector('Custom', 'star')).toBe('star')
  })

  it('returns "folder" if no defaultIcon and path not matched', () => {
    expect(iconSelector('Custom')).toBe('folder')
  })
})

describe('nameSelector', () => {
  it('returns "folders.inbox.string" for "inbox" (case insensitive)', () => {
    expect(nameSelector('inbox')).toBe('folders.inbox.string')
    expect(nameSelector('INBOX')).toBe('folders.inbox.string')
    expect(nameSelector('Inbox')).toBe('folders.inbox.string')
  })

  it('returns "folders.sent.string" for "sent"', () => {
    expect(nameSelector('sent')).toBe('folders.sent.string')
    expect(nameSelector('SENT')).toBe('folders.sent.string')
  })

  it('returns "folders.drafts.string" for "drafts"', () => {
    expect(nameSelector('drafts')).toBe('folders.drafts.string')
  })

  it('returns "folders.trash.string" for "trash"', () => {
    expect(nameSelector('trash')).toBe('folders.trash.string')
  })

  it('returns "folders.junk.string" for "junk"', () => {
    expect(nameSelector('junk')).toBe('folders.junk.string')
  })

  it('returns undefined for unmatched names', () => {
    expect(nameSelector('Custom Folder')).toBeUndefined()
    expect(nameSelector('')).toBeUndefined()
  })
})