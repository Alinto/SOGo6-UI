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
    const encoded = Buffer.from('<p>Encoded body</p>', 'utf-8').toString('base64')
    const result = prepareMailBodyHtml(encoded, { includeExternalImages: false })
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
})
