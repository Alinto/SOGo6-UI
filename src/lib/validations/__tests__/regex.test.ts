// zod-utils.test.ts
import { serverAddress } from '../zod-utils'

// ---------------------------------------------------------------------------
// Mock next-intl useTranslations
// ---------------------------------------------------------------------------
const t = jest.fn((key: string) => key) as any
const t_commons = jest.fn((key: string) => key) as any

const schema = serverAddress(t, t_commons)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('serverAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('valid values', () => {
    it.each([
      ['simple hostname', 'mail.example.com'],
      ['subdomain', 'imap.mail.example.com'],
      ['hostname without subdomain', 'example.com'],
      ['hyphenated hostname', 'my-mail.example.com'],
      ['IPv4 address', '192.168.1.1'],
      ['IPv4 loopback', '127.0.0.1'],
      ['IPv6 full', '2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
      ['IPv6 compressed', '::1'],
      ['IPv6 mixed', '::ffff:192.168.1.1'],
    ])('accepts %s: %s', (_, value) => {
      expect(schema.safeParse(value).success).toBe(true)
    })
  })

  describe('invalid values', () => {
    it.each([
      ['empty string', ''],
      ['spaces only', '   '],
      ['invalid hostname chars', 'mail_server.example.com'],
      ['starts with hyphen', '-example.com'],
      ['ends with hyphen', 'example-.com'],
      ['starts with dot', '.example.com'],
      ['ends with dot', 'example.com.'],
      ['consecutive dots', 'mail..example.com'],
      ['invalid IPv4 range', '999.999.999.999'],
      ['incomplete IPv4', '192.168.1'],
      ['random string', 'not an address'],
      ['with protocol prefix', 'http://example.com'],
      ['with port', 'example.com:993'],
      ['with path', 'example.com/path'],
    ])('rejects %s: %s', (_, value) => {
      expect(schema.safeParse(value).success).toBe(false)
    })
  })

  describe('error messages', () => {
    it('uses t_commons validation.required for empty string', () => {
      const result = schema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.required')
      }
    })

    it('uses t validation.server-invalid for non-empty invalid value', () => {
      const result = schema.safeParse('not-valid!')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.server-invalid')
      }
    })

    it('calls t_commons with validation.required key', () => {
      serverAddress(t, t_commons).safeParse('')
      expect(t_commons).toHaveBeenCalledWith('validation.required')
    })

    it('calls t with validation.server-invalid key', () => {
      serverAddress(t, t_commons).safeParse('bad!!value')
      expect(t).toHaveBeenCalledWith('validation.server-invalid')
    })
  })
})
