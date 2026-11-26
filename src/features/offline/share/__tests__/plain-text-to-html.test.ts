import { plainTextToHtml } from '../plain-text-to-html'

describe('plainTextToHtml', () => {
  it('escapes markup', () => {
    expect(plainTextToHtml('<img src=x onerror=alert(1)> & "q"')).toBe(
      '<p>&lt;img src=x onerror=alert(1)&gt; &amp; &quot;q&quot;</p>'
    )
  })

  it('turns line breaks into <br> and blank lines into paragraphs', () => {
    expect(plainTextToHtml('a\r\nb\n\nc')).toBe('<p>a<br>b</p><p>c</p>')
  })

  it('returns an empty body for blank text', () => {
    expect(plainTextToHtml('  \n ')).toBe('')
  })
})
