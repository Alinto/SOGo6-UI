export interface UserGeneral {
  SOGO_U_LANGUAGE: string
  SOGO_U_TIME_FORMAT: string
  SOGO_U_FIRST_MODULE: string
  SOGO_U_BROWSER_NOTIF: boolean
  SOGO_U_EXT_AVATAR_ENABLED: boolean
  SOGO_U_LONG_DATE: string
  SOGO_U_SHORT_DATE: string
  SOGO_U_TIMEZONE: string
}

export interface UserSecurity {
  SOGO_U_MFA_ENABLE: boolean
}

export interface UserContactGeneral {
  SOGO_U_ADDRESSBOOK_CREATION_NOTIF: boolean
}

export interface UserCalendarGeneral {
  SOGO_U_CALENDAR_CREATION_NOTIF: boolean
  SOGO_U_CALENDAR_VIEW_FIRST_DAY: number
  SOGO_U_WORKDAY_START_TIME: string
  SOGO_U_WORKDAY_END_TIME: string
  SOGO_U_BUSY_OFF_HOURS: boolean
  SOGO_U_CALENDAR_DAYS_SHOWED: number[]
  SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: '%U' | '%W' | '%V'
  SOGO_U_CALENDAR_DEFAULT: string
  SOGO_U_EVENT_DEFAULT_CLASS: 'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'
  SOGO_U_TASK_DEFAULT_CLASS: 'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'
  SOGO_U_JOURNAL_DEFAULT_CLASS: 'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'
  SOGO_U_EVENT_DEFAULT_REMINDER: string
  SOGO_U_TASK_DEFAULT_REMINDER: string
  SOGO_U_JOURNAL_DEFAULT_REMINDER: string

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
  can_be_translated: boolean
}

export interface UserContactCategory {
  SOGO_U_CONTACT_CATEGORIES: UserContactCategoryContent[]
}

export interface UserContactPreferences {
  USER_CONTACT_GENERAL: UserContactGeneral
  USER_CONTACT_CATEGORY: UserContactCategory
}

export interface UserMailGeneral {
  SOGO_U_SHOW_ALL_UNSEEN_COUNT: boolean //
  SOGO_U_SORT_BY_THREAD: boolean //
  SOGO_U_MAIL_FORWARDING_FORMAT: 'inline' | 'attachment' //
  SOGO_U_REPLY_POSITION: 'below' | 'above' //
  SOGO_U_SIGNATURE_POSITION: 'below' | 'above' //
  SOGO_U_USE_SIGNATURE: Array<'new' | 'reply' | 'forward'> //
  SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'html' | 'text' //
  SOGO_U_MARK_READ_DELAY: number //
  SOGO_U_HIDE_INLINE_ATTACHMENT: boolean //
  SOGO_U_DISPLAY_REMOTE_INLINE: boolean //

  SOGO_U_DRAFT_AUTOSAVE: number
  SOGO_U_COMPOSE_MAIL_WINDOW: 'inline' | 'popup'
  SOGO_U_ATTACHMENT_POSITION: 'below' | 'above'
  SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: boolean
  SOGO_U_MAIL_ALLOW_RECEIPT: boolean
  SOGO_U_COLLECT_UNKNWON_ADDRESSES: boolean
  SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: string
}
export interface UserPreferences {
  USER_GENERAL: UserGeneral
  USER_SECURITY: UserSecurity
  USER_CALENDAR_GENERAL: UserCalendarGeneral
  USER_CALENDAR_CATEGORY: Record<string, unknown>
  USER_CONTACT_GENERAL: UserContactGeneral
  USER_CONTACT_CATEGORY: UserContactCategory
  USER_MAIL_GENERAL_SETTINGS: UserMailGeneral
}

export interface UserPreferencesResponse {
  data: UserPreferences
  error_code: string
  error_msg: string
}
