import type {
  UserGeneral,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import { GeneralSettings } from '../../store/user-preferences-types'
import { DateFormats } from '../../utils'
import { PP_DEFAULT } from '@/features/user-settings/store/user-preferences-api-types'

export function mapGeneralSettingsToApi(values: GeneralSettings): UserGeneral {
  return {
    SOGO_U_LANGUAGE: values.language,
    SOGO_U_TIME_FORMAT: values.timeStyle,
    SOGO_U_FIRST_MODULE: values.defaultView,
    SOGO_U_BROWSER_NOTIF: values.enableNotifications,
    SOGO_U_EXT_AVATAR_ENABLED: values.avatarEnabled,
    SOGO_U_PROFILE_PICTURE: values.profilePictureSource,
    SOGO_U_LONG_DATE: values.longDateStyle,
    SOGO_U_SHORT_DATE: values.shortDateStyle,
    SOGO_U_TIMEZONE: values.timezone,
  }
}

export function mapApiToGeneralSettings(
  data: UserPreferences
): GeneralSettings {
  return {
    language: data.USER_GENERAL.SOGO_U_LANGUAGE || 'en',
    timeStyle: data.USER_GENERAL.SOGO_U_TIME_FORMAT,
    defaultView: data.USER_GENERAL.SOGO_U_FIRST_MODULE,
    enableNotifications: data.USER_GENERAL.SOGO_U_BROWSER_NOTIF,
    avatarEnabled: data.USER_GENERAL.SOGO_U_EXT_AVATAR_ENABLED,
    profilePictureSource:
      data.USER_GENERAL.SOGO_U_PROFILE_PICTURE || PP_DEFAULT,
    longDateStyle:
      data.USER_GENERAL.SOGO_U_LONG_DATE || DateFormats.MMM_DD_YYYY,
    shortDateStyle:
      data.USER_GENERAL.SOGO_U_SHORT_DATE || DateFormats.DD_MMM_YY,
    timezone: data.USER_GENERAL.SOGO_U_TIMEZONE || 'UTC',
  }
}
