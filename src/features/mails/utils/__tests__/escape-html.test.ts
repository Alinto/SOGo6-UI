import { escapeHtml } from '../escape-html'

describe('escapeHtml', () => {
  describe('basic rendering', () => {
    it('returns plain text unchanged when no special characters', () => {
      expect(escapeHtml('Hello world')).toBe('Hello world')
    })
  })

  describe('configuration', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('escapes angle brackets', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      )
    })

    it('escapes double quotes', () => {
      expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
    })

    it('escapes single quotes', () => {
      expect(escapeHtml("it's fine")).toBe('it&#39;s fine')
    })

    it('escapes all special characters in one string', () => {
      expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;')
    })
  })
})
