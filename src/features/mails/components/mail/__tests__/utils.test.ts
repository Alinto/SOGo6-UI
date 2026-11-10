import {
  blockExternalImages,
  containsExternalImages,
  decodeBase64,
  formatMailTime,
  getAttachmentType,
  getFileExtension,
  isBase64,
  parseEmailContact,
  replaceDataSrcWithSrc,
  sanitizeEmailHtml,
  splitFileNameTail,
  truncateFileNameMiddle,
} from '../utils'

// parseEmailContact
describe('parseEmailContact', () => {
  it('parses name and email', () => {
    expect(parseEmailContact('John Doe <john@doe.com>')).toEqual({
      name: 'John Doe',
      email: 'john@doe.com',
    })
  })
  it('parses only email', () => {
    expect(parseEmailContact('john@doe.com')).toEqual({
      email: 'john@doe.com',
      name: '',
    })
  })
  it('trims spaces', () => {
    expect(parseEmailContact('  John   <john@doe.com>   ')).toEqual({
      name: 'John',
      email: 'john@doe.com',
    })
  })
})

// formatMailTime
describe('formatMailTime', () => {
  it('formats a timestamp to fr-FR', () => {
    // 1 Jan 2022, 15:05
    const ts = new Date('2022-01-01T15:05:00+01:00').getTime()
    expect(formatMailTime(ts)).toMatch(/1 janvier.*15:05/)
  })
})

// getFileExtension
describe('getFileExtension', () => {
  it('returns extension', () => {
    expect(getFileExtension('report.pdf')).toBe('pdf')
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
  })
  it('returns empty string if no extension', () => {
    expect(getFileExtension('README')).toBe('')
  })
  it('ignores suffixes without letters (dates, versions)', () => {
    expect(getFileExtension('Facture 12.2024')).toBe('')
    expect(getFileExtension('rapport v2.1')).toBe('')
    expect(getFileExtension('archive.7z')).toBe('7z')
  })
  it('ignores suffixes longer than 10 characters', () => {
    expect(getFileExtension('export.backupfile2024')).toBe('')
    expect(getFileExtension('notebook.ipynb')).toBe('ipynb')
  })
})

// getAttachmentType
describe('getAttachmentType', () => {
  it('uses the file extension in upper case', () => {
    expect(getAttachmentType('report.pdf', 'application/pdf')).toBe('PDF')
    expect(getAttachmentType('notes.txt')).toBe('TXT')
  })
  it('falls back to a short MIME subtype', () => {
    expect(getAttachmentType('README', 'application/pdf')).toBe('PDF')
    expect(getAttachmentType('image', 'image/png; name=image')).toBe('PNG')
  })
  it('returns empty string when no type can be found', () => {
    expect(getAttachmentType('README')).toBe('')
    expect(getAttachmentType('README', 'application/vnd.ms-excel')).toBe('')
  })
})

// truncateFileNameMiddle
describe('truncateFileNameMiddle', () => {
  it('keeps names up to the limit unchanged', () => {
    expect(truncateFileNameMiddle('report.pdf')).toBe('report.pdf')
    expect(truncateFileNameMiddle('a'.repeat(60))).toBe('a'.repeat(60))
  })
  it('cuts the middle and keeps the start and the extension', () => {
    const result = truncateFileNameMiddle(`start-${'x'.repeat(100)}-end.pdf`)
    expect(result).toHaveLength(60)
    expect(result.startsWith('start-')).toBe(true)
    expect(result.endsWith('-end.pdf')).toBe(true)
    expect(result).toContain('…')
  })
  it('honours a custom max length', () => {
    expect(truncateFileNameMiddle('abcdefghijklmnop.txt', 10)).toBe(
      'abcde….txt'
    )
  })
})

// splitFileNameTail
describe('splitFileNameTail', () => {
  it('keeps the extension with the character before it', () => {
    expect(splitFileNameTail('report.pdf')).toEqual({
      head: 'repor',
      tail: 't.pdf',
    })
  })
  it('returns no tail when there is no extension', () => {
    expect(splitFileNameTail('README')).toEqual({ head: 'README', tail: '' })
  })
  it('handles names that are only an extension', () => {
    expect(splitFileNameTail('.ics')).toEqual({ head: '', tail: '.ics' })
  })
})

// isBase64
describe('isBase64', () => {
  it('returns true for base64 string', () => {
    expect(isBase64('SGVsbG8gd29ybGQhCg==')).toBe(true)
  })
  it('returns false for short or invalid', () => {
    expect(isBase64('abc')).toBe(false)
    expect(isBase64('notbase64$$$')).toBe(false)
  })
})

// decodeBase64
describe('decodeBase64', () => {
  it('decodes base64', () => {
    expect(decodeBase64('SGVsbG8gd29ybGQh')).toBe('Hello world!')
  })
  it('returns input if invalid', () => {
    expect(decodeBase64('!!!')).toBe('!!!')
  })
})

// containsExternalImages
describe('containsExternalImages', () => {
  it('detects external img src', () => {
    expect(containsExternalImages('<img src="https://foo.com/a.png">')).toBe(
      true
    )
  })
  it('detects external data-src', () => {
    expect(
      containsExternalImages('<img data-src="https://bar.com/b.png">')
    ).toBe(true)
  })
  it('returns false if no external images', () => {
    expect(containsExternalImages('<img src="cid:abc">')).toBe(false)
  })
})

// replaceDataSrcWithSrc
describe('replaceDataSrcWithSrc', () => {
  it('replaces data-src with src', () => {
    expect(replaceDataSrcWithSrc('<img data-src="x.png">')).toBe(
      '<img src="x.png">'
    )
    expect(replaceDataSrcWithSrc('<img alt="a" data-src="x.png">')).toBe(
      '<img alt="a" src="x.png">'
    )
  })
  it('ignores img without data-src', () => {
    expect(replaceDataSrcWithSrc('<img src="x.png">')).toBe('<img src="x.png">')
  })
})

// blockExternalImages
describe('blockExternalImages', () => {
  it('blocks external img src', () => {
    expect(blockExternalImages('<img src="https://foo.com/x.png">')).toContain(
      'src="" style="display:none;"'
    )
  })
  it('blocks external data-src', () => {
    expect(
      blockExternalImages('<img data-src="https://foo.com/x.png">')
    ).toContain('src="" style="display:none;"')
  })
  it('does not affect non-external images', () => {
    expect(blockExternalImages('<img src="cid:abc">')).toBe(
      '<img src="cid:abc">'
    )
  })
})

describe('sanitizeEmailHtml', () => {
  it('names an empty link from its href', () => {
    const html = sanitizeEmailHtml(
      '<a href="https://example.com/notes"></a><a href="https://example.com/read">Read</a>'
    )
    expect(html).toContain('aria-label="https://example.com/notes"')
    expect(html).toContain('>Read</a>')
    expect(html).not.toContain('aria-label="https://example.com/read"')
  })

  it('marks a layout table as presentational and keeps a data table', () => {
    const html = sanitizeEmailHtml(
      '<table><tr><td>Logo</td></tr></table><table><caption>Hours</caption><tr><th>Day</th></tr></table><p lang="fr">Bonjour</p>'
    )
    expect(html).toContain('role="presentation"')
    expect(html).toContain('<caption>Hours</caption>')
    expect(html).toContain('lang="fr"')
    const dataTable = html.slice(html.indexOf('<caption>'))
    expect(dataTable).not.toContain('role="presentation"')
  })
})
