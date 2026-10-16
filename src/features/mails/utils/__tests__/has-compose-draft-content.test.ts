import {
  hasBodyContent,
  hasComposeDraftContent,
} from '../has-compose-draft-content'

describe('hasBodyContent', () => {
  it('is false for an empty editor body', () => {
    expect(hasBodyContent(undefined)).toBe(false)
    expect(hasBodyContent('')).toBe(false)
    expect(hasBodyContent('<p>&nbsp;</p>')).toBe(false)
  })

  it('ignores the signature widget and plain-text signature lines', () => {
    expect(
      hasBodyContent(
        '<p>&nbsp;</p><section class="signature-widget"><p>-- John</p></section>'
      )
    ).toBe(false)
    expect(hasBodyContent('<p data-signature-marker="true">-- John</p>')).toBe(
      false
    )
  })

  it('is true for typed text or media', () => {
    expect(hasBodyContent('<p>Hello</p>')).toBe(true)
    expect(hasBodyContent('<p><img src="x.png"></p>')).toBe(true)
  })
})

describe('hasComposeDraftContent', () => {
  it('is false for a blank draft', () => {
    expect(
      hasComposeDraftContent({
        subject: '  ',
        body: '',
        toRecipients: [],
        ccRecipients: [],
        bccRecipients: [],
        attachments: [],
      })
    ).toBe(false)
  })

  it.each([
    { subject: 'Hi' },
    { toRecipients: [{ email: 'a@example.com' }] },
    { ccRecipients: [{ email: 'a@example.com' }] },
    { bccRecipients: [{ email: 'a@example.com' }] },
    { attachments: [{ name: 'file.pdf' }] },
    { body: '<p>Hello</p>' },
  ])('is true when the draft has %o', (field) => {
    expect(hasComposeDraftContent(field)).toBe(true)
  })
})
