import type {
  UserCalendarGeneral,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'

import { CalendarGeneralSettings } from '../../store/user-preferences-types'

export function calendarGeneralToApi(
  value: CalendarGeneralSettings
): UserCalendarGeneral {
  return {
    SOGO_U_CALENDAR_CREATION_NOTIF: value.calendarCreationNotif,
    SOGO_U_CALENDAR_VIEW_FIRST_DAY: value.calendarViewFirstDay,
    SOGO_U_WORKDAY_START_TIME: value.workdayStartTime,
    SOGO_U_WORKDAY_END_TIME: value.workdayEndTime,
    SOGO_U_BUSY_OFF_HOURS: value.busyOffHours,
    SOGO_U_CALENDAR_DAYS_SHOWED: value.calendarDaysShowed,
    SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: value.calendarWeekNumberFormat,
    SOGO_U_CALENDAR_DEFAULT: value.calendarDefault,
    SOGO_U_EVENT_DEFAULT_CLASS: value.eventDefaultClass,
    SOGO_U_TASK_DEFAULT_CLASS: value.taskDefaultClass,
    SOGO_U_JOURNAL_DEFAULT_CLASS: value.journalDefaultClass,
    SOGO_U_EVENT_DEFAULT_REMINDER: value.eventDefaultReminder,
    SOGO_U_TASK_DEFAULT_REMINDER: value.taskDefaultReminder,
    SOGO_U_JOURNAL_DEFAULT_REMINDER: value.journalDefaultReminder,
    SOGO_U_NO_INVITATION: value.noInvitation,
    SOGO_U_NO_INVITATION_WHITELIST: value.noInvitationWhitelist,
    SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: value.doNotSendInvitFromDav,
    SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: value.davForceSyncFromClient,
  }
}

export function apiToCalendarGeneral(
  value: UserPreferences
): CalendarGeneralSettings {
  return {
    calendarCreationNotif:
      value.USER_CALENDAR_GENERAL.SOGO_U_CALENDAR_CREATION_NOTIF,
    calendarViewFirstDay:
      value.USER_CALENDAR_GENERAL.SOGO_U_CALENDAR_VIEW_FIRST_DAY,
    workdayStartTime: value.USER_CALENDAR_GENERAL.SOGO_U_WORKDAY_START_TIME,
    workdayEndTime: value.USER_CALENDAR_GENERAL.SOGO_U_WORKDAY_END_TIME,
    busyOffHours: value.USER_CALENDAR_GENERAL.SOGO_U_BUSY_OFF_HOURS,
    calendarDaysShowed: value.USER_CALENDAR_GENERAL.SOGO_U_CALENDAR_DAYS_SHOWED,
    calendarWeekNumberFormat:
      value.USER_CALENDAR_GENERAL.SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT,
    calendarDefault: value.USER_CALENDAR_GENERAL.SOGO_U_CALENDAR_DEFAULT,
    eventDefaultClass: value.USER_CALENDAR_GENERAL.SOGO_U_EVENT_DEFAULT_CLASS,
    taskDefaultClass: value.USER_CALENDAR_GENERAL.SOGO_U_TASK_DEFAULT_CLASS,
    journalDefaultClass:
      value.USER_CALENDAR_GENERAL.SOGO_U_JOURNAL_DEFAULT_CLASS,
    eventDefaultReminder:
      value.USER_CALENDAR_GENERAL.SOGO_U_EVENT_DEFAULT_REMINDER,
    taskDefaultReminder:
      value.USER_CALENDAR_GENERAL.SOGO_U_TASK_DEFAULT_REMINDER,
    journalDefaultReminder:
      value.USER_CALENDAR_GENERAL.SOGO_U_JOURNAL_DEFAULT_REMINDER,
    noInvitation: value.USER_CALENDAR_GENERAL.SOGO_U_NO_INVITATION,
    noInvitationWhitelist:
      value.USER_CALENDAR_GENERAL.SOGO_U_NO_INVITATION_WHITELIST || [],
    doNotSendInvitFromDav:
      value.USER_CALENDAR_GENERAL.SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV,
    davForceSyncFromClient:
      value.USER_CALENDAR_GENERAL.SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT,
  }
}
