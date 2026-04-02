import {
  AUTHMECH_LOGIN,
  AUTHMECH_PLAIN,
  SOCKET_ENC_EXPLICIT_TLS,
  SOCKET_ENC_IMPLICIT_TLS,
  SOCKET_ENC_PLAIN,
} from '../mailboxes-api-types'
import type {
  MailBoxIdentitySettings,
  MailServerSettings,
  MailboxPOSTSettings,
  MailboxSettings,
  Receipts,
} from '../mailboxes-form-types'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('mailboxes-form-types', () => {
  // ── Receipts interface ────────────────────────────────────────────────────

  describe('Receipts interface', () => {
    it('can create Receipts with all fields', () => {
      const receipts: Receipts = {
        enabled: true,
        not_to_cc: 'never',
        outside_domain: 'always',
        other: 'ask',
      }
      expect(receipts.enabled).toBe(true)
      expect(receipts.not_to_cc).toBe('never')
    })

    it('Receipts fields are optional except enabled', () => {
      const receipts: Receipts = {
        enabled: false,
      }
      expect(receipts.enabled).toBe(false)
      expect(receipts.not_to_cc).toBeUndefined()
    })
  })

  // ── MailBoxIdentitySettings interface ─────────────────────────────────────

  describe('MailBoxIdentitySettings interface', () => {
    it('can create valid MailBoxIdentitySettings', () => {
      const identity: MailBoxIdentitySettings = {
        mail: 'test@example.com',
        name: 'Test User',
        replyTo: 'reply@example.com',
        isDefault: true,
        signatures: {},
      }
      expect(identity.mail).toBe('test@example.com')
      expect(identity.name).toBe('Test User')
    })

    it('supports multiple signatures', () => {
      const identity: MailBoxIdentitySettings = {
        mail: 'test@example.com',
        name: 'Test User',
        replyTo: 'reply@example.com',
        isDefault: false,
        signatures: {
          'en-US': 'English sig',
          'fr-FR': 'French sig',
        },
      }
      expect(Object.keys(identity.signatures)).toHaveLength(2)
    })
  })

  // ── MailServerSettings interface ──────────────────────────────────────────

  describe('MailServerSettings interface', () => {
    it('can create valid MailServerSettings', () => {
      const settings: MailServerSettings = {
        server: 'imap.example.com',
        port: 993,
        encryption: SOCKET_ENC_IMPLICIT_TLS,
        password: 'password123',
        username: 'user',
        auth_mech: AUTHMECH_PLAIN,
      }
      expect(settings.server).toBe('imap.example.com')
      expect(settings.port).toBe(993)
    })

    it('supports different encryption types', () => {
      const encryptions = [
        SOCKET_ENC_PLAIN,
        SOCKET_ENC_IMPLICIT_TLS,
        SOCKET_ENC_EXPLICIT_TLS,
      ]
      encryptions.forEach((encryption) => {
        const settings: MailServerSettings = {
          server: 'imap.example.com',
          port: 993,
          encryption,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        }
        expect(settings.encryption).toBe(encryption)
      })
    })

    it('supports different auth mechanisms', () => {
      const settings: MailServerSettings = {
        server: 'imap.example.com',
        port: 993,
        encryption: SOCKET_ENC_IMPLICIT_TLS,
        password: 'pass',
        username: 'user',
        auth_mech: AUTHMECH_LOGIN,
      }
      expect(settings.auth_mech).toBe(AUTHMECH_LOGIN)
    })
  })

  // ── MailboxPOSTSettings interface ─────────────────────────────────────────

  describe('MailboxPOSTSettings interface', () => {
    it('can create valid MailboxPOSTSettings', () => {
      const settings: MailboxPOSTSettings = {
        name: 'My Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        identities: [
          {
            mail: 'user@example.com',
            name: 'Primary',
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
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
      }
      expect(settings.name).toBe('My Account')
      expect(settings.mail_server.server).toBe('imap.example.com')
    })

    it('contains all required fields', () => {
      const settings: MailboxPOSTSettings = {
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        identities: [],
        receipts: { enabled: false },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
      }
      expect(settings.name).toBeDefined()
      expect(settings.mail_server).toBeDefined()
      expect(settings.mail_outgoing).toBeDefined()
      expect(settings.identities).toBeDefined()
      expect(settings.receipts).toBeDefined()
    })
  })

  // ── MailboxSettings interface ─────────────────────────────────────────────

  describe('MailboxSettings interface', () => {
    it('extends MailboxPOSTSettings with id', () => {
      const settings: MailboxSettings = {
        id: 'mailbox-1',
        name: 'My Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        identities: [],
        receipts: { enabled: false },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
      }
      expect(settings.id).toBe('mailbox-1')
      expect(settings.name).toBe('My Account')
    })

    it('has all POST settings fields plus id', () => {
      const settings: MailboxSettings = {
        id: 'test',
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        identities: [
          {
            mail: 'user@example.com',
            name: 'Name',
            replyTo: 'reply@example.com',
            isDefault: true,
            signatures: {},
          },
        ],
        receipts: {
          enabled: true,
          not_to_cc: 'always',
          outside_domain: 'ask',
          other: 'never',
        },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
      }
      expect(settings.id).toBeDefined()
      expect(settings.name).toBeDefined()
      expect(settings.mail_server).toBeDefined()
      expect(settings.mail_outgoing).toBeDefined()
      expect(settings.identities).toBeDefined()
      expect(settings.receipts).toBeDefined()
    })
  })

  // ── form types structure ──────────────────────────────────────────────────

  describe('form types structure', () => {
    it('MailboxSettings has id while MailboxPOSTSettings does not', () => {
      const postSettings: MailboxPOSTSettings = {
        name: 'Account',
        mail_server: {
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        identities: [],
        receipts: { enabled: false },
        mail_outgoing: {
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
      }

      const settings: MailboxSettings = {
        id: 'mailbox-1',
        ...postSettings,
      }

      expect('id' in postSettings).toBe(false)
      expect('id' in settings).toBe(true)
      expect(settings.id).toBe('mailbox-1')
    })
  })
})
