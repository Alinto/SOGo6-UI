import type { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import type { ContactGeneralSettings } from '../../../store/user-preferences-types'
import {
  mapApiToContactGeneralSettings,
  mapContactCategorySettingsToApi,
  mapContactGeneralSettingsToApi,
  mapContactsSettingsToApi,
} from '../address-books-utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCategory(overrides = {}) {
  return { name: 'Personal', color: '#3b82f6', isDefault: false, ...overrides }
}

function makeSettings(
  overrides: Partial<ContactGeneralSettings> = {}
): ContactGeneralSettings {
  return { categories: [], creationNotification: false, ...overrides }
}

function makeApiPreferences(overrides = {}): UserPreferences {
  return {
    USER_CONTACT_GENERAL: { SOGO_U_ADDRESSBOOK_CREATION_NOTIF: false },
    USER_CONTACT_CATEGORY: { SOGO_U_CONTACT_CATEGORIES: [] },
    ...overrides,
  } as unknown as UserPreferences
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('address-books-utils', () => {
  // ── mapContactCategorySettingsToApi ────────────────────────────────────────

  describe('mapContactCategorySettingsToApi', () => {
    it('returns the correct top-level key', () => {
      const result = mapContactCategorySettingsToApi(makeSettings())
      expect(result).toHaveProperty('SOGO_U_CONTACT_CATEGORIES')
    })

    it('returns an empty array when categories is empty', () => {
      const result = mapContactCategorySettingsToApi(
        makeSettings({ categories: [] })
      )
      expect(result.SOGO_U_CONTACT_CATEGORIES).toEqual([])
    })

    it('maps a single category correctly', () => {
      const settings = makeSettings({
        categories: [
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
        ],
      })
      expect(
        mapContactCategorySettingsToApi(settings).SOGO_U_CONTACT_CATEGORIES
      ).toEqual([{ name: 'Work', color: '#ef4444', is_default: true }])
    })

    it('maps multiple categories preserving order', () => {
      const settings = makeSettings({
        categories: [
          makeCategory({
            name: 'Personal',
            color: '#3b82f6',
            isDefault: false,
          }),
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
          makeCategory({ name: 'Family', color: '#10b981', isDefault: false }),
        ],
      })
      const result =
        mapContactCategorySettingsToApi(settings).SOGO_U_CONTACT_CATEGORIES
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        name: 'Personal',
        color: '#3b82f6',
        is_default: false,
      })
      expect(result[1]).toEqual({
        name: 'Work',
        color: '#ef4444',
        is_default: true,
      })
      expect(result[2]).toEqual({
        name: 'Family',
        color: '#10b981',
        is_default: false,
      })
    })

    it('converts camelCase isDefault to snake_case is_default', () => {
      const settings = makeSettings({
        categories: [makeCategory({ isDefault: true })],
      })
      const [cat] =
        mapContactCategorySettingsToApi(settings).SOGO_U_CONTACT_CATEGORIES
      expect(cat).toHaveProperty('is_default', true)
      expect(cat).not.toHaveProperty('isDefault')
    })

    it('preserves name and color values exactly', () => {
      const settings = makeSettings({
        categories: [makeCategory({ name: 'Exact Name', color: '#123456' })],
      })
      const [cat] =
        mapContactCategorySettingsToApi(settings).SOGO_U_CONTACT_CATEGORIES
      expect(cat.name).toBe('Exact Name')
      expect(cat.color).toBe('#123456')
    })
  })

  // ── mapContactGeneralSettingsToApi ─────────────────────────────────────────

  describe('mapContactGeneralSettingsToApi', () => {
    it('returns the correct top-level key', () => {
      const result = mapContactGeneralSettingsToApi(makeSettings())
      expect(result).toHaveProperty('SOGO_U_ADDRESSBOOK_CREATION_NOTIF')
    })

    it('maps creationNotification: false correctly', () => {
      const result = mapContactGeneralSettingsToApi(
        makeSettings({ creationNotification: false })
      )
      expect(result.SOGO_U_ADDRESSBOOK_CREATION_NOTIF).toBe(false)
    })

    it('maps creationNotification: true correctly', () => {
      const result = mapContactGeneralSettingsToApi(
        makeSettings({ creationNotification: true })
      )
      expect(result.SOGO_U_ADDRESSBOOK_CREATION_NOTIF).toBe(true)
    })

    it('does not include category data', () => {
      const result = mapContactGeneralSettingsToApi(
        makeSettings({ categories: [makeCategory()] })
      )
      expect(result).not.toHaveProperty('SOGO_U_CONTACT_CATEGORIES')
    })
  })

  // ── mapContactsSettingsToApi ───────────────────────────────────────────────

  describe('mapContactsSettingsToApi', () => {
    it('returns both USER_CONTACT_GENERAL and USER_CONTACT_CATEGORY keys', () => {
      const result = mapContactsSettingsToApi(makeSettings())
      expect(result).toHaveProperty('USER_CONTACT_GENERAL')
      expect(result).toHaveProperty('USER_CONTACT_CATEGORY')
    })

    it('USER_CONTACT_GENERAL reflects creationNotification', () => {
      const result = mapContactsSettingsToApi(
        makeSettings({ creationNotification: true })
      )
      expect(
        result.USER_CONTACT_GENERAL.SOGO_U_ADDRESSBOOK_CREATION_NOTIF
      ).toBe(true)
    })

    it('USER_CONTACT_CATEGORY reflects mapped categories', () => {
      const settings = makeSettings({
        categories: [
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
        ],
      })
      const result = mapContactsSettingsToApi(settings)
      expect(result.USER_CONTACT_CATEGORY.SOGO_U_CONTACT_CATEGORIES).toEqual([
        { name: 'Work', color: '#ef4444', is_default: true },
      ])
    })

    it('returns empty categories array when no categories provided', () => {
      const result = mapContactsSettingsToApi(makeSettings({ categories: [] }))
      expect(result.USER_CONTACT_CATEGORY.SOGO_U_CONTACT_CATEGORIES).toEqual([])
    })

    it('delegates correctly to both sub-mappers simultaneously', () => {
      const settings = makeSettings({
        creationNotification: true,
        categories: [
          makeCategory({
            name: 'Personal',
            color: '#3b82f6',
            isDefault: false,
          }),
        ],
      })
      const result = mapContactsSettingsToApi(settings)
      expect(result).toEqual({
        USER_CONTACT_GENERAL: { SOGO_U_ADDRESSBOOK_CREATION_NOTIF: true },
        USER_CONTACT_CATEGORY: {
          SOGO_U_CONTACT_CATEGORIES: [
            { name: 'Personal', color: '#3b82f6', is_default: false },
          ],
        },
      })
    })
  })

  // ── mapApiToContactGeneralSettings ────────────────────────────────────────

  describe('mapApiToContactGeneralSettings', () => {
    it('maps SOGO_U_ADDRESSBOOK_CREATION_NOTIF true to creationNotification: true', () => {
      const data = makeApiPreferences({
        USER_CONTACT_GENERAL: { SOGO_U_ADDRESSBOOK_CREATION_NOTIF: true },
      })
      expect(mapApiToContactGeneralSettings(data).creationNotification).toBe(
        true
      )
    })

    it('maps SOGO_U_ADDRESSBOOK_CREATION_NOTIF false to creationNotification: false', () => {
      const data = makeApiPreferences({
        USER_CONTACT_GENERAL: { SOGO_U_ADDRESSBOOK_CREATION_NOTIF: false },
      })
      expect(mapApiToContactGeneralSettings(data).creationNotification).toBe(
        false
      )
    })

    it('falls back to false when USER_CONTACT_GENERAL is undefined', () => {
      const data = makeApiPreferences({ USER_CONTACT_GENERAL: undefined })
      expect(mapApiToContactGeneralSettings(data).creationNotification).toBe(
        false
      )
    })

    it('falls back to false when SOGO_U_ADDRESSBOOK_CREATION_NOTIF is undefined', () => {
      const data = makeApiPreferences({
        USER_CONTACT_GENERAL: {},
      })
      expect(mapApiToContactGeneralSettings(data).creationNotification).toBe(
        false
      )
    })

    it('maps a single API category to a ContactCategory', () => {
      const data = makeApiPreferences({
        USER_CONTACT_CATEGORY: {
          SOGO_U_CONTACT_CATEGORIES: [
            { name: 'Work', color: '#ef4444', is_default: true },
          ],
        },
      })
      expect(mapApiToContactGeneralSettings(data).categories).toEqual([
        { name: 'Work', color: '#ef4444', isDefault: true },
      ])
    })

    it('maps multiple API categories preserving order', () => {
      const data = makeApiPreferences({
        USER_CONTACT_CATEGORY: {
          SOGO_U_CONTACT_CATEGORIES: [
            { name: 'Personal', color: '#3b82f6', is_default: false },
            { name: 'Work', color: '#ef4444', is_default: true },
          ],
        },
      })
      const { categories } = mapApiToContactGeneralSettings(data)
      expect(categories).toHaveLength(2)
      expect(categories[0]).toEqual({
        name: 'Personal',
        color: '#3b82f6',
        isDefault: false,
      })
      expect(categories[1]).toEqual({
        name: 'Work',
        color: '#ef4444',
        isDefault: true,
      })
    })

    it('converts snake_case is_default to camelCase isDefault', () => {
      const data = makeApiPreferences({
        USER_CONTACT_CATEGORY: {
          SOGO_U_CONTACT_CATEGORIES: [
            { name: 'X', color: '#000', is_default: true },
          ],
        },
      })
      const [cat] = mapApiToContactGeneralSettings(data).categories
      expect(cat).toHaveProperty('isDefault', true)
      expect(cat).not.toHaveProperty('is_default')
    })

    it('falls back to an empty categories array when USER_CONTACT_CATEGORY is undefined', () => {
      const data = makeApiPreferences({ USER_CONTACT_CATEGORY: undefined })
      expect(mapApiToContactGeneralSettings(data).categories).toEqual([])
    })

    it('falls back to an empty array when SOGO_U_CONTACT_CATEGORIES is undefined', () => {
      const data = makeApiPreferences({
        USER_CONTACT_CATEGORY: {},
      })
      expect(mapApiToContactGeneralSettings(data).categories).toEqual([])
    })

    it('returns both fields together correctly', () => {
      const data = makeApiPreferences({
        USER_CONTACT_GENERAL: { SOGO_U_ADDRESSBOOK_CREATION_NOTIF: true },
        USER_CONTACT_CATEGORY: {
          SOGO_U_CONTACT_CATEGORIES: [
            { name: 'Personal', color: '#3b82f6', is_default: false },
          ],
        },
      })
      expect(mapApiToContactGeneralSettings(data)).toEqual({
        creationNotification: true,
        categories: [{ name: 'Personal', color: '#3b82f6', isDefault: false }],
      })
    })
  })

  // ── round-trip ────────────────────────────────────────────────────────────

  describe('round-trip (toApi → fromApi)', () => {
    it('recovers the original settings after mapping to API and back', () => {
      const original = makeSettings({
        creationNotification: true,
        categories: [
          makeCategory({
            name: 'Personal',
            color: '#3b82f6',
            isDefault: false,
          }),
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
        ],
      })

      const apiShape = mapContactsSettingsToApi(original)

      // Reconstruct a UserPreferences-shaped object from the API output
      const asPreferences = makeApiPreferences({
        USER_CONTACT_GENERAL: apiShape.USER_CONTACT_GENERAL,
        USER_CONTACT_CATEGORY: apiShape.USER_CONTACT_CATEGORY,
      })

      expect(mapApiToContactGeneralSettings(asPreferences)).toEqual(original)
    })
  })
})
