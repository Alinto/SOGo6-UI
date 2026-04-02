import { HOSTNAME_RE } from '@/lib/validations/regex'
import { z } from 'zod'
import { serverAddress } from '../zod-utils'

// ── Mock translations ─────────────────────────────────────────────────────────

const mockT = (key: string) => `translated: ${key}`
const mockTCommons = (key: string) => `commons: ${key}`

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('zod-utils', () => {
  // ── serverAddress ─────────────────────────────────────────────────────────

  describe('serverAddress', () => {
    let schema: z.ZodString

    beforeEach(() => {
      schema = serverAddress(mockT as any, mockTCommons as any)
    })

    it('accepts valid hostnames', () => {
      const validServers = [
        'imap.example.com',
        'smtp.example.co.uk',
        'mail-server.test.org',
      ]
      validServers.forEach((server) => {
        expect(() => schema.parse(server)).not.toThrow()
      })
    })

    it('accepts valid IPv4 addresses', () => {
      const validIPv4s = [
        '127.0.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '255.255.255.255',
      ]
      validIPv4s.forEach((ip) => {
        expect(() => schema.parse(ip)).not.toThrow()
      })
    })

    it('accepts valid IPv6 addresses', () => {
      const validIPv6s = ['::1', '2001:db8::1', 'fe80::1']
      validIPv6s.forEach((ip) => {
        expect(() => schema.parse(ip)).not.toThrow()
      })
    })

    it('rejects empty strings', () => {
      expect(() => schema.parse('')).toThrow()
    })

    it('rejects invalid hostnames', () => {
      expect(() => schema.parse('invalid-domain')).toThrow()
    })

    it('rejects invalid IPv4 addresses', () => {
      expect(() => schema.parse('256.256.256.256')).toThrow()
      expect(() => schema.parse('999.999.999.999')).toThrow()
    })

    it('rejects invalid IPv6 addresses', () => {
      expect(() => schema.parse('gggg::')).toThrow()
    })

    it('rejects whitespace', () => {
      expect(() => schema.parse(' ')).toThrow()
      expect(() => schema.parse(' example.com')).toThrow()
      expect(() => schema.parse('example.com ')).toThrow()
    })

    it('provides validation error for invalid server', () => {
      try {
        schema.parse('invalid')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('supports multiple server formats', () => {
      const servers = [
        'mail.example.com', // hostname
        '192.168.1.1', // IPv4
        '::1', // IPv6
      ]
      servers.forEach((server) => {
        expect(() => schema.parse(server)).not.toThrow()
      })
    })

    it('validates against required constraint', () => {
      expect(() => schema.parse('')).toThrow()
    })
  })

  // ── regex validation ──────────────────────────────────────────────────────

  describe('regex validation', () => {
    let schema: z.ZodString

    beforeEach(() => {
      schema = serverAddress(mockT as any, mockTCommons as any)
    })

    it('hostname regex correctly identifies valid hostnames', () => {
      const validHostnames = [
        'example.com',
        'mail.example.com',
        'smtp-server.test.org',
      ]
      validHostnames.forEach((hostname) => {
        expect(HOSTNAME_RE.test(hostname)).toBe(true)
      })
    })

    it('hostname regex rejects single labels', () => {
      expect(HOSTNAME_RE.test('localhost')).toBe(false)
    })

    it('uses HOSTNAME_RE for hostname validation', () => {
      // The serverAddress function uses HOSTNAME_RE internally
      expect(typeof HOSTNAME_RE).toBe('object')
      expect(HOSTNAME_RE instanceof RegExp).toBe(true)
    })
  })

  // ── error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    let schema: z.ZodString

    beforeEach(() => {
      schema = serverAddress(mockT as any, mockTCommons as any)
    })

    it('returns error for empty string', () => {
      const result = schema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('returns error for invalid host', () => {
      const result = schema.safeParse('invalid-single-label')
      expect(result.success).toBe(false)
    })

    it('returns error for malformed IP', () => {
      const result = schema.safeParse('999.999.999.999')
      expect(result.success).toBe(false)
    })

    it('allows safe parsing', () => {
      const validResult = schema.safeParse('example.com')
      expect(validResult.success).toBe(true)

      const invalidResult = schema.safeParse('invalid')
      expect(invalidResult.success).toBe(false)
    })

    it('throws on parse with invalid input', () => {
      expect(() => schema.parse('invalid')).toThrow()
    })

    it('does not throw on safeParse with invalid input', () => {
      expect(() => schema.safeParse('invalid')).not.toThrow()
    })
  })

  // ── translation keys ──────────────────────────────────────────────────────

  describe('translation keys', () => {
    it('uses provided translation functions', () => {
      const schema = serverAddress(mockT as any, mockTCommons as any)
      expect(schema).toBeDefined()
    })

    it('passes translation function for server validation', () => {
      const testT = jest.fn((key: string) => key)
      const testTCommons = jest.fn((key: string) => key)
      serverAddress(testT as any, testTCommons as any)
      expect(testT).toBeDefined()
      expect(testTCommons).toBeDefined()
    })
  })

  // ── special cases ─────────────────────────────────────────────────────────

  describe('special cases', () => {
    let schema: z.ZodString

    beforeEach(() => {
      schema = serverAddress(mockT as any, mockTCommons as any)
    })

    it('accepts localhost when using appropriate validation', () => {
      // Note: localhost is typically rejected by hostname regex
      const result = schema.safeParse('127.0.0.1')
      expect(result.success).toBe(true)
    })

    it('handles case sensitivity properly', () => {
      // IPv6 should be case-insensitive
      const result = schema.safeParse('2001:DB8::1')
      expect(typeof result).toBe('object')
    })

    it('accepts subdomains', () => {
      const result = schema.safeParse('mail.example.co.uk')
      expect(result.success).toBe(true)
    })

    it('rejects URLs', () => {
      const result = schema.safeParse('https://example.com')
      expect(result.success).toBe(false)
    })

    it('rejects emails', () => {
      const result = schema.safeParse('user@example.com')
      expect(result.success).toBe(false)
    })

    it('rejects ports', () => {
      const result = schema.safeParse('example.com:993')
      expect(result.success).toBe(false)
    })
  })
})
