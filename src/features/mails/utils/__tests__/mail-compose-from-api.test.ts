import {
  MAIL_PRIORITY_HIGH,
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_LOW,
  MAIL_PRIORITY_LOWEST,
  MAIL_PRIORITY_NORMAL,
} from '@/features/mails/store/mail-compose-slice'
import {
  apiDataToMailComposeDraft,
  buildForwardedBody,
  buildQuotedReplyBody,
  type ApiMailData,
} from '@/features/mails/utils/mail-compose-from-api'

describe('apiDataToMailComposeDraft', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(123456789)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('maps a minimal payload to a draft with sensible defaults', () => {
    const draft = apiDataToMailComposeDraft('draft-1', {})

    expect(draft).toEqual({
      draftId: 'draft-1',
      mailKey: null,
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      attachments: [],
      priority: MAIL_PRIORITY_NORMAL,
      requestReadReceipt: false,
      isDirty: false,
      createdAt: 123456789,
      updatedAt: 123456789,
      selectedSignatureKey: null,
    })
  })

  it('uses the provided key as mailKey', () => {
    const draft = apiDataToMailComposeDraft('draft-1', { key: 'mail-42' })

    expect(draft.mailKey).toBe('mail-42')
  })

  it('falls back to the provided subject', () => {
    const draft = apiDataToMailComposeDraft('draft-1', { subject: 'Hello' })

    expect(draft.subject).toBe('Hello')
  })

  describe('recipients', () => {
    it('filters out recipients with an empty email and keeps the name when present', () => {
      const data: ApiMailData = {
        to: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: '', email: '   ' },
        ],
        cc: [{ name: 'Bob', email: 'bob@example.com' }],
        bcc: [{ name: '', email: '' }],
      }

      const draft = apiDataToMailComposeDraft('draft-1', data)

      expect(draft.to).toEqual([{ email: 'alice@example.com', name: 'Alice' }])
      expect(draft.cc).toEqual([{ email: 'bob@example.com', name: 'Bob' }])
      expect(draft.bcc).toEqual([])
    })

    it('omits the name field for recipients without a name', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        to: [{ name: '', email: 'noname@example.com' }],
      })

      expect(draft.to).toEqual([{ email: 'noname@example.com' }])
      expect(draft.to[0]).not.toHaveProperty('name')
    })

    it('returns an empty array when recipients are not provided', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {})

      expect(draft.to).toEqual([])
      expect(draft.cc).toEqual([])
      expect(draft.bcc).toEqual([])
    })
  })

  describe('body extraction', () => {
    it('uses data.body when present', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        body: '<p>Direct body</p>',
        contents: [
          { content: '<p>HTML</p>', contentType: 'text/html', shouldDisplayAttachment: false },
        ],
      })

      expect(draft.body).toBe('<p>Direct body</p>')
    })

    it('falls back to the html content when body is missing', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        contents: [
          { content: 'Plain text', contentType: 'text/plain', shouldDisplayAttachment: false },
          { content: '<p>HTML content</p>', contentType: 'text/html', shouldDisplayAttachment: false },
        ],
      })

      expect(draft.body).toBe('<p>HTML content</p>')
    })

    it('falls back to the plain text content when no html content is present', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        contents: [
          { content: 'Plain text only', contentType: 'text/plain', shouldDisplayAttachment: false },
        ],
      })

      expect(draft.body).toBe('Plain text only')
    })

    it('returns an empty string when neither body nor contents are provided', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {})

      expect(draft.body).toBe('')
    })

    it('returns an empty string when contents is empty', () => {
      const draft = apiDataToMailComposeDraft('draft-1', { contents: [] })

      expect(draft.body).toBe('')
    })

    it('returns an empty string when contents has neither html nor plain text', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        contents: [
          { content: 'invite', contentType: 'text/calendar', shouldDisplayAttachment: false },
        ],
      })

      expect(draft.body).toBe('')
    })
  })

  describe('attachments', () => {
    it('returns an empty array when attachments are not provided', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {})

      expect(draft.attachments).toEqual([])
    })

    it('maps a flat array of attachments', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        attachments: [
          {
            filename: 'report.pdf',
            contentType: 'application/pdf',
            size: 1024,
            downloadUri: '/download/report.pdf',
            displayUri: '/display/report.pdf',
            extension: 'pdf',
          },
        ],
      })

      expect(draft.attachments).toEqual([
        {
          draftId: 'draft-1',
          name: 'report.pdf',
          size: 1024,
          type: 'application/pdf',
          uploadStatus: 'completed',
          uploadProgress: 100,
        },
      ])
    })

    it('falls back to defaults for missing attachment fields in the flat array form', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        attachments: [
          {
            filename: '',
            contentType: '',
            size: 0,
            downloadUri: '',
            displayUri: '',
            extension: '',
          },
        ],
      })

      expect(draft.attachments).toEqual([
        {
          draftId: 'draft-1',
          name: 'unnamed',
          size: 0,
          type: 'application/octet-stream',
          uploadStatus: 'completed',
          uploadProgress: 100,
        },
      ])
    })

    it('maps attachment parts from the ImapAttachments shape', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        attachments: {
          count: 1,
          parts: [
            {
              partId: '2',
              name: 'image.png',
              contentType: 'image/png',
              size: 2048,
              downloadUri: '/download/image.png',
              displayUri: '/display/image.png',
            },
          ],
        },
      })

      expect(draft.attachments).toEqual([
        {
          draftId: 'draft-1',
          name: 'image.png',
          size: 2048,
          type: 'image/png',
          uploadStatus: 'completed',
          uploadProgress: 100,
        },
      ])
    })

    it('returns an empty array when ImapAttachments has no parts', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        attachments: { count: 0 },
      })

      expect(draft.attachments).toEqual([])
    })

    it('falls back to defaults for missing attachment fields in the parts form', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        attachments: {
          count: 1,
          parts: [
            {
              partId: '1',
              name: '',
              contentType: '',
              size: 0,
              downloadUri: '',
              displayUri: '',
            },
          ],
        },
      })

      expect(draft.attachments).toEqual([
        {
          draftId: 'draft-1',
          name: 'unnamed',
          size: 0,
          type: 'application/octet-stream',
          uploadStatus: 'completed',
          uploadProgress: 100,
        },
      ])
    })
  })

  describe('priority', () => {
    it.each([
      [0, MAIL_PRIORITY_LOWEST],
      [1, MAIL_PRIORITY_LOW],
      [2, MAIL_PRIORITY_NORMAL],
      [3, MAIL_PRIORITY_HIGH],
      [4, MAIL_PRIORITY_HIGHEST],
    ])('coerces api priority %i to %i', (apiPriority, expected) => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        priority: apiPriority,
      })

      expect(draft.priority).toBe(expected)
    })

    it('defaults to normal priority when not provided', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {})

      expect(draft.priority).toBe(MAIL_PRIORITY_NORMAL)
    })

    it('defaults to normal priority for unknown values', () => {
      const draft = apiDataToMailComposeDraft('draft-1', { priority: 99 })

      expect(draft.priority).toBe(MAIL_PRIORITY_NORMAL)
    })
  })

  describe('read receipt', () => {
    it('maps should_ask_receipt to requestReadReceipt', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {
        should_ask_receipt: true,
      })

      expect(draft.requestReadReceipt).toBe(true)
    })

    it('defaults requestReadReceipt to false when not provided', () => {
      const draft = apiDataToMailComposeDraft('draft-1', {})

      expect(draft.requestReadReceipt).toBe(false)
    })
  })

  it('uses Date.now for createdAt and updatedAt', () => {
    const draft = apiDataToMailComposeDraft('draft-1', {})

    expect(draft.createdAt).toBe(123456789)
    expect(draft.updatedAt).toBe(123456789)
  })
})

