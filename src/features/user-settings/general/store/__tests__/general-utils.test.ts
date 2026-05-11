import {
  PP_DEFAULT,
  PP_GRAVATAR,
} from '@/features/user-settings/store/user-preferences-api-types'
import { DateFormats } from '../../../utils'
import {
  mapApiToGeneralSettings,
  mapGeneralSettingsToApi,
} from '../general-utils'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FULL_GENERAL_SETTINGS = {
  language: 'fr',
  timeStyle: '12',
  defaultView: 'mail',
  enableNotifications: true,
  avatarEnabled: true,
  profilePictureSource: PP_GRAVATAR,
  longDateStyle: DateFormats.MMM_DD_YYYY,
  shortDateStyle: DateFormats.DD_MMM_YY,
  timezone: 'Europe/Paris',
}

const FULL_USER_PREFERENCES = {
  USER_GENERAL: {
    SOGO_U_LANGUAGE: 'fr',
    SOGO_U_TIME_FORMAT: '12',
    SOGO_U_FIRST_MODULE: 'mail',
    SOGO_U_BROWSER_NOTIF: true,
    SOGO_U_EXT_AVATAR_ENABLED: true,
    SOGO_U_PROFILE_PICTURE: PP_GRAVATAR,
    SOGO_U_LONG_DATE: DateFormats.MMM_DD_YYYY,
    SOGO_U_SHORT_DATE: DateFormats.DD_MMM_YY,
    SOGO_U_TIMEZONE: 'Europe/Paris',
  },
}

// ── mapGeneralSettingsToApi ───────────────────────────────────────────────────

describe('mapGeneralSettingsToApi', () => {
  it('maps all fields correctly', () => {
    expect(mapGeneralSettingsToApi(FULL_GENERAL_SETTINGS)).toEqual({
      SOGO_U_LANGUAGE: 'fr',
      SOGO_U_TIME_FORMAT: '12',
      SOGO_U_FIRST_MODULE: 'mail',
      SOGO_U_BROWSER_NOTIF: true,
      SOGO_U_EXT_AVATAR_ENABLED: true,
      SOGO_U_PROFILE_PICTURE: PP_GRAVATAR,
      SOGO_U_LONG_DATE: DateFormats.MMM_DD_YYYY,
      SOGO_U_SHORT_DATE: DateFormats.DD_MMM_YY,
      SOGO_U_TIMEZONE: 'Europe/Paris',
    })
  })

  it('maps language correctly', () => {
    const result = mapGeneralSettingsToApi({ ...FULL_GENERAL_SETTINGS, language: 'de' })
    expect(result.SOGO_U_LANGUAGE).toBe('de')
  })

  it('maps timeStyle correctly', () => {
    const result = mapGeneralSettingsToApi({ ...FULL_GENERAL_SETTINGS, timeStyle: '24' })
    expect(result.SOGO_U_TIME_FORMAT).toBe('24')
  })

  it('maps enableNotifications correctly', () => {
    const result = mapGeneralSettingsToApi({ ...FULL_GENERAL_SETTINGS, enableNotifications: false })
    expect(result.SOGO_U_BROWSER_NOTIF).toBe(false)
  })

  it('maps avatarEnabled correctly', () => {
    const result = mapGeneralSettingsToApi({ ...FULL_GENERAL_SETTINGS, avatarEnabled: false })
    expect(result.SOGO_U_EXT_AVATAR_ENABLED).toBe(false)
  })

  it('maps profilePictureSource correctly', () => {
    const result = mapGeneralSettingsToApi({ ...FULL_GENERAL_SETTINGS, profilePictureSource: PP_DEFAULT })
    expect(result.SOGO_U_PROFILE_PICTURE).toBe(PP_DEFAULT)
  })

  it('maps timezone correctly', () => {
    const result = mapGeneralSettingsToApi({ ...FULL_GENERAL_SETTINGS, timezone: 'America/New_York' })
    expect(result.SOGO_U_TIMEZONE).toBe('America/New_York')
  })
})

// ── mapApiToGeneralSettings ───────────────────────────────────────────────────

describe('mapApiToGeneralSettings', () => {
  it('maps all fields correctly', () => {
    expect(mapApiToGeneralSettings(FULL_USER_PREFERENCES as any)).toEqual(FULL_GENERAL_SETTINGS)
  })

  it('maps language correctly', () => {
    const result = mapApiToGeneralSettings({
      ...FULL_USER_PREFERENCES,
      USER_GENERAL: { ...FULL_USER_PREFERENCES.USER_GENERAL, SOGO_U_LANGUAGE: 'es' },
    } as any)
    expect(result.language).toBe('es')
  })

  describe('defaults', () => {
    it('defaults language to "en" when missing', () => {
      const result = mapApiToGeneralSettings({
        USER_GENERAL: { ...FULL_USER_PREFERENCES.USER_GENERAL, SOGO_U_LANGUAGE: undefined },
      } as any)
      expect(result.language).toBe('en')
    })

    it('defaults profilePictureSource to PP_DEFAULT when missing', () => {
      const result = mapApiToGeneralSettings({
        USER_GENERAL: { ...FULL_USER_PREFERENCES.USER_GENERAL, SOGO_U_PROFILE_PICTURE: undefined },
      } as any)
      expect(result.profilePictureSource).toBe(PP_DEFAULT)
    })

    it('defaults longDateStyle to DateFormats.MMM_DD_YYYY when missing', () => {
      const result = mapApiToGeneralSettings({
        USER_GENERAL: { ...FULL_USER_PREFERENCES.USER_GENERAL, SOGO_U_LONG_DATE: undefined },
      } as any)
      expect(result.longDateStyle).toBe(DateFormats.MMM_DD_YYYY)
    })

    it('defaults shortDateStyle to DateFormats.DD_MMM_YY when missing', () => {
      const result = mapApiToGeneralSettings({
        USER_GENERAL: { ...FULL_USER_PREFERENCES.USER_GENERAL, SOGO_U_SHORT_DATE: undefined },
      } as any)
      expect(result.shortDateStyle).toBe(DateFormats.DD_MMM_YY)
    })

    it('defaults timezone to "UTC" when missing', () => {
      const result = mapApiToGeneralSettings({
        USER_GENERAL: { ...FULL_USER_PREFERENCES.USER_GENERAL, SOGO_U_TIMEZONE: undefined },
      } as any)
      expect(result.timezone).toBe('UTC')
    })
  })
})