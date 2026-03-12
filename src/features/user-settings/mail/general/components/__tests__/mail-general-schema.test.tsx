import { schema } from '../mail-general-schema'

// ── Helpers ───────────────────────────────────────────────────────────────────

function validPayload(overrides = {}) {
  return {
    collectUnknownAddresses: false,
    collectUnknownAddressbookName: '',
    mailAllowReceipt: false,
    mailfolderSubscribe: false,
    autoMarkAsReadDelay: 0,
    composeMailWindow: 'popup',
    attachmentPosition: 'above',
    countAllUnseen: false,
    sortByThreads: false,
    hideInlineAttachments: false,
    forwardMessages: 'inline',
    startReply: 'above',
    placeSignature: 'above',
    signOnNew: false,
    signOnReply: false,
    signOnForward: false,
    composeIn: 'html',
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('mail-general-schema', () => {
  // ── schema shape ──────────────────────────────────────────────────────────

  describe('schema shape', () => {
    it('exports a schema with parse and safeParse methods', () => {
      expect(typeof schema.parse).toBe('function')
      expect(typeof schema.safeParse).toBe('function')
    })

    it('accepts a fully valid payload', () => {
      expect(schema.safeParse(validPayload()).success).toBe(true)
    })

    it('strips unknown fields', () => {
      const result = schema.safeParse(validPayload({ unknownField: 'value' }))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('unknownField')
      }
    })

    it('returns data unchanged for a valid payload', () => {
      const payload = validPayload()
      const result = schema.safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(payload)
      }
    })
  })

  // ── boolean fields ────────────────────────────────────────────────────────

  describe.each([
    'collectUnknownAddresses',
    'mailAllowReceipt',
    'mailfolderSubscribe',
    'countAllUnseen',
    'sortByThreads',
    'hideInlineAttachments',
    'signOnNew',
    'signOnReply',
    'signOnForward',
  ])('boolean field: %s', (field) => {
    it('accepts true', () => {
      expect(schema.safeParse(validPayload({ [field]: true })).success).toBe(
        true
      )
    })

    it('accepts false', () => {
      expect(schema.safeParse(validPayload({ [field]: false })).success).toBe(
        true
      )
    })

    it('rejects a string', () => {
      expect(schema.safeParse(validPayload({ [field]: 'yes' })).success).toBe(
        false
      )
    })

    it('rejects a number', () => {
      expect(schema.safeParse(validPayload({ [field]: 1 })).success).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any)[field]
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── collectUnknownAddressbookName ─────────────────────────────────────────

  describe('collectUnknownAddressbookName', () => {
    it('accepts a non-empty string', () => {
      expect(
        schema.safeParse(
          validPayload({ collectUnknownAddressbookName: 'My Book' })
        ).success
      ).toBe(true)
    })

    it('accepts an empty string', () => {
      expect(
        schema.safeParse(validPayload({ collectUnknownAddressbookName: '' }))
          .success
      ).toBe(true)
    })

    it('rejects a number', () => {
      expect(
        schema.safeParse(validPayload({ collectUnknownAddressbookName: 42 }))
          .success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).collectUnknownAddressbookName
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── autoMarkAsReadDelay ───────────────────────────────────────────────────

  describe('autoMarkAsReadDelay', () => {
    it('accepts 0', () => {
      expect(
        schema.safeParse(validPayload({ autoMarkAsReadDelay: 0 })).success
      ).toBe(true)
    })

    it('accepts a positive integer', () => {
      expect(
        schema.safeParse(validPayload({ autoMarkAsReadDelay: 30 })).success
      ).toBe(true)
    })

    it('accepts a positive float', () => {
      expect(
        schema.safeParse(validPayload({ autoMarkAsReadDelay: 1.5 })).success
      ).toBe(true)
    })

    it('rejects a negative number', () => {
      expect(
        schema.safeParse(validPayload({ autoMarkAsReadDelay: -1 })).success
      ).toBe(false)
    })

    it('rejects a string', () => {
      expect(
        schema.safeParse(validPayload({ autoMarkAsReadDelay: '5' })).success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).autoMarkAsReadDelay
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── composeMailWindow ─────────────────────────────────────────────────────

  describe('composeMailWindow', () => {
    it('accepts "inline"', () => {
      expect(
        schema.safeParse(validPayload({ composeMailWindow: 'inline' })).success
      ).toBe(true)
    })

    it('accepts "popup"', () => {
      expect(
        schema.safeParse(validPayload({ composeMailWindow: 'popup' })).success
      ).toBe(true)
    })

    it('rejects an unlisted value', () => {
      expect(
        schema.safeParse(validPayload({ composeMailWindow: 'fullscreen' }))
          .success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).composeMailWindow
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── attachmentPosition ────────────────────────────────────────────────────

  describe('attachmentPosition', () => {
    it('accepts "above"', () => {
      expect(
        schema.safeParse(validPayload({ attachmentPosition: 'above' })).success
      ).toBe(true)
    })

    it('accepts "below"', () => {
      expect(
        schema.safeParse(validPayload({ attachmentPosition: 'below' })).success
      ).toBe(true)
    })

    it('rejects an unlisted value', () => {
      expect(
        schema.safeParse(validPayload({ attachmentPosition: 'middle' })).success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).attachmentPosition
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── forwardMessages ───────────────────────────────────────────────────────

  describe('forwardMessages', () => {
    it('accepts "inline"', () => {
      expect(
        schema.safeParse(validPayload({ forwardMessages: 'inline' })).success
      ).toBe(true)
    })

    it('accepts "attachment"', () => {
      expect(
        schema.safeParse(validPayload({ forwardMessages: 'attachment' }))
          .success
      ).toBe(true)
    })

    it('rejects "asAttachments" (not in enum)', () => {
      expect(
        schema.safeParse(validPayload({ forwardMessages: 'asAttachments' }))
          .success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).forwardMessages
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── startReply ────────────────────────────────────────────────────────────

  describe('startReply', () => {
    it('accepts "above"', () => {
      expect(
        schema.safeParse(validPayload({ startReply: 'above' })).success
      ).toBe(true)
    })

    it('accepts "below"', () => {
      expect(
        schema.safeParse(validPayload({ startReply: 'below' })).success
      ).toBe(true)
    })

    it('rejects an unlisted value', () => {
      expect(
        schema.safeParse(validPayload({ startReply: 'inline' })).success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).startReply
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── placeSignature ────────────────────────────────────────────────────────

  describe('placeSignature', () => {
    it('accepts "above"', () => {
      expect(
        schema.safeParse(validPayload({ placeSignature: 'above' })).success
      ).toBe(true)
    })

    it('accepts "below"', () => {
      expect(
        schema.safeParse(validPayload({ placeSignature: 'below' })).success
      ).toBe(true)
    })

    it('rejects an unlisted value', () => {
      expect(
        schema.safeParse(validPayload({ placeSignature: 'middle' })).success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).placeSignature
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── composeIn ─────────────────────────────────────────────────────────────

  describe('composeIn', () => {
    it('accepts "html"', () => {
      expect(
        schema.safeParse(validPayload({ composeIn: 'html' })).success
      ).toBe(true)
    })

    it('accepts "text"', () => {
      expect(
        schema.safeParse(validPayload({ composeIn: 'text' })).success
      ).toBe(true)
    })

    it('rejects "markdown"', () => {
      expect(
        schema.safeParse(validPayload({ composeIn: 'markdown' })).success
      ).toBe(false)
    })

    it('rejects when missing', () => {
      const payload = validPayload()
      delete (payload as any).composeIn
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })

  // ── missing required fields ───────────────────────────────────────────────

  describe('missing required fields', () => {
    const requiredFields = [
      'collectUnknownAddresses',
      'collectUnknownAddressbookName',
      'mailAllowReceipt',
      'mailfolderSubscribe',
      'autoMarkAsReadDelay',
      'composeMailWindow',
      'attachmentPosition',
      'countAllUnseen',
      'sortByThreads',
      'hideInlineAttachments',
      'forwardMessages',
      'startReply',
      'placeSignature',
      'signOnNew',
      'signOnReply',
      'signOnForward',
      'composeIn',
    ]

    it.each(requiredFields)('rejects when "%s" is missing', (field) => {
      const payload = validPayload()
      delete (payload as any)[field]
      expect(schema.safeParse(payload).success).toBe(false)
    })
  })
})
