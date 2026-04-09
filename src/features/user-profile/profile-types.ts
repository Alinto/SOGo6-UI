/**
 * Types for the GET /profile endpoint
 */

// Raw API response structure
export interface ProfileApiResponse {
  data: {
    mailboxes: Mailbox[]
    prefs: UserPreferences
    ui: DomainUISettings
  }
  error_code: string
  error_msg: string
}

// Mail account structure (main or external)
export interface Mailbox {
  id: string // "0" = main account, alphanumeric hash = external account
  identities: Identity[]
  receipts: Record<string, unknown>
  certificates: Record<string, unknown>
  // Fields only for external accounts:
  name?: string
  mail_server?: MailServerConfig
  mail_outgoing?: MailServerConfig
}

export interface Identity {
  mail: string
  name: string
  replyTo: string
  isDefault: boolean
  signatures: Record<string, unknown>
}

export interface MailServerConfig {
  host: string
  port: number
  encryption: 'none' | 'ssl' | 'starttls'
  username: string
  password: string // Encrypted on backend side
}

// User preferences (organized by category)
export interface UserPreferences {
  USER_GENERAL?: {
    SOGO_U_LANGUAGE?: string
    SOGO_U_TIMEZONE?: string
    SOGO_U_TIME_FORMAT?: string
    SOGO_U_LONG_DATE?: string
    SOGO_U_SHORT_DATE?: string
    SOGO_U_FIRST_MODULE?: 'mail' | 'calendar' | 'contact' | 'last'
    SOGO_U_REFRESH_MAIL_VIEW?: 0 | 1 | 2 | 5 | 10 | 20 | 30 | 60
    SOGO_U_BROWSER_NOTIF?: boolean
    SOGO_U_EXT_AVATAR_ENABLED?: boolean
  }
  USER_SECURITY?: {
    SOGO_U_MFA_ENABLE?: boolean
    SOGO_U_MFA_METHOD?: string
    SOGO_U_MFA_PARAM?: Record<string, unknown>
    SOGO_U_PWD_RECOVERY?: string
    SOGO_U_PWD_QUESTION?: string
    SOGO_U_PWD_QUESTION_ANSWER?: string
    SOGO_U_PWD_SECOND_MAIL?: string
  }
  USER_CALENDAR_GENERAL?: {
    SOGO_U_CALENDAR_CREATION_NOTIF?: boolean
    SOGO_U_CALENDAR_VIEW_FIRST_DAY?: number
    SOGO_U_WORKDAY_START_TIME?: string
    SOGO_U_WORKDAY_END_TIME?: string
    SOGO_U_BUSY_OFF_HOURS?: boolean
    SOGO_U_CALENDAR_DAYS_SHOWED?: number[]
    SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT?: '%U' | '%W' | '%V'
    SOGO_U_CALENDAR_DEFAULT?: string
    SOGO_U_EVENT_DEFAULT_CLASS?: 'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'
    SOGO_U_TASK_DEFAULT_CLASS?: 'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'
    SOGO_U_JOURNAL_DEFAULT_CLASS?: 'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'
    SOGO_U_EVENT_DEFAULT_REMINDER?: string
    SOGO_U_TASK_DEFAULT_REMINDER?: string
    SOGO_U_JOURNAL_DEFAULT_REMINDER?: string
    SOGO_U_NO_INVITATION?: boolean
    SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV?: boolean
    SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT?: boolean
  }
  USER_CALENDAR_CATEGORY?: {
    SOGO_U_CALENDAR_CATEGORIES?: Array<[string, string, boolean]>
  }
  USER_CONTACT_GENERAL?: {
    SOGO_U_ADDRESSBOOK_CREATION_NOTIF?: boolean
  }
  USER_CONTACT_CATEGORY?: {
    SOGO_U_CONTACT_CATEGORIES?: Array<[string, string, boolean]>
  }
  USER_MAIL_GENERAL_SETTINGS?: Record<string, unknown>
  USER_MAIL_VIEW_SETTINGS?: Record<string, unknown>
  USER_EXTRA_SETTINGS?: Record<string, unknown>
}

// Domain settings (for UI feature toggles)
export interface DomainUISettings {
  // Auth
  SOGO_D_PWD_CHANGE_ENABLED?: boolean
  SOGO_D_PWD_RECOVERY?: boolean
  SOGO_D_PWD_RECOVERY_METHOD?: string[]
  SOGO_D_LOGIN_MFA?: boolean
  SOGO_D_LOGIN_MFA_METHOD?: string[]

  // User Module
  SOGO_D_MODULE_ACCESS?: string[]
  SOGO_D_FOLDER_DISABLE_EXPORT?: boolean | null
  SOGO_D_FOLDER_DISABLE_SHARING?: boolean | null
  SOGO_D_FOLDER_DISABLE_SHARING_ANY_AUTH?: boolean | null
  SOGO_D_AUTOCOMPLETION_MIN_LEN?: number
  SOGO_D_IDENTITIES_ENABLED?: boolean
  SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED?: boolean
  SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED?: boolean
  SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED?: boolean
  SOGO_D_ALLOW_EXT_MAIL_ACCOUNT?: boolean

  // Mail
  SOGO_D_MAIL_PURGE_ALLOW?: boolean
  SOGO_D_MAIL_PURGE_MIN_DATE?: number
  SOGO_D_MAIL_FILTERING_ENABLED?: boolean
  SOGO_D_VACATION_ENABLED?: boolean
  SOGO_D_VACATION_ALLOW_RESPONSE_ALWAYS?: boolean
  SOGO_D_FORWARD_ENABLED?: boolean
  SOGO_D_NOTIFY_ENABLED?: boolean
  SOGO_D_MAIL_MAX_RECIPIENT?: number

  // Calendar/Contact
  SOGO_D_CALDAV_ENABLED?: boolean
  SOGO_D_CALDAV_PUBLIC_ACCESS_ENABLE?: boolean
  SOGO_D_CARDAV_ENABLED?: boolean
  SOGO_D_CARDAV_PUBLIC_ACCESS_ENABLE?: boolean
  SOGO_D_JITSI_LINK_ENABLED?: boolean
  SOGO_D_JITSI_BASE_URL?: string | null
  SOGO_D_REMINDER_ALLOW_MAIL?: boolean

  // Password policy
  US_PWD_POLICY?: boolean
  US_PWD_LEN_MIN?: number
  US_PWD_LEN_MAX?: number
  US_PWD_UPPERCASE_MIN?: number
  US_PWD_LOWERCASE_MIN?: number
  US_PWD_DIGITS_MIN?: number
  US_PWD_SPECIAL_MIN?: number
  US_PWD_SPECIAL_ALLOWED?: string
  US_AUTO_SEARCH?: boolean
}

// Simplified type for component usage
export interface ProfileData {
  mailboxes: Mailbox[]
  prefs: UserPreferences
  ui: DomainUISettings
}
