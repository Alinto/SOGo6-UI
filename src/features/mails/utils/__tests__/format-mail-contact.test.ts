import { formatEmailContact } from '../format-mail-contact'

describe('formatEmailContact', () => {
  it('formats name and email', () => {
    expect(
      formatEmailContact({ name: 'Alice', email: 'alice@example.com' })
    ).toBe('Alice <alice@example.com>')
  })

  it('returns email only when name is empty', () => {
    expect(formatEmailContact({ name: '', email: 'bob@example.com' })).toBe(
      'bob@example.com'
    )
  })
})
