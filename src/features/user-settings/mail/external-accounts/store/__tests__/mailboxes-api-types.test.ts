import {
  AUTHMECH_LOGIN,
  AUTHMECH_PLAIN,
  IMAP,
  RECEIPT_POLICY_ALWAYS,
  RECEIPT_POLICY_ASK,
  RECEIPT_POLICY_NEVER,
  SMTP,
  SOCKET_ENC_EXPLICIT_TLS,
  SOCKET_ENC_IMPLICIT_TLS,
  SOCKET_ENC_PLAIN,
  type MailBoxIdentity,
  type MailOutgoing,
  type MailServer,
  type MailServerSchema,
  type Mailbox,
  type MailboxPOST,
  type MailboxesResponse,
  type RECEIPT_POLICY,
  type Receipts,
} from '../mailboxes-api-types'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('mailboxes-api-types', () => {
  // ── encryption constants ──────────────────────────────────────────────────

  describe('encryption constants', () => {
    it('exports SOCKET_ENC_PLAIN constant', () => {
      expect(SOCKET_ENC_PLAIN).toBe('None')
    })

    it('exports SOCKET_ENC_IMPLICIT_TLS constant', () => {
      expect(SOCKET_ENC_IMPLICIT_TLS).toBe('SSL/TLS')
    })

    it('exports SOCKET_ENC_EXPLICIT_TLS constant', () => {
      expect(SOCKET_ENC_EXPLICIT_TLS).toBe('StartTLS')
    })

    it('encryption constants are unique', () => {
      const encryptions = new Set([
        SOCKET_ENC_PLAIN,
        SOCKET_ENC_IMPLICIT_TLS,
        SOCKET_ENC_EXPLICIT_TLS,
      ])
      expect(encryptions.size).toBe(3)
    })
  })

  // ── server type constants ─────────────────────────────────────────────────

  describe('server type constants', () => {
    it('exports IMAP constant', () => {
      expect(IMAP).toBe('imap')
    })

    it('exports SMTP constant', () => {
      expect(SMTP).toBe('smtp')
    })

    it('server types are unique', () => {
      expect(IMAP).not.toBe(SMTP)
    })
  })

  // ── auth mechanism constants ──────────────────────────────────────────────

  describe('auth mechanism constants', () => {
    it('exports AUTHMECH_PLAIN constant', () => {
      expect(AUTHMECH_PLAIN).toBe('plain')
    })

    it('exports AUTHMECH_LOGIN constant', () => {
      expect(AUTHMECH_LOGIN).toBe('login')
    })

    it('auth mechanisms are unique', () => {
      expect(AUTHMECH_PLAIN).not.toBe(AUTHMECH_LOGIN)
    })
  })

  // ── receipt policy constants ──────────────────────────────────────────────

  describe('receipt policy constants', () => {
    it('exports RECEIPT_POLICY_NEVER constant', () => {
      expect(RECEIPT_POLICY_NEVER).toBe('never')
    })

    it('exports RECEIPT_POLICY_ALWAYS constant', () => {
      expect(RECEIPT_POLICY_ALWAYS).toBe('always')
    })

    it('exports RECEIPT_POLICY_ASK constant', () => {
      expect(RECEIPT_POLICY_ASK).toBe('ask')
    })

    it('receipt policies are unique', () => {
      const policies = new Set([
        RECEIPT_POLICY_NEVER,
        RECEIPT_POLICY_ALWAYS,
        RECEIPT_POLICY_ASK,
      ])
      expect(policies.size).toBe(3)
    })
  })

  // ── Receipts interface ────────────────────────────────────────────────────

  describe('Receipts interface', () => {
    it('can create valid Receipts object', () => {
      const receipts: Receipts = {
        enabled: true,
        not_to_cc: 'never',
        outside_domain: 'always',
        other: 'ask',
      }
      expect(receipts.enabled).toBe(true)
      expect(receipts.not_to_cc).toBe('never')
      expect(receipts.outside_domain).toBe('always')
      expect(receipts.other).toBe('ask')
    })

    it('Receipts supports all policy types', () => {
      const receipt: Receipts = {
        enabled: false,
        not_to_cc: RECEIPT_POLICY_NEVER,
        outside_domain: RECEIPT_POLICY_ALWAYS,
        other: RECEIPT_POLICY_ASK,
      }
      expect(receipt).toBeDefined()
    })
  })

  // ── MailBoxIdentity interface ─────────────────────────────────────────────

  describe('MailBoxIdentity interface', () => {
    it('can create valid MailBoxIdentity object', () => {
      const identity: MailBoxIdentity = {
        mail: 'test@example.com',
        name: 'Test User',
        replyTo: 'reply@example.com',
        isDefault: true,
        signatures: { 'en-US': 'Best regards' },
      }
      expect(identity.mail).toBe('test@example.com')
      expect(identity.name).toBe('Test User')
      expect(identity.isDefault).toBe(true)
    })

    it('supports empty signatures', () => {
      const identity: MailBoxIdentity = {
        mail: 'test@example.com',
        name: 'Test User',
        replyTo: 'reply@example.com',
        isDefault: false,
        signatures: {},
      }
      expect(identity.signatures).toEqual({})
    })

    it('supports multiple language signatures', () => {
      const identity: MailBoxIdentity = {
        mail: 'test@example.com',
        name: 'Test User',
        replyTo: 'reply@example.com',
        isDefault: true,
        signatures: {
          'en-US': 'English signature',
          'fr-FR': 'Signature française',
        },
      }
      expect(Object.keys(identity.signatures)).toHaveLength(2)
    })
  })

  // ── MailServer interface ──────────────────────────────────────────────────

  describe('MailServer interface', () => {
    it('can create valid MailServer object', () => {
      const server: MailServer = {
        server: 'imap.example.com',
        port: 993,
        encryption: SOCKET_ENC_IMPLICIT_TLS,
        password: 'password123',
        username: 'user',
        auth_mech: AUTHMECH_PLAIN,
      }
      expect(server.server).toBe('imap.example.com')
      expect(server.port).toBe(993)
    })

    it('supports different encryption types', () => {
      const encryptions = [
        SOCKET_ENC_PLAIN,
        SOCKET_ENC_IMPLICIT_TLS,
        SOCKET_ENC_EXPLICIT_TLS,
      ]
      encryptions.forEach((encryption) => {
        const server: MailServer = {
          server: 'imap.example.com',
          port: 993,
          encryption,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        }
        expect(server.encryption).toBe(encryption)
      })
    })

    it('supports different auth mechanisms', () => {
      const authMechs = [AUTHMECH_PLAIN, AUTHMECH_LOGIN]
      authMechs.forEach((auth) => {
        const server: MailServer = {
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: auth,
        }
        expect(server.auth_mech).toBe(auth)
      })
    })
  })

  // ── MailServerSchema interface ────────────────────────────────────────────

  describe('MailServerSchema interface', () => {
    it('extends MailServer and adds type field', () => {
      const schema: MailServerSchema = {
        type: IMAP,
        server: 'imap.example.com',
        port: 993,
        encryption: SOCKET_ENC_IMPLICIT_TLS,
        password: 'pass',
        username: 'user',
        auth_mech: AUTHMECH_PLAIN,
      }
      expect(schema.type).toBe(IMAP)
      expect(schema.server).toBe('imap.example.com')
    })

    it('type must be IMAP', () => {
      const schema: MailServerSchema = {
        type: IMAP,
        server: 'imap.example.com',
        port: 993,
        encryption: SOCKET_ENC_IMPLICIT_TLS,
        password: 'pass',
        username: 'user',
        auth_mech: AUTHMECH_PLAIN,
      }
      expect(schema.type).toBe('imap')
    })
  })

  // ── MailOutgoing interface ────────────────────────────────────────────────

  describe('MailOutgoing interface', () => {
    it('extends MailServer and adds type field', () => {
      const outgoing: MailOutgoing = {
        type: SMTP,
        server: 'smtp.example.com',
        port: 587,
        encryption: SOCKET_ENC_EXPLICIT_TLS,
        password: 'pass',
        username: 'user',
        auth_mech: AUTHMECH_LOGIN,
      }
      expect(outgoing.type).toBe(SMTP)
      expect(outgoing.server).toBe('smtp.example.com')
    })

    it('type must be SMTP', () => {
      const outgoing: MailOutgoing = {
        type: SMTP,
        server: 'smtp.example.com',
        port: 587,
        encryption: SOCKET_ENC_EXPLICIT_TLS,
        password: 'pass',
        username: 'user',
        auth_mech: AUTHMECH_LOGIN,
      }
      expect(outgoing.type).toBe('smtp')
    })
  })

  // ── Mailbox interface ─────────────────────────────────────────────────────

  describe('Mailbox interface', () => {
    it('can create valid Mailbox object', () => {
      const mailbox: Mailbox = {
        id: 'mailbox-1',
        name: 'My Account',
        mail_server: {
          type: IMAP,
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        mail_outgoing: {
          type: SMTP,
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
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
      }
      expect(mailbox.id).toBe('mailbox-1')
      expect(mailbox.name).toBe('My Account')
    })

    it('Mailbox extends MailboxPOST with id', () => {
      const mailbox: Mailbox = {
        id: 'test-id',
        name: 'Account',
        mail_server: {
          type: IMAP,
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        mail_outgoing: {
          type: SMTP,
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
        receipts: {
          enabled: false,
          not_to_cc: 'never',
          outside_domain: 'never',
          other: 'never',
        },
      }
      expect(mailbox.id).toBeDefined()
    })
  })

  // ── MailboxPOST interface ─────────────────────────────────────────────────

  describe('MailboxPOST interface', () => {
    it('can create valid MailboxPOST object', () => {
      const post: MailboxPOST = {
        name: 'New Account',
        mail_server: {
          type: IMAP,
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        mail_outgoing: {
          type: SMTP,
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
        receipts: {
          enabled: false,
          not_to_cc: 'never',
          outside_domain: 'never',
          other: 'never',
        },
      }
      expect(post.name).toBe('New Account')
    })

    it('identities are optional in MailboxPOST', () => {
      const post: MailboxPOST = {
        name: 'Account',
        mail_server: {
          type: IMAP,
          server: 'imap.example.com',
          port: 993,
          encryption: SOCKET_ENC_IMPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_PLAIN,
        },
        mail_outgoing: {
          type: SMTP,
          server: 'smtp.example.com',
          port: 587,
          encryption: SOCKET_ENC_EXPLICIT_TLS,
          password: 'pass',
          username: 'user',
          auth_mech: AUTHMECH_LOGIN,
        },
        receipts: {
          enabled: false,
          not_to_cc: 'never',
          outside_domain: 'never',
          other: 'never',
        },
      }
      expect(post.identities).toBeUndefined()
    })
  })

  // ── MailboxesResponse interface ───────────────────────────────────────────

  describe('MailboxesResponse interface', () => {
    it('can create valid MailboxesResponse', () => {
      const response: MailboxesResponse = {
        data: [],
        error_code: '',
        error_msg: '',
      }
      expect(response.data).toEqual([])
      expect(response.error_code).toBe('')
    })

    it('MailboxesResponse contains array of mailboxes', () => {
      const response: MailboxesResponse = {
        data: [
          {
            id: 'mailbox-1',
            name: 'Account 1',
            mail_server: {
              type: IMAP,
              server: 'imap.example.com',
              port: 993,
              encryption: SOCKET_ENC_IMPLICIT_TLS,
              password: 'pass',
              username: 'user',
              auth_mech: AUTHMECH_PLAIN,
            },
            mail_outgoing: {
              type: SMTP,
              server: 'smtp.example.com',
              port: 587,
              encryption: SOCKET_ENC_EXPLICIT_TLS,
              password: 'pass',
              username: 'user',
              auth_mech: AUTHMECH_LOGIN,
            },
            receipts: {
              enabled: false,
              not_to_cc: 'never',
              outside_domain: 'never',
              other: 'never',
            },
          },
        ],
        error_code: '',
        error_msg: '',
      }
      expect(response.data).toHaveLength(1)
      expect(response.data[0].id).toBe('mailbox-1')
    })
  })

  // ── type safety ───────────────────────────────────────────────────────────

  describe('type safety', () => {
    it('RECEIPT_POLICY type is union of policy constants', () => {
      const policies: RECEIPT_POLICY[] = [
        RECEIPT_POLICY_NEVER,
        RECEIPT_POLICY_ALWAYS,
        RECEIPT_POLICY_ASK,
      ]
      expect(policies).toHaveLength(3)
    })
  })
})
