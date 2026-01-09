// Summary list for main view
export interface ImapAccountListItem {
  id: string
  email: string
  readReceipts: 'never' | 'selective'
}

// Detail (edit mode - read only except readReceipts)
export interface ImapAccountDetail {
  id: string
  imapServer: string
  imapPort: number
  imapEncryption: 'none' | 'ssl' | 'tls'
  smtpServer: string
  smtpPort: number
  smtpAuth: boolean
  smtpEncryption: 'none' | 'ssl' | 'tls'
  username: string
  useDefaultIdentity: boolean
  readReceipts: 'never' | 'selective'
  certificateName?: string
  certificateFingerprint?: string
}

// Create (new mode - with password)
export interface ImapAccountCreate {
  imapServer: string
  imapPort: number
  imapEncryption: 'none' | 'ssl' | 'tls'
  smtpServer: string
  smtpPort: number
  smtpAuth: boolean
  smtpEncryption: 'none' | 'ssl' | 'tls'
  username: string
  password: string
  useDefaultIdentity: boolean
  readReceipts: 'never' | 'selective'
  certificateFile?: File | null
  certificatePassword?: string
  certificateName?: string
  certificateFingerprint?: string
}

// Default values for new account
export const DEFAULT_IMAP_VALUES: Omit<ImapAccountCreate, 'password'> = {
  imapServer: '',
  imapPort: 993,
  imapEncryption: 'ssl',
  smtpServer: '',
  smtpPort: 587,
  smtpAuth: false,
  smtpEncryption: 'tls',
  username: '',
  useDefaultIdentity: false,
  readReceipts: 'never',
  certificateFile: null,
  certificatePassword: '',
  certificateName: '',
  certificateFingerprint: '',
}