describe('buildForwardedBody', () => {
  const mail = {
    from: { name: 'John Doe', email: 'john@example.com' },
    to: [
      { name: 'Jane Doe', email: 'jane@example.com' },
      { name: '', email: 'noname@example.com' },
    ],
    date: new Date('2024-01-15T10:00:00Z').getTime(),
    subject: 'Original subject',
  }

  it('prepends a forwarded message header to the body', () => {
    const result = buildForwardedBody(mail, '<p>Original body</p>')

    expect(result).toContain('---------- Forwarded message ---------')
    expect(result).toContain('From: John Doe &lt;john@example.com&gt;')
    expect(result).toContain('Subject: Original subject')
    expect(result).toContain(
      'To: Jane Doe &lt;jane@example.com&gt;, noname@example.com'
    )
    expect(result.endsWith('<p>Original body</p>')).toBe(true)
  })

  it('escapes html special characters in subject and contact names', () => {
    const result = buildForwardedBody(
      {
        from: { name: '<script>alert(1)</script>', email: 'evil@example.com' },
        to: [],
        date: mail.date,
        subject: '<b>Hi</b> & "quotes"',
      },
      ''
    )

    expect(result).toContain(
      'From: &lt;script&gt;alert(1)&lt;/script&gt; &lt;evil@example.com&gt;'
    )
    expect(result).toContain('Subject: &lt;b&gt;Hi&lt;/b&gt; &amp; &quot;quotes&quot;')
  })

  it('returns an empty To line when there are no recipients', () => {
    const result = buildForwardedBody({ ...mail, to: [] }, '')

    expect(result).toContain('<div>To: </div>')
  })
})

describe('buildQuotedReplyBody', () => {
  const mail = {
    from: { name: 'Judith de Rebelles', email: 'rebelles@substack.com' },
    date: new Date('2026-06-10T08:56:00Z').getTime(),
  }

  it('prepends an "On <date>, <sender> wrote:" header to the body', () => {
    const result = buildQuotedReplyBody(mail, '<p>Original body</p>')

    expect(result).toMatch(
      /^<div>On .+, Judith de Rebelles &lt;rebelles@substack.com&gt; wrote:<\/div>/
    )
  })

  it('wraps the original body in an indented blockquote', () => {
    const result = buildQuotedReplyBody(mail, '<p>Original body</p>')

    expect(result).toContain(
      '<blockquote style="margin:0 0 0 .8ex;border-left:1px solid #ccc;padding-left:1ex;"><p>Original body</p></blockquote>'
    )
  })

  it('escapes html special characters in the sender name', () => {
    const result = buildQuotedReplyBody(
      { from: { name: '<script>alert(1)</script>', email: 'evil@example.com' }, date: mail.date },
      ''
    )

    expect(result).toContain(
      '&lt;script&gt;alert(1)&lt;/script&gt; &lt;evil@example.com&gt;'
    )
  })
})
