import {
  getFolderIcon,
  getFolderTranslationKey,
  getListDisplayContact,
  isDraftFolderType,
  isSentFolderType,
  isVirtualFolder,
  normalizeFolderType,
  shouldHideUnseenCount,
  shouldShowRecipientInList,
} from '../folder-type-helpers'

describe('folder-type-helpers', () => {
  it('normalizes DRAFTS to DRAFT', () => {
    expect(normalizeFolderType('DRAFTS')).toBe('DRAFT')
  })

  it('maps folder types to icons', () => {
    expect(getFolderIcon('SENT')).toBe('send')
    expect(getFolderIcon('TEMPLATE')).toBe('layers')
    expect(getFolderIcon('NORMAL')).toBe('folder')
  })

  it('maps folder types to translation keys', () => {
    expect(getFolderTranslationKey('INBOX')).toBe('folders.inbox.string')
    expect(getFolderTranslationKey('TEMPLATE')).toBe('folders.template.string')
  })

  it('shows recipient for SENT and DRAFT list rows', () => {
    const mail = {
      from: { name: 'Alice', email: 'alice@example.com' },
      to: [{ name: 'Bob', email: 'bob@example.com' }],
    }

    expect(shouldShowRecipientInList('SENT')).toBe(true)
    expect(shouldShowRecipientInList('DRAFT')).toBe(true)
    expect(getListDisplayContact(mail, 'SENT')).toBe('Bob')
    expect(getListDisplayContact(mail, 'INBOX')).toBe('Alice')
  })

  it('detects draft folder types', () => {
    expect(isDraftFolderType('DRAFT')).toBe(true)
    expect(isDraftFolderType('DRAFTS')).toBe(true)
    expect(isSentFolderType('SENT')).toBe(true)
  })

  it('hides unseen count for sent and draft folders', () => {
    expect(shouldHideUnseenCount('SENT')).toBe(true)
    expect(shouldHideUnseenCount('DRAFTS')).toBe(true)
    expect(shouldHideUnseenCount('INBOX')).toBe(false)
  })

  it('detects virtual folders', () => {
    expect(isVirtualFolder({ selectable: false })).toBe(true)
    expect(isVirtualFolder({ selectable: true })).toBe(false)
  })
})
