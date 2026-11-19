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

describe('sanitizeEmailHtml security', () => {
  it.each([
    ['slash-separated handler', '<img/src=x/onerror=alert(1)>'],
    ['unquoted handler', '<img src=x onerror=alert(1)>'],
    ['svg onload', '<svg onload=alert(1)><circle r="1"></circle></svg>'],
    ['script tag', '<p>x</p><script>alert(1)</script>'],
    [
      'javascript link with leading space',
      '<a href=" javascript:alert(1)">x</a>',
    ],
    [
      'entity-encoded javascript link',
      '<a href="jav&#x61;script:alert(1)">x</a>',
    ],
    [
      'svg xlink javascript',
      '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',
    ],
    ['iframe srcdoc', '<iframe srcdoc="<script>alert(1)</script>"></iframe>'],
  ])('removes executable code: %s', (_label, input) => {
    const html = sanitizeEmailHtml(input).toLowerCase()
    expect(html).not.toMatch(/\son\w+=/)
    expect(html).not.toContain('<script')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<iframe')
  })

  it('does not run handlers once injected into the page', () => {
    const spy = jest.fn()
    ;(window as unknown as { pwned: () => void }).pwned = spy
    const host = document.createElement('div')
    host.innerHTML = sanitizeEmailHtml(
      '<img/src=x/onerror=pwned()><svg onload=pwned()></svg>'
    )
    host
      .querySelectorAll('img')
      .forEach((img) => img.dispatchEvent(new Event('error')))
    expect(spy).not.toHaveBeenCalled()
  })

  it('removes forms and their controls', () => {
    const html = sanitizeEmailHtml(
      '<form action="https://evil.test"><input name="password"><button>Go</button></form>'
    )
    expect(html).not.toContain('<form')
    expect(html).not.toContain('<input')
    expect(html).not.toContain('evil.test')
  })
})

describe('sanitizeEmailHtml remote content', () => {
  const remote = [
    '<img src=http://track.test/a.gif>',
    '<img src="//track.test/b.gif">',
    '<img srcset="https://track.test/c.png 1x, https://track.test/d.png 2x">',
    '<picture><source srcset="https://track.test/e.webp"><img alt="x"></picture>',
    '<table background="https://track.test/f.png"><tr><td>x</td></tr></table>',
    '<table><tr><td style="background-image:url(https://track.test/g.png)">x</td></tr></table>',
    '<div style="background:url(&quot;https://track.test/h.png&quot;)">x</div>',
    '<div style="background:u\\72l(https://track.test/i.png)">x</div>',
    '<div style="background:image-set(\'https://track.test/j.png\' 1x)">x</div>',
    '<style>@import url(https://track.test/k.css); .a{background:url(https://track.test/l.png)}</style><p class="a">x</p>',
    '<style>@font-face{font-family:x;src:url("https://track.test/m.woff)")}</style>',
    '<video poster="https://track.test/n.png" src="https://track.test/o.mp4"></video>',
    '<svg><image href="https://track.test/p.png"></image></svg>',
    '<link rel="stylesheet" href="https://track.test/q.css">',
  ]

  it.each(remote)('blocks every remote fetch by default: %s', (input) => {
    expect(sanitizeEmailHtml(input)).not.toContain('track.test')
  })

  it('keeps remote content once the user allows it', () => {
    const html = sanitizeEmailHtml(
      '<img src="https://img.test/a.png"><div style="background:url(https://img.test/b.png)">x</div>',
      { allowRemoteContent: true }
    )
    expect(html).toContain('https://img.test/a.png')
    expect(html).toContain('https://img.test/b.png')
  })

  it('keeps local inline images while blocking', () => {
    const html = sanitizeEmailHtml(
      '<img src="cid:logo@x"><img src="blob:http://localhost/abc"><img src="data:image/png;base64,AAAA">'
    )
    expect(html).toContain('src="cid:logo@x"')
    expect(html).toContain('src="blob:http://localhost/abc"')
    expect(html).toContain('src="data:image/png;base64,AAAA"')
  })
})

describe('sanitizeEmailHtml newsletter layout', () => {
  const newsletter = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>.cta{color:#fff;background:#0a6} td.col{width:50%}</style></head>
    <body><table width="600" align="center" cellpadding="0"><tr>
    <td class="col" bgcolor="#eeeeee"><h1 style="font-size:24px;color:#333">News</h1></td>
    <td class="col"><a class="cta" href="https://shop.test/" target="_blank">Shop</a></td>
    </tr></table></body></html>`

  it('keeps head styles, layout attributes and inline styles', () => {
    const html = sanitizeEmailHtml(newsletter)
    expect(html).toContain(
      '<style>.cta{color:#fff;background:#0a6} td.col{width:50%}</style>'
    )
    expect(html).toContain('width="600"')
    expect(html).toContain('bgcolor="#eeeeee"')
    expect(html).toContain('style="font-size:24px;color:#333"')
    expect(html).toContain('>News</h1>')
  })

  it('keeps links opening in a new tab without access to the app', () => {
    const html = sanitizeEmailHtml(newsletter)
    expect(html).toContain('href="https://shop.test/"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})
