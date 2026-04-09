import { FAKE_PASSWORD_SENTINEL } from '../../external-accounts-utils'
import type { Mailbox } from '../mailboxes-api-types'
import type { MailboxSettings } from '../mailboxes-form-types'
import {
  mapApiToMailboxSettings,
  mapMailboxSettingsToApi,
  mapMailboxSettingsToApiCreate,
  mapMailboxSettingsToApiPOST,
} from '../mailboxes-utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function createMockMailbox(overrides = {}): Mailbox {
  return {
    id: 'mailbox-1',
    name: 'Test Account',
    mail_server: {
      type: 'imap',
      server: 'imap.example.com',
      port: 993,
      encryption: 'SSL/TLS',
      password: 'imap-pass',
      username: 'user',
      auth_mech: 'plain',
    },
    mail_outgoing: {
      type: 'smtp',
      server: 'smtp.example.com',
      port: 587,
      encryption: 'StartTLS',
      password: 'smtp-pass',
      username: 'user',
      auth_mech: 'login',
    },
    identities: [
      {
        mail: 'test@example.com',
        name: 'Test User',
        replyTo: 'reply@example.com',
        isDefault: true,
        signatures: { 'en-US': 'Best regards' },
      },
    ],
    receipts: {
      enabled: true,
      not_to_cc: 'never',
      outside_domain: 'always',
      other: 'ask',
    },
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('mailboxes-utils', () => {
  // ── mapApiToMailboxSettings ───────────────────────────────────────────────

  describe('mapApiToMailboxSettings', () => {
    it('converts API Mailbox to MailboxSettings', () => {
      const mailbox = createMockMailbox()
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.id).toBe('mailbox-1')
      expect(result.name).toBe('Test Account')
      expect(result.mail_server.server).toBe('imap.example.com')
      expect(result.mail_outgoing.server).toBe('smtp.example.com')
    })

    it('replaces passwords with sentinel value', () => {
      const mailbox = createMockMailbox()
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.mail_server.password).toBe(FAKE_PASSWORD_SENTINEL)
      expect(result.mail_outgoing.password).toBe(FAKE_PASSWORD_SENTINEL)
    })

    it('maps identities correctly', () => {
      const mailbox = createMockMailbox()
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.identities).toHaveLength(1)
      expect(result.identities[0].mail).toBe('test@example.com')
      expect(result.identities[0].name).toBe('Test User')
    })

    it('handles empty identities', () => {
      const mailbox = createMockMailbox({
        identities: [],
      })
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.identities).toEqual([])
    })

    it('handles missing identities', () => {
      const mailbox = createMockMailbox({
        identities: undefined,
      })
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.identities).toBeUndefined()
    })

    it('maps receipts settings, using defaults for missing fields', () => {
      const mailbox = createMockMailbox({
        receipts: {
          enabled: true,
          not_to_cc: 'never',
          outside_domain: 'ask',
          other: 'always',
        },
      })
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.receipts.enabled).toBe(true)
      expect(result.receipts.not_to_cc).toBe('never')
      expect(result.receipts.outside_domain).toBe('ask')
      expect(result.receipts.other).toBe('always')
    })

    it('applies default receipts when missing', () => {
      const mailbox = createMockMailbox({
        receipts: undefined,
      })
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.receipts.enabled).toBe(false)
      expect(result.receipts.not_to_cc).toBe('never')
      expect(result.receipts.outside_domain).toBe('never')
      expect(result.receipts.other).toBe('never')
    })

    it('handles empty signatures', () => {
      const mailbox = createMockMailbox({
        identities: [
          {
            mail: 'test@example.com',
            name: 'User',
            replyTo: 'reply@example.com',
            isDefault: true,
            signatures: undefined,
          },
        ],
      })
      const result = mapApiToMailboxSettings(mailbox)

      expect(result.identities[0].signatures).toEqual({})
    })
  })

  // ── mapMailboxSettingsToApi ───────────────────────────────────────────────

  describe('mapMailboxSettingsToApi', () => {
    it('converts MailboxSettings back to Mailbox format', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'newpass',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'newpass',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [],
        receipts: {
          enabled: false,
          not_to_cc: 'never',
          outside_domain: 'never',
          other: 'never',
        },
      }
      const result = mapMailboxSettingsToApi(settings)

      expect(result.id).toBe('mailbox-1')
      expect(result.mail_server.type).toBe('imap')
      expect(result.mail_outgoing.type).toBe('smtp')
    })

    it('preserves passwords (when not sentinel)', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'real-password',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'real-password',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [],
        receipts: { enabled: false },
      }
      const result = mapMailboxSettingsToApi(settings)

      expect(result.mail_server.password).toBe('real-password')
      expect(result.mail_outgoing.password).toBe('real-password')
    })

    it('adds type field to mail servers', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [],
        receipts: { enabled: false },
      }
      const result = mapMailboxSettingsToApi(settings)

      expect(result.mail_server.type).toBe('imap')
      expect(result.mail_outgoing.type).toBe('smtp')
    })
  })

  // ── mapMailboxSettingsToApiCreate ─────────────────────────────────────────

  describe('mapMailboxSettingsToApiCreate', () => {
    it('creates POST payload without id', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [],
        receipts: { enabled: false },
      }
      const result = mapMailboxSettingsToApiCreate(settings)

      expect('id' in result).toBe(false)
      expect(result.name).toBe('Account')
    })

    it('includes all required fields for POST', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [
          {
            mail: 'test@example.com',
            name: 'User',
            replyTo: 'reply@example.com',
            isDefault: true,
            signatures: {},
          },
        ],
        receipts: {
          enabled: true,
          not_to_cc: 'never',
          outside_domain: 'always',
          other: 'ask',
        },
      }
      const result = mapMailboxSettingsToApiCreate(settings)

      expect(result.name).toBeDefined()
      expect(result.mail_server).toBeDefined()
      expect(result.mail_outgoing).toBeDefined()
      expect(result.identities).toBeDefined()
      expect(result.receipts).toBeDefined()
    })
  })

  // ── mapMailboxSettingsToApiPOST ───────────────────────────────────────────

  describe('mapMailboxSettingsToApiPOST', () => {
    it('creates POST payload without id', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [],
        receipts: { enabled: false },
      }
      const result = mapMailboxSettingsToApiPOST(settings)

      expect('id' in result).toBe(false)
      expect(result.name).toBe('Account')
    })
  })

  // ── mapping consistency ───────────────────────────────────────────────────

  describe('mapping consistency', () => {
    it('mapApiToMailboxSettings then mapMailboxSettingsToApi preserves structure', () => {
      const original = createMockMailbox()
      const mapped = mapApiToMailboxSettings(original)
      const backToApi = mapMailboxSettingsToApi(mapped)

      expect(backToApi.name).toBe(original.name)
      expect(backToApi.mail_server.server).toBe(original.mail_server.server)
      expect(backToApi.mail_outgoing.server).toBe(original.mail_outgoing.server)
    })

    it('handles round-trip without id loss', () => {
      const settings: MailboxSettings = {
        id: 'preserved-id',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: 'SSL/TLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'plain',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: 'StartTLS',
          password: 'pass',
          username: 'user',
          auth_mech: 'login',
        },
        identities: [],
        receipts: { enabled: false },
      }
      const result = mapMailboxSettingsToApi(settings)

      expect(result.id).toBe('preserved-id')
    })
  })
})
