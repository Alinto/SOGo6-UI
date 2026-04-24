export const PUBLIC = 'PUBLIC'
export const CONFIDENTIAL = 'CONFIDENTIAL'
export const PRIVATE = 'PRIVATE'

export const IMAP = 'IMAP'
export const SMTP = 'SMTP'
export const TOTP = 'totp'

export const INLINE = 'inline'
export const ATTACHMENT = 'attachment'

export const ABOVE = 'above'
export const BELOW = 'below'
export const POPUP = 'popup'

export const HTML = 'html'
export const TEXT = 'text'

export const NEW = 'new'
export const REPLY = 'reply'
export const FORWARD = 'forward'

export const PP_DEFAULT = 'default'
export const PP_GRAVATAR = 'gravatar'
export const PP_LIBRAVATAR = 'libravatar'
export const PP_USERSOURCE = 'usersource'

export interface UserGeneral extends SkipNotification {
  SOGO_U_LANGUAGE: string
  SOGO_U_TIME_FORMAT: string
  SOGO_U_FIRST_MODULE: string
  SOGO_U_BROWSER_NOTIF: boolean
  SOGO_U_EXT_AVATAR_ENABLED: boolean
  SOGO_U_PROFILE_PICTURE:
    | typeof PP_DEFAULT
    | typeof PP_GRAVATAR
    | typeof PP_LIBRAVATAR
    | typeof PP_USERSOURCE
  SOGO_U_LONG_DATE: string
  SOGO_U_SHORT_DATE: string
  SOGO_U_TIMEZONE: string
}

export interface UserProfile extends SkipNotification {
  SOGO_U_PROFILE_PICTURE:
    | typeof PP_DEFAULT
    | typeof PP_GRAVATAR
    | typeof PP_LIBRAVATAR
    | typeof PP_USERSOURCE
}

export interface UserSecurity extends SkipNotification {
  SOGO_U_MFA_ENABLE: boolean
  SOGO_U_MFA_METHOD: typeof TOTP | null
  SOGO_U_MFA_PARAM?: Record<string, unknown>
}

export interface UserContactGeneral extends SkipNotification {
  SOGO_U_ADDRESSBOOK_CREATION_NOTIF: boolean
}

export interface UserCalendarGeneral extends SkipNotification {
  SOGO_U_CALENDAR_CREATION_NOTIF: boolean
  SOGO_U_CALENDAR_VIEW_FIRST_DAY: number
  SOGO_U_WORKDAY_START_TIME: string
  SOGO_U_WORKDAY_END_TIME: string
  SOGO_U_BUSY_OFF_HOURS: boolean
  SOGO_U_CALENDAR_DAYS_SHOWED: number[]
  SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: '%U' | '%W' | '%V'
  SOGO_U_CALENDAR_DEFAULT: string
  SOGO_U_EVENT_DEFAULT_CLASS:
    | typeof PUBLIC
    | typeof CONFIDENTIAL
    | typeof PRIVATE
  SOGO_U_TASK_DEFAULT_CLASS:
    | typeof PUBLIC
    | typeof CONFIDENTIAL
    | typeof PRIVATE
  SOGO_U_JOURNAL_DEFAULT_CLASS:
    | typeof PUBLIC
    | typeof CONFIDENTIAL
    | typeof PRIVATE
  SOGO_U_EVENT_DEFAULT_REMINDER: string | null
  SOGO_U_TASK_DEFAULT_REMINDER: string | null
  SOGO_U_JOURNAL_DEFAULT_REMINDER: string | null

  // Invitation
  SOGO_U_NO_INVITATION: boolean
  SOGO_U_NO_INVITATION_WHITELIST: string[]
  SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: boolean

  // DAV
  SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: boolean
}

export interface UserContactCategoryContent {
  name: string
  color: string
  is_default: boolean
}

export interface UserContactCategory {
  SOGO_U_CONTACT_CATEGORIES: UserContactCategoryContent[]
}

export interface UserCalendarCategoryContent {
  name: string
  color: string
  is_default: boolean
}

export interface UserCalendarCategory extends SkipNotification {
  SOGO_U_CALENDAR_CATEGORIES: UserCalendarCategoryContent[]
}

export interface UserContactPreferences extends SkipNotification {
  USER_CONTACT_GENERAL: UserContactGeneral
  USER_CONTACT_CATEGORY: UserContactCategory
}

export interface UserMailGeneral extends SkipNotification {
  SOGO_U_SHOW_ALL_UNSEEN_COUNT: boolean //
  SOGO_U_SORT_BY_THREAD: boolean //
  SOGO_U_MAIL_FORWARDING_FORMAT: typeof INLINE | typeof ATTACHMENT //
  SOGO_U_REPLY_POSITION: typeof BELOW | typeof ABOVE //
  SOGO_U_SIGNATURE_POSITION: typeof BELOW | typeof ABOVE //
  SOGO_U_USE_SIGNATURE: Array<typeof NEW | typeof REPLY | typeof FORWARD> //
  SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: typeof HTML | typeof TEXT //
  SOGO_U_MARK_READ_DELAY: number //
  SOGO_U_HIDE_INLINE_ATTACHMENT: boolean //

  SOGO_U_COMPOSE_MAIL_WINDOW: typeof INLINE | typeof POPUP //
  SOGO_U_ATTACHMENT_POSITION: typeof BELOW | typeof ABOVE
  SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: boolean
  SOGO_U_MAIL_ALLOW_RECEIPT: boolean
  SOGO_U_COLLECT_UNKNWON_ADDRESSES: boolean
  SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: string
}

export interface UserMailCategoryContent {
  name: string
  color: string
  is_default: boolean
}

export interface UserMailCategory extends SkipNotification {
  SOGO_U_MAIL_CATEGORIES: UserMailCategoryContent[]
}

export interface UserMailPreferences {
  USER_MAIL_GENERAL: UserMailGeneral
  USER_MAIL_CATEGORY: UserMailCategory
}

export interface UserPreferences {
  USER_GENERAL: UserGeneral
  USER_SECURITY: UserSecurity
  USER_CALENDAR_GENERAL: UserCalendarGeneral
  USER_CALENDAR_CATEGORY: UserCalendarCategory
  USER_CONTACT_GENERAL: UserContactGeneral
  USER_CONTACT_CATEGORY: UserContactCategory
  USER_MAIL_GENERAL_SETTINGS: UserMailGeneral
  USER_MAIL_CATEGORY_SETTINGS: UserMailCategory
}

export interface UserPreferencesResponse {
  data: UserPreferences
  error_code: string
  error_msg: string
}

export interface SkipNotification {
  _skipNotification?: boolean
}
