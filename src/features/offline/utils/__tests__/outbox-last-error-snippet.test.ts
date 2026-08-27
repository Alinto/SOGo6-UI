import { outboxLastErrorSnippet } from '../outbox-last-error-snippet'

describe('outboxLastErrorSnippet', () => {
  it('returns null for empty errors', () => {
    expect(outboxLastErrorSnippet(null)).toBeNull()
    expect(outboxLastErrorSnippet('  ')).toBeNull()
  })

  it('keeps short errors intact', () => {
    expect(outboxLastErrorSnippet('HTTP 500')).toBe('HTTP 500')
  })

  it('truncates long errors', () => {
    const long = 'x'.repeat(200)
    const snippet = outboxLastErrorSnippet(long)
    expect(snippet).toHaveLength(121)
    expect(snippet?.endsWith('…')).toBe(true)
  })
})
