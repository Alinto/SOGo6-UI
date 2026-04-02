import { useTranslations } from 'next-intl'
import {
  SOCKET_ENC_EXPLICIT_TLS,
  SOCKET_ENC_IMPLICIT_TLS,
  SOCKET_ENC_PLAIN,
} from '../../store/mailboxes-api-types'
import { schema } from '../external-accounts-schema'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockT = (key: string) => key
const mockTCommons = (key: string) => key

function makeSchema() {
  ;(useTranslations as jest.Mock).mockReturnValue(mockT)
  return schema(
    mockT as ReturnType<typeof useTranslations>,
    mockTCommons as ReturnType<typeof useTranslations>
  )
}

function validMailbox(overrides = {}) {
  return {
    name: 'My Mail Account',
    mail_server: {
      server: 'imap.example.com',
      port: 993,
      encryption: SOCKET_ENC_IMPLICIT_TLS,
      auth_mech: 'plain',
      username: 'user@example.com',
      password: 'securePassword123',
    },
    mail_outgoing: {
      server: 'smtp.example.com',
      port: 587,
      encryption: SOCKET_ENC_EXPLICIT_TLS,
      auth_mech: 'login',
      username: 'user@example.com',
      password: 'securePassword123',
    },
    identities: [
      {
        mail: 'user@example.com',
        name: 'John Doe',
        replyTo: 'reply@example.com',
        isDefault: true,
        signatures: {},
      },
    ],
    receipts: {
      enabled: false,
      not_to_cc: 'never',
      outside_domain: 'never',
      other: 'never',
    },
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('external-accounts-schema', () => {
  // ── schema creation ───────────────────────────────────────────────────────

  describe('schema creation', () => {
    it('returns a Zod schema without throwing', () => {
      expect(() => makeSchema()).not.toThrow()
    })

    it('exposes a parse method', () => {
      const testSchema = makeSchema()
      expect(typeof testSchema.parse).toBe('function')
    })

    it('exposes a safeParse method', () => {
      const testSchema = makeSchema()
      expect(typeof testSchema.safeParse).toBe('function')
    })
  })

  // ── validation - valid data ───────────────────────────────────────────────

  describe('validation - valid data', () => {
    const testSchema = makeSchema()

    it('accepts valid mailbox settings', () => {
      const result = testSchema.safeParse(validMailbox())
      if (!result.success) {
        console.error('Validation errors:', result.error)
      }
      expect(result.success).toBe(true)
    })

    it('accepts mailbox with id (edit mode)', () => {
      const result = testSchema.safeParse(validMailbox({ id: 'mailbox-123' }))
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('mailbox-123')
    })

    it('accepts multiple identities', () => {
      const result = testSchema.safeParse(
        validMailbox({
          identities: [
            {
              mail: 'user@example.com',
              name: 'Primary',
              replyTo: 'reply@example.com',
              isDefault: true,
              signatures: { 'en-US': 'Signature 1' },
            },
            {
              mail: 'user2@example.com',
              name: 'Secondary',
              replyTo: 'reply2@example.com',
              isDefault: false,
              signatures: { 'en-US': 'Signature 2' },
            },
          ],
        })
      )
      expect(result.success).toBe(true)
      expect(result.data?.identities).toHaveLength(2)
    })

    it('accepts different encryption types', () => {
      const encryptions = [
        SOCKET_ENC_PLAIN,
        SOCKET_ENC_IMPLICIT_TLS,
        SOCKET_ENC_EXPLICIT_TLS,
      ]
      encryptions.forEach((encryption) => {
        const result = testSchema.safeParse(
          validMailbox({
            mail_server: {
              server: 'imap.example.com',
              port: 993,
              encryption: encryption as any,
              auth_mech: 'plain',
              username: 'user@example.com',
              password: 'securePassword123',
            },
          })
        )
        expect(result.success).toBe(true)
      })
    })

    it('accepts different auth mechanisms', () => {
      const authMechs = ['plain', 'login']
      authMechs.forEach((auth) => {
        const result = testSchema.safeParse(
          validMailbox({
            mail_server: {
              server: 'imap.example.com',
              port: 993,
              encryption: SOCKET_ENC_IMPLICIT_TLS,
              auth_mech: auth as any,
              username: 'user@example.com',
              password: 'securePassword123',
            },
          })
        )
        expect(result.success).toBe(true)
      })
    })

    it('accepts different receipt policies', () => {
      const policies = ['never', 'always', 'ask']
      const result = testSchema.safeParse(
        validMailbox({
          receipts: {
            enabled: true,
            not_to_cc: 'always' as any,
            outside_domain: 'ask' as any,
            other: 'never' as any,
          },
        })
      )
      expect(result.success).toBe(true)
    })
  })

  // ── validation - invalid data ─────────────────────────────────────────────

  describe('validation - invalid data', () => {
    const testSchema = makeSchema()

    it('rejects missing name', () => {
      const result = testSchema.safeParse(validMailbox({ name: '' }))
      expect(result.success).toBe(false)
    })

    it('rejects invalid mail server', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: '',
            port: 993,
            encryption: SOCKET_ENC_IMPLICIT_TLS,
            auth_mech: 'plain',
            username: 'user@example.com',
            password: 'securePassword123',
          },
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects invalid port (out of range)', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: 'imap.example.com',
            port: 99999,
            encryption: SOCKET_ENC_IMPLICIT_TLS,
            auth_mech: 'plain',
            username: 'user@example.com',
            password: 'securePassword123',
          },
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects port below minimum', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: 'imap.example.com',
            port: 0,
            encryption: SOCKET_ENC_IMPLICIT_TLS,
            auth_mech: 'plain',
            username: 'user@example.com',
            password: 'securePassword123',
          },
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: 'imap.example.com',
            port: 993,
            encryption: SOCKET_ENC_IMPLICIT_TLS,
            auth_mech: 'plain',
            username: 'user@example.com',
            password: 'short',
          },
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects missing username', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: 'imap.example.com',
            port: 993,
            encryption: SOCKET_ENC_IMPLICIT_TLS,
            auth_mech: 'plain',
            username: '',
            password: 'securePassword123',
          },
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects invalid email in identity', () => {
      const result = testSchema.safeParse(
        validMailbox({
          identities: [
            {
              mail: 'not-an-email',
              name: 'John Doe',
              replyTo: 'reply@example.com',
              isDefault: true,
              signatures: {},
            },
          ],
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects empty identity name', () => {
      const result = testSchema.safeParse(
        validMailbox({
          identities: [
            {
              mail: 'user@example.com',
              name: '',
              replyTo: 'reply@example.com',
              isDefault: true,
              signatures: {},
            },
          ],
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects invalid encryption type', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: 'imap.example.com',
            port: 993,
            encryption: 'invalid' as any,
            auth_mech: 'plain',
            username: 'user@example.com',
            password: 'securePassword123',
          },
        })
      )
      expect(result.success).toBe(false)
    })

    it('rejects invalid auth mechanism', () => {
      const result = testSchema.safeParse(
        validMailbox({
          mail_server: {
            server: 'imap.example.com',
            port: 993,
            encryption: SOCKET_ENC_IMPLICIT_TLS,
            auth_mech: 'invalid' as any,
            username: 'user@example.com',
            password: 'securePassword123',
          },
        })
      )
      expect(result.success).toBe(false)
    })
  })

  // ── field transformations ─────────────────────────────────────────────────

  describe('field transformations', () => {
    const testSchema = makeSchema()

    it('preserves numeric port values', () => {
      const result = testSchema.safeParse(validMailbox())
      expect(typeof result.data?.mail_server.port).toBe('number')
      expect(result.data?.mail_server.port).toBe(993)
    })

    it('preserves boolean values in identities', () => {
      const result = testSchema.safeParse(validMailbox())
      expect(typeof result.data?.identities[0].isDefault).toBe('boolean')
    })

    it('preserves receipts enabled boolean', () => {
      const result = testSchema.safeParse(validMailbox())
      expect(typeof result.data?.receipts.enabled).toBe('boolean')
    })
  })
})
