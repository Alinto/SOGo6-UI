import type {
  UserContactCategory,
  UserContactCategoryContent,
  UserContactPreferences,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'

import type { UserContactGeneral } from '@/features/user-settings/store/user-preferences-api-types'
import {
  ContactCategory,
  ContactGeneralSettings,
} from '../../store/user-preferences-types'

function contactCategoryToApi(
  value: ContactCategory
): UserContactCategoryContent {
  return {
    name: value.name,
    color: value.color,
    is_default: value.isDefault,
  }
}

export function mapContactCategorySettingsToApi(
  values: ContactGeneralSettings
): UserContactCategory {
  return {
    SOGO_U_CONTACT_CATEGORIES: values.categories.map((e) =>
      contactCategoryToApi(e)
    ),
  }
}

export function mapContactGeneralSettingsToApi(
  values: ContactGeneralSettings
): UserContactGeneral {
  return {
    SOGO_U_ADDRESSBOOK_CREATION_NOTIF: values.creationNotification,
  }
}

export function mapContactsSettingsToApi(
  values: ContactGeneralSettings
): UserContactPreferences {
  return {
    USER_CONTACT_GENERAL: mapContactGeneralSettingsToApi(values),
    USER_CONTACT_CATEGORY: mapContactCategorySettingsToApi(values),
  }
}

function apiToContactCategory(
  value: UserContactCategoryContent
): ContactCategory {
  return {
    name: value.name,
    color: value.color,
    isDefault: value.is_default,
  }
}

export function mapApiToContactGeneralSettings(
  data: UserPreferences
): ContactGeneralSettings {
  return {
    creationNotification:
      data.USER_CONTACT_GENERAL?.SOGO_U_ADDRESSBOOK_CREATION_NOTIF || false,
    categories:
      data.USER_CONTACT_CATEGORY?.SOGO_U_CONTACT_CATEGORIES?.map((e) =>
        apiToContactCategory(e)
      ) || [],
  }
}
