import { parseMailto } from '../parse-mailto'

describe('parseMailto', () => {
  it('parses address, subject and body', () => {
    expect(
      parseMailto('mailto:ada@example.org?subject=Hello%20there&body=Hi%20Ada')
    ).toEqual({
      to: [{ email: 'ada@example.org' }],
      subject: 'Hello there',
      body: 'Hi Ada',
    })
  })

  it('accepts a raw address without the scheme', () => {
    expect(parseMailto('bob@example.org')).toEqual({
      to: [{ email: 'bob@example.org' }],
      subject: '',
      body: '',
    })
  })

  it('keeps + literal (RFC 6068)', () => {
    expect(parseMailto('mailto:a+tag@example.org?subject=1+1%3D2')).toEqual({
      to: [{ email: 'a+tag@example.org' }],
      subject: '1+1=2',
      body: '',
    })
  })

  it('decodes once only', () => {
    expect(parseMailto('mailto:a@example.org?body=100%2525').body).toBe(
      '100%25'
    )
  })

  it('splits on the first ? only', () => {
    expect(
      parseMailto('mailto:a@example.org?subject=Why?&body=x').subject
    ).toBe('Why?')
  })

  it('normalizes CRLF and merges a to= header field', () => {
    expect(
      parseMailto('mailto:a@example.org?To=b@example.org&body=l1%0D%0Al2')
    ).toEqual({
      to: [{ email: 'a@example.org' }, { email: 'b@example.org' }],
      subject: '',
      body: 'l1\nl2',
    })
  })

  it('keeps malformed escapes as-is', () => {
    expect(parseMailto('mailto:a@example.org?subject=50%').subject).toBe('50%')
  })
})
