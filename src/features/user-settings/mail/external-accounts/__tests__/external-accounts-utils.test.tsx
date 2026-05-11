import { schemaType } from '../components/external-accounts-schema'
import {
  FAKE_PASSWORD_SENTINEL,
  MAIL_OUTGOING,
  MAIL_SERVER,
  MODE_CREATE,
  MODE_EDIT,
  MODE_LIST,
  stripUnchangedPasswords,
} from '../external-accounts-utils'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('external-accounts-utils', () => {
  // ── constants ─────────────────────────────────────────────────────────────

  describe('mode constants', () => {
    it('exports MODE_CREATE constant', () => {
      expect(MODE_CREATE).toBe('create')
    })

    it('exports MODE_EDIT constant', () => {
      expect(MODE_EDIT).toBe('edit')
    })

    it('exports MODE_LIST constant', () => {
      expect(MODE_LIST).toBe('list')
    })

    it('all modes are unique strings', () => {
      const modes = [MODE_CREATE, MODE_EDIT, MODE_LIST]
      const uniqueModes = new Set(modes)
      expect(uniqueModes.size).toBe(3)
    })
  })

  // ── server section constants ──────────────────────────────────────────────

  describe('server section constants', () => {
    it('exports MAIL_SERVER constant', () => {
      expect(MAIL_SERVER).toBe('mail_server')
    })

    it('exports MAIL_OUTGOING constant', () => {
      expect(MAIL_OUTGOING).toBe('mail_outgoing')
    })

    it('server constants are unique', () => {
      expect(MAIL_SERVER).not.toBe(MAIL_OUTGOING)
    })
  })

  // ── password sentinel constant ────────────────────────────────────────────

  describe('password sentinel constant', () => {
    it('exports FAKE_PASSWORD_SENTINEL constant', () => {
      expect(FAKE_PASSWORD_SENTINEL).toBeDefined()
    })

    it('sentinel is a non-empty string', () => {
      expect(typeof FAKE_PASSWORD_SENTINEL).toBe('string')
      expect(FAKE_PASSWORD_SENTINEL.length).toBeGreaterThan(0)
    })

    it('sentinel matches expected value', () => {
      expect(FAKE_PASSWORD_SENTINEL).toBe('__UNCHANGED_PASSWORD__')
    })
  })

  // ── stripUnchangedPasswords function ──────────────────────────────────────

  describe('stripUnchangedPasswords', () => {
    // Helper to create test values
    function createTestValue(overrides = {}): Partial<schemaType> {
      return {
        name: 'Test Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: 'password123',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: 'password123',
        },
        identities: [
          {
            mail: 'user@example.com',
            name: 'Main',
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

    // ── basic functionality ─────────────────────────────────────────────────

    it('returns a new SchemaType object', () => {
      const value = createTestValue()
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('preserves all fields by default', () => {
      const value = createTestValue()
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.name).toBe(value.name)
      expect(result.mail_server?.server).toBe(value.mail_server?.server)
      expect(result.mail_outgoing?.port).toBe(value.mail_outgoing?.port)
    })

    it('does not modify the original object', () => {
      const value = createTestValue()
      const original = JSON.parse(JSON.stringify(value))
      stripUnchangedPasswords(value as schemaType)
      expect(value).toEqual(original)
    })

    // ── incoming password stripping ─────────────────────────────────────────

    it('removes incoming password when it is the sentinel value', () => {
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.password).toBeUndefined()
    })

    it('preserves incoming password when it has a real value', () => {
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: 'realPassword123',
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.password).toBe('realPassword123')
    })

    // ── outgoing password stripping ─────────────────────────────────────────

    it('removes outgoing password when it is the sentinel value', () => {
      const value = createTestValue({
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_outgoing?.password).toBeUndefined()
    })

    it('preserves outgoing password when it has a real value', () => {
      const value = createTestValue({
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: 'realSmtpPassword123',
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_outgoing?.password).toBe('realSmtpPassword123')
    })

    // ── both passwords handling ─────────────────────────────────────────────

    it('removes both passwords when both are sentinels', () => {
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.password).toBeUndefined()
      expect(result.mail_outgoing?.password).toBeUndefined()
    })

    it('preserves one real password and removes sentinel password', () => {
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: 'realImapPassword123',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.password).toBe('realImapPassword123')
      expect(result.mail_outgoing?.password).toBeUndefined()
    })

    // ── edge cases ──────────────────────────────────────────────────────────

    it('handles missing mail_server section gracefully', () => {
      const value = createTestValue({
        mail_server: undefined,
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server).toBeUndefined()
    })

    it('handles missing mail_outgoing section gracefully', () => {
      const value = createTestValue({
        mail_outgoing: undefined,
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_outgoing).toBeUndefined()
    })

    it('handles empty password string', () => {
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: '',
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      // Empty string is not the sentinel, so it should be preserved
      expect(result.mail_server?.password).toBe('')
    })

    it('handles null password gracefully', () => {
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: null as any,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      // null is not the sentinel, so it should be preserved
      expect(result.mail_server?.password).toBeNull()
    })

    // ── other fields preservation ───────────────────────────────────────────

    it('preserves identities when stripping passwords', () => {
      const identities = [
        {
          mail: 'user@example.com',
          name: 'Main',
          replyTo: 'reply@example.com',
          isDefault: true,
          signatures: { 'en-US': 'Sig 1' },
        },
        {
          mail: 'secondary@example.com',
          name: 'Secondary',
          replyTo: 'reply2@example.com',
          isDefault: false,
          signatures: { 'en-US': 'Sig 2' },
        },
      ]
      const value = createTestValue({
        identities,
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.identities).toEqual(identities)
    })

    it('preserves receipts settings when stripping passwords', () => {
      const receipts = {
        enabled: true,
        not_to_cc: 'always',
        outside_domain: 'ask',
        other: 'never',
      }
      const value = createTestValue({
        receipts,
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.receipts).toEqual(receipts)
    })

    it('preserves all server configuration except password', () => {
      const value = createTestValue({
        mail_server: {
          server: 'custom.imap.example.com',
          port: 3993,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'custom_user',
          password: FAKE_PASSWORD_SENTINEL,
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.server).toBe('custom.imap.example.com')
      expect(result.mail_server?.port).toBe(3993)
      expect(result.mail_server?.encryption).toBe('explicit_tls')
      expect(result.mail_server?.auth_mech).toBe('login')
      expect(result.mail_server?.username).toBe('custom_user')
      expect(result.mail_server?.password).toBeUndefined()
    })

    // ── typical usage scenarios ─────────────────────────────────────────────

    it('handles typical PATCH scenario with unchanged incoming password', () => {
      // Typical use case: user edits account but doesn't change incoming password
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: FAKE_PASSWORD_SENTINEL,
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: 'newSmtpPassword456',
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.password).toBeUndefined()
      expect(result.mail_outgoing?.password).toBe('newSmtpPassword456')
    })

    it('handles typical PATCH scenario with both passwords updated', () => {
      // Typical use case: user updates both passwords
      const value = createTestValue({
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'implicit_tls',
          auth_mech: 'plain',
          username: 'user',
          password: 'newImapPassword789',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'explicit_tls',
          auth_mech: 'login',
          username: 'user',
          password: 'newSmtpPassword789',
        },
      })
      const result = stripUnchangedPasswords(value as schemaType)
      expect(result.mail_server?.password).toBe('newImapPassword789')
      expect(result.mail_outgoing?.password).toBe('newSmtpPassword789')
    })
  })
})
