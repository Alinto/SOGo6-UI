import {
  blockExternalImages,
  containsExternalImages,
  decodeBase64,
  formatMailTime,
  formatSize,
  getFileExtension,
  isBase64,
  parseEmailContact,
  replaceDataSrcWithSrc,
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

// formatSize
describe('formatSize', () => {
  it('formats bytes', () => {
    expect(formatSize(500)).toBe('500 o')
  })
  it('formats kilobytes', () => {
    expect(formatSize(2048)).toBe('2.0 Ko')
  })
  it('formats megabytes', () => {
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 Mo')
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
