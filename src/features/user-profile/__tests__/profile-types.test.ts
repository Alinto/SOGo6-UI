import '@testing-library/jest-dom'
import type {
  ProfileApiResponse,
  ProfileData,
  Mailbox,
  Identity,
  MailServerConfig,
  UserPreferences,
  DomainUISettings,
} from '../profile-types'

describe('Profile Types', () => {
  it('should export all type definitions without crashing', () => {
    // This test verifies that the module can be imported
    // Type checking happens at compile time
    expect(true).toBe(true)
  })

  it('should allow ProfileApiResponse to be defined', () => {
    const response: ProfileApiResponse = {
      data: {
        mailboxes: [],
        prefs: {},
        ui: {},
      },
      error_code: 'S000000',
      error_msg: 'No Error',
    }
    expect(response.error_code).toBe('S000000')
  })

  it('should allow ProfileData to be defined', () => {
    const data: ProfileData = {
      mailboxes: [],
      prefs: {},
      ui: {},
    }
    expect(data.mailboxes).toEqual([])
  })

  it('should allow Mailbox to be defined', () => {
    const mailbox: Mailbox = {
      id: '0',
      identities: [],
      receipts: {},
      certificates: {},
    }
    expect(mailbox.id).toBe('0')
  })

  it('should allow Mailbox with external account fields', () => {
    const mailbox: Mailbox = {
      id: 'abc123',
      name: 'External Account',
      identities: [],
      receipts: {},
      certificates: {},
      mail_server: {
        host: 'imap.example.com',
        port: 993,
        encryption: 'ssl',
        username: 'user@example.com',
        password: 'encrypted',
      },
    }
    expect(mailbox.name).toBe('External Account')
  })

  it('should allow Identity to be defined', () => {
    const identity: Identity = {
      mail: 'user@sogo.nu',
      name: 'John Doe',
      replyTo: 'user@sogo.nu',
      isDefault: true,
      signatures: {},
    }
    expect(identity.isDefault).toBe(true)
  })

  it('should allow MailServerConfig to be defined', () => {
    const config: MailServerConfig = {
      host: 'smtp.example.com',
      port: 587,
      encryption: 'starttls',
      username: 'user@example.com',
      password: 'encrypted',
    }
    expect(config.encryption).toBe('starttls')
  })

  it('should allow UserPreferences to be defined', () => {
    const prefs: UserPreferences = {
      USER_GENERAL: {
        SOGO_U_LANGUAGE: 'en',
        SOGO_U_TIMEZONE: 'Europe/Paris',
        SOGO_U_FIRST_MODULE: 'mail',
      },
      USER_SECURITY: {
        SOGO_U_MFA_ENABLE: false,
      },
    }
    expect(prefs.USER_GENERAL?.SOGO_U_LANGUAGE).toBe('en')
  })

  it('should allow DomainUISettings to be defined', () => {
    const ui: DomainUISettings = {
      SOGO_D_ALLOW_EXT_MAIL_ACCOUNT: true,
      SOGO_D_IDENTITIES_ENABLED: true,
      SOGO_D_MODULE_ACCESS: ['mail', 'calendar', 'contact'],
    }
    expect(ui.SOGO_D_ALLOW_EXT_MAIL_ACCOUNT).toBe(true)
  })

  it('should allow complete ProfileApiResponse structure', () => {
    const response: ProfileApiResponse = {
      data: {
        mailboxes: [
          {
            id: '0',
            identities: [
              {
                mail: 'user@sogo.nu',
                name: 'John Doe',
                replyTo: 'user@sogo.nu',
                isDefault: true,
                signatures: {},
              },
            ],
            receipts: {},
            certificates: {},
          },
        ],
        prefs: {
          USER_GENERAL: {
            SOGO_U_LANGUAGE: 'en',
            SOGO_U_TIMEZONE: 'Europe/Paris',
          },
        },
        ui: {
          SOGO_D_ALLOW_EXT_MAIL_ACCOUNT: true,
          SOGO_D_IDENTITIES_ENABLED: true,
        },
      },
      error_code: 'S000000',
      error_msg: 'No Error',
    }
    expect(response.data.mailboxes.length).toBe(1)
    expect(response.data.mailboxes[0].identities.length).toBe(1)
  })
})
