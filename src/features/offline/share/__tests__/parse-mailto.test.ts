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
})
