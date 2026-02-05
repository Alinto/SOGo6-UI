export interface UserGeneral {
  SOGO_U_LANGUAGE: string
  SOGO_U_TIME_FORMAT: string
  SOGO_U_FIRST_MODULE: string
  SOGO_U_BROWSER_NOTIF: boolean
  SOGO_U_REFRESH_MAIL_VIEW: number
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
  SOGO_U_NO_INVITATION: boolean
  SOGO_U_BUSY_OFF_HOURS: boolean
  SOGO_U_CALENDAR_DEFAULT: string
  SOGO_U_WORKDAY_END_TIME: string
  SOGO_U_TASK_DEFAULT_CLASS: string
  SOGO_U_WORKDAY_START_TIME: string
  SOGO_U_EVENT_DEFAULT_CLASS: string
  SOGO_U_CALENDAR_DAYS_SHOWED: number[]
  SOGO_U_JOURNAL_DEFAULT_CLASS: string
  SOGO_U_TASK_DEFAULT_REMINDER: string
  SOGO_U_EVENT_DEFAULT_REMINDER: string
  SOGO_U_CALENDAR_CREATION_NOTIF: boolean
  SOGO_U_CALENDAR_VIEW_FIRST_DAY: number
  SOGO_U_JOURNAL_DEFAULT_REMINDER: string
  SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: boolean
  SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: boolean
  SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: string
}

export interface UserPreferences {
  USER_GENERAL: UserGeneral
  USER_SECURITY: UserSecurity
  USER_CONTACT_GENERAL: UserContactGeneral
  USER_CALENDAR_GENERAL: UserCalendarGeneral
  USER_CONTACT_CATEGORY: Record<string, unknown>
  USER_CALENDAR_CATEGORY: Record<string, unknown>
  USER_MAIL_GENERAL_SETTINGS: Record<string, unknown>
}

export interface UserPreferencesResponse {
  data: UserPreferences
  error_code: string
  error_msg: string
}
