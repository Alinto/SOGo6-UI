import { prepareMailBodyHtml } from '../prepare-mail-body-html'

describe('prepareMailBodyHtml', () => {
  it('sanitizes script tags from raw html', () => {
    const result = prepareMailBodyHtml(
      '<p>Hello</p><script>alert(1)</script>',
      { includeExternalImages: false }
    )
    expect(result).toContain('Hello')
    expect(result).not.toContain('<script>')
  })

  it('decodes base64 bodies', () => {
    const encoded = Buffer.from('<p>Encoded body</p>', 'utf-8').toString(
      'base64'
    )
    const result = prepareMailBodyHtml(encoded, {
      includeExternalImages: false,
    })
    expect(result).toContain('Encoded body')
  })

  it('blocks external images when disabled', () => {
    const result = prepareMailBodyHtml(
      '<img src="https://example.com/a.png" alt="x">',
      { includeExternalImages: false }
    )
    expect(result).not.toContain('https://example.com/a.png')
  })

  it('keeps external images when enabled', () => {
    const result = prepareMailBodyHtml(
      '<img data-src="https://example.com/a.png" alt="x">',
      { includeExternalImages: true }
    )
    expect(result).toContain('https://example.com/a.png')
  })

  it('rewrites cid images only when a display url was fetched', () => {
    const untouched = prepareMailBodyHtml('<img src="cid:logo.png" alt="">', {
      includeExternalImages: false,
      inlineImages: {
        parts: [{ name: 'logo.png', contentId: 'logo.png' }],
      },
    })
    expect(untouched).toContain('cid:logo.png')

    const result = prepareMailBodyHtml('<img src="cid:logo.png" alt="">', {
      includeExternalImages: false,
      inlineImages: {
        parts: [
          {
            name: 'logo.png',
            contentId: 'logo.png',
            displayUrl: 'blob:logo',
          },
        ],
      },
    })
    expect(result).toContain('blob:logo')
    expect(result).not.toContain('cid:')
  })

  it('rewrites a content-id that carries a domain', () => {
    const result = prepareMailBodyHtml('<img src="cid:show.png" alt="">', {
      includeExternalImages: false,
      inlineImages: {
        parts: [
          {
            name: 'show.png',
            contentId: 'show.png@cleanmail.eu',
            displayUrl: 'blob:show',
          },
        ],
      },
    })
    expect(result).toContain('blob:show')
    expect(result).not.toContain('cid:')
  })
})
