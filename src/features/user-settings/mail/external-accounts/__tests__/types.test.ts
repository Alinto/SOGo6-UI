import type {
  ExternalAccountDetail,
  ImapAccountCreate,
  ImapAccountListItem,
} from '../types'
import { DEFAULT_IMAP_VALUES } from '../types'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('external-accounts types', () => {
  // ── ImapAccountListItem interface ─────────────────────────────────────────

  describe('ImapAccountListItem interface', () => {
    it('can create valid ImapAccountListItem', () => {
      const item: ImapAccountListItem = {
        id: 'account-1',
        email: 'test@example.com',
        readReceipts: 'never',
      }
      expect(item.id).toBe('account-1')
      expect(item.email).toBe('test@example.com')
      expect(item.readReceipts).toBe('never')
    })

    it('supports never receipt policy', () => {
      const item: ImapAccountListItem = {
        id: 'account-1',
        email: 'test@example.com',
        readReceipts: 'never',
      }
      expect(item.readReceipts).toBe('never')
    })

    it('supports selective receipt policy', () => {
      const item: ImapAccountListItem = {
        id: 'account-1',
        email: 'test@example.com',
        readReceipts: 'selective',
      }
      expect(item.readReceipts).toBe('selective')
    })
  })

  // ── ExternalAccountDetail interface ───────────────────────────────────────

  describe('ExternalAccountDetail interface', () => {
    it('can create valid ExternalAccountDetail', () => {
      const detail: ExternalAccountDetail = {
        id: 'account-1',
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        useDefaultIdentity: true,
        readReceipts: 'never',
      }
      expect(detail.id).toBe('account-1')
      expect(detail.imapServer).toBe('imap.example.com')
      expect(detail.smtpAuth).toBe(true)
    })

    it('supports optional certificate fields', () => {
      const detail: ExternalAccountDetail = {
        id: 'account-1',
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        useDefaultIdentity: false,
        readReceipts: 'selective',
        certificateName: 'cert.p12',
        certificateFingerprint: 'abcd1234',
      }
      expect(detail.certificateName).toBe('cert.p12')
      expect(detail.certificateFingerprint).toBe('abcd1234')
    })

    it('supports different encryption types', () => {
      const encryptions: Array<'none' | 'ssl' | 'tls'> = ['none', 'ssl', 'tls']
      encryptions.forEach((encryption) => {
        const detail: ExternalAccountDetail = {
          id: 'account-1',
          imapServer: 'imap.example.com',
          imapPort: 993,
          imapEncryption: encryption,
          smtpServer: 'smtp.example.com',
          smtpPort: 587,
          smtpAuth: true,
          smtpEncryption: encryption,
          username: 'user',
          useDefaultIdentity: false,
          readReceipts: 'never',
        }
        expect(detail.imapEncryption).toBe(encryption)
        expect(detail.smtpEncryption).toBe(encryption)
      })
    })
  })

  // ── ImapAccountCreate interface ───────────────────────────────────────────

  describe('ImapAccountCreate interface', () => {
    it('can create valid ImapAccountCreate', () => {
      const create: ImapAccountCreate = {
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        password: 'password123',
        useDefaultIdentity: true,
        readReceipts: 'never',
      }
      expect(create.password).toBe('password123')
      expect(create.username).toBe('user')
    })

    it('supports optional certificate fields during creation', () => {
      const create: ImapAccountCreate = {
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        password: 'password123',
        useDefaultIdentity: false,
        readReceipts: 'selective',
        certificateFile: new File([''], 'cert.p12'),
        certificatePassword: 'cert-pass',
        certificateName: 'My Certificate',
      }
      expect(create.certificateFile).toBeDefined()
      expect(create.certificatePassword).toBe('cert-pass')
      expect(create.certificateName).toBe('My Certificate')
    })

    it('certificate file can be null', () => {
      const create: ImapAccountCreate = {
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        password: 'password123',
        useDefaultIdentity: true,
        readReceipts: 'never',
        certificateFile: null,
      }
      expect(create.certificateFile).toBeNull()
    })
  })

  // ── DEFAULT_IMAP_VALUES constant ──────────────────────────────────────────

  describe('DEFAULT_IMAP_VALUES constant', () => {
    it('exports DEFAULT_IMAP_VALUES', () => {
      expect(DEFAULT_IMAP_VALUES).toBeDefined()
    })

    it('has default IMAP port 993', () => {
      expect(DEFAULT_IMAP_VALUES.imapPort).toBe(993)
    })

    it('has default SSL encryption', () => {
      expect(DEFAULT_IMAP_VALUES.imapEncryption).toBe('ssl')
    })

    it('has default SMTP port 587', () => {
      expect(DEFAULT_IMAP_VALUES.smtpPort).toBe(587)
    })

    it('has default TLS encryption for SMTP', () => {
      expect(DEFAULT_IMAP_VALUES.smtpEncryption).toBe('tls')
    })

    it('SMTP auth is disabled by default', () => {
      expect(DEFAULT_IMAP_VALUES.smtpAuth).toBe(false)
    })

    it('has empty server strings', () => {
      expect(DEFAULT_IMAP_VALUES.imapServer).toBe('')
      expect(DEFAULT_IMAP_VALUES.smtpServer).toBe('')
    })

    it('has empty username', () => {
      expect(DEFAULT_IMAP_VALUES.username).toBe('')
    })

    it('useDefaultIdentity is false by default', () => {
      expect(DEFAULT_IMAP_VALUES.useDefaultIdentity).toBe(false)
    })

    it('read receipts default to never', () => {
      expect(DEFAULT_IMAP_VALUES.readReceipts).toBe('never')
    })

    it('has null certificate file', () => {
      expect(DEFAULT_IMAP_VALUES.certificateFile).toBeNull()
    })

    it('has empty certificate password', () => {
      expect(DEFAULT_IMAP_VALUES.certificatePassword).toBe('')
    })

    it('has empty certificate name', () => {
      expect(DEFAULT_IMAP_VALUES.certificateName).toBe('')
    })

    it('has empty certificate fingerprint', () => {
      expect(DEFAULT_IMAP_VALUES.certificateFingerprint).toBe('')
    })

    it('does not include password', () => {
      expect('password' in DEFAULT_IMAP_VALUES).toBe(false)
    })
  })

  // ── type relationships ────────────────────────────────────────────────────

  describe('type relationships', () => {
    it('ImapAccountCreate requires password field', () => {
      const create: ImapAccountCreate = {
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        password: 'required', // Required, unlike DEFAULT_IMAP_VALUES
        useDefaultIdentity: false,
        readReceipts: 'never',
      }
      expect('password' in create).toBe(true)
      expect(create.password).toBeDefined()
    })

    it('ExternalAccountDetail does not include password', () => {
      const detail: ExternalAccountDetail = {
        id: 'account-1',
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl',
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls',
        username: 'user',
        useDefaultIdentity: false,
        readReceipts: 'never',
      }
      expect('password' in detail).toBe(false)
    })
  })
})
