import {
  ABOVE,
  ATTACHMENT,
  BELOW,
  CONFIDENTIAL,
  HTML,
  INLINE,
  POPUP,
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
  PRIVATE,
  PUBLIC,
  TEXT,
} from './user-preferences-api-types'

export interface GeneralSettings {
  language: string
  timezone: string
  shortDateStyle: string
  longDateStyle: string
  timeStyle: string
  defaultView: string
  enableNotifications: boolean
  avatarEnabled: boolean
  profilePictureSource:
    | typeof PP_DEFAULT
    | typeof PP_GRAVATAR
    | typeof PP_LIBRAVATAR
    | typeof PP_USERSOURCE
}

export interface ContactCategory {
  name: string
  color: string
  isDefault: boolean
}

export type ContactGeneralSettings = {
  categories: ContactCategory[]
  creationNotification: boolean
}

export interface MailGeneralSettings {
  collectUnknownAddresses: boolean //SOGO_U_COLLECT_UNKNWON_ADDRESSES #TODO
  collectUnknownAddressbookName: string //SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME #TODO
  mailAllowReceipt: boolean //SOGO_U_MAIL_ALLOW_RECEIPT #TODO
  mailfolderSubscribe: boolean //SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE #TODO
  attachmentPosition: typeof BELOW | typeof ABOVE //SOGO_U_ATTACHMENT_POSITION
  composeMailWindow: typeof INLINE | typeof POPUP //SOGO_U_COMPOSE_MAIL_WINDOW #TODO
  hideInlineAttachments: boolean //SOGO_U_HIDE_INLINE_ATTACHMENT
  countAllUnseen: boolean //SOGO_U_SHOW_ALL_UNSEEN_COUNT
  sortByThreads: boolean // SOGO_U_SORT_BY_THREAD
  autoMarkAsReadDelay: number // SOGO_U_MARK_READ_DELAY
  forwardMessages: typeof INLINE | typeof ATTACHMENT // SOGO_U_MAIL_FORWARDING_FORMAT
  startReply: typeof ABOVE | typeof BELOW //SOGO_U_REPLY_POSITION
  placeSignature: typeof ABOVE | typeof BELOW // SOGO_U_SIGNATURE_POSITION
  signOnNew: boolean //SOGO_U_USE_SIGNATURE
  signOnReply: boolean //SOGO_U_USE_SIGNATURE
  signOnForward: boolean //SOGO_U_USE_SIGNATURE
  composeIn: typeof HTML | typeof TEXT //SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT
}

export interface CalendarGeneralSettings {
  // General
  calendarCreationNotif: boolean | true // SOGO_U_CALENDAR_CREATION_NOTIF
  calendarViewFirstDay: number | 0 // SOGO_U_CALENDAR_VIEW_FIRST_DAY (0=Sunday..6=Saturday)
  workdayStartTime: string | '09:00' // SOGO_U_WORKDAY_START_TIME (e.g. "09:00")
  workdayEndTime: string | '18:00' // SOGO_U_WORKDAY_END_TIME (e.g. "18:00")
  busyOffHours: boolean | false // SOGO_U_BUSY_OFF_HOURS
  calendarDaysShowed: number[] | [0, 1, 2, 3, 4, 5, 6] // SOGO_U_CALENDAR_DAYS_SHOWED (array of 0..6)
  calendarWeekNumberFormat: '%U' | '%W' | '%V' // SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT
  calendarDefault: string | 'SOGO_DEFAULT_CALENDAR' // SOGO_U_CALENDAR_DEFAULT

  // Default classes and reminders
  eventDefaultClass: typeof PUBLIC | typeof CONFIDENTIAL | typeof PRIVATE // SOGO_U_EVENT_DEFAULT_CLASS
  taskDefaultClass: typeof PUBLIC | typeof CONFIDENTIAL | typeof PRIVATE // SOGO_U_TASK_DEFAULT_CLASS
  journalDefaultClass: typeof PUBLIC | typeof CONFIDENTIAL | typeof PRIVATE // SOGO_U_JOURNAL_DEFAULT_CLASS
  eventDefaultReminder: string | '0' // SOGO_U_EVENT_DEFAULT_REMINDER
  taskDefaultReminder: string | '0' // SOGO_U_TASK_DEFAULT_REMINDER
  journalDefaultReminder: string | '0' // SOGO_U_JOURNAL_DEFAULT_REMINDER

  // Invitation
  noInvitation: boolean // SOGO_U_NO_INVITATION
  noInvitationWhitelist: string[] // SOGO_U_NO_INVITATION_WHITELIST
  doNotSendInvitFromDav: boolean // SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV

  // DAV
  davForceSyncFromClient: boolean // SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT
}

export interface CalendarCategory {
  name: string
  color: string
  isDefault: boolean
}

export interface CalendarCategoriesSettings {
  categories: CalendarCategory[] //SOGO_U_CALENDAR_CATEGORIES
}

export interface MailCategory {
  name: string
  color: string
  isDefault: boolean
}

export interface MailCategoriesSettings {
  categories: MailCategory[] //SOGO_U_MAIL_CATEGORIES
}

export interface TotpSettings {
  totp: boolean
}
