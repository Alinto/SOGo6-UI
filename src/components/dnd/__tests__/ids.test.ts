import { dndId, parseDndId } from '../ids'

describe('dndId', () => {
  it('namespaces mail, folder, contact and book ids', () => {
    expect(dndId.mail('42')).toBe('mail:42')
    expect(dndId.folder('INBOX/Work')).toBe('folder:INBOX/Work')
    expect(dndId.contact('c1')).toBe('contact:c1')
    expect(dndId.book('b1')).toBe('book:b1')
  })
})

describe('parseDndId', () => {
  it('parses namespaced ids including values that contain colons', () => {
    expect(parseDndId('mail:42')).toEqual({ type: 'mail', value: '42' })
    expect(parseDndId('folder:Archive/Projects')).toEqual({
      type: 'folder',
      value: 'Archive/Projects',
    })
    expect(parseDndId('folder:foo:bar')).toEqual({
      type: 'folder',
      value: 'foo:bar',
    })
  })

  it('returns null for unknown prefixes, empty values, or missing separator', () => {
    expect(parseDndId('42')).toBeNull()
    expect(parseDndId('mail:')).toBeNull()
    expect(parseDndId(':INBOX')).toBeNull()
    expect(parseDndId('unknown:x')).toBeNull()
  })
})
