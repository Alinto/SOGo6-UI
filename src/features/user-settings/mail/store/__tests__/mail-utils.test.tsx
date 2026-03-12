import {
  mapMailGeneralSettingsToApi,
  mapApiToMailGeneralSettings,
  mapMailCategorySettingsToApi,
  mapApiToMailCategorySettings,
} from '../mail-utils'
import type { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import type {
  MailGeneralSettings,
  MailCategoriesSettings,
} from '../../store/user-preferences-types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGeneralSettings(overrides: Partial<MailGeneralSettings> = {}): MailGeneralSettings {
  return {
    collectUnknownAddresses: false,
    collectUnknownAddressbookName: '',
    mailAllowReceipt: false,
    mailfolderSubscribe: false,
    autoMarkAsReadDelay: 0,
    composeMailWindow: 'popup',
    attachmentPosition: 'above',
    countAllUnseen: false,
    sortByThreads: false,
    hideInlineAttachments: false,
    forwardMessages: 'inline',
    startReply: 'above',
    placeSignature: 'above',
    signOnNew: false,
    signOnReply: false,
    signOnForward: false,
    composeIn: 'html',
    ...overrides,
  }
}

function makeApiPreferences(overrides: Record<string, any> = {}): UserPreferences {
  return {
    USER_MAIL_GENERAL_SETTINGS: {
      SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: false,
      SOGO_U_SHOW_ALL_UNSEEN_COUNT: false,
      SOGO_U_SORT_BY_THREAD: false,
      SOGO_U_MAIL_FORWARDING_FORMAT: 'inline',
      SOGO_U_ATTACHMENT_POSITION: 'above',
      SOGO_U_HIDE_INLINE_ATTACHMENT: false,
      SOGO_U_REPLY_POSITION: 'above',
      SOGO_U_SIGNATURE_POSITION: 'below',
      SOGO_U_USE_SIGNATURE: [],
      SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'html',
      SOGO_U_COMPOSE_MAIL_WINDOW: 'popup',
      SOGO_U_MARK_READ_DELAY: 0,
      SOGO_U_MAIL_ALLOW_RECEIPT: false,
      SOGO_U_COLLECT_UNKNWON_ADDRESSES: false,
      SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: '',
      ...overrides,
    },
    USER_MAIL_CATEGORY_SETTINGS: { SOGO_U_MAIL_CATEGORIES: [] },
  } as unknown as UserPreferences
}

function makeCategory(overrides = {}) {
  return { name: 'Work', color: '#3b82f6', isDefault: false, ...overrides }
}

function makeCategorySettings(overrides: Partial<MailCategoriesSettings> = {}): MailCategoriesSettings {
  return { categories: [], ...overrides }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('mail-utils', () => {

  // ── mapMailGeneralSettingsToApi ───────────────────────────────────────────

  describe('mapMailGeneralSettingsToApi', () => {
    it('maps all direct passthrough fields correctly', () => {
      const settings = makeGeneralSettings({
        mailfolderSubscribe: true,
        countAllUnseen: true,
        sortByThreads: true,
        forwardMessages: 'inline',
        startReply: 'below',
        placeSignature: 'below',
        autoMarkAsReadDelay: 30,
        mailAllowReceipt: true,
        collectUnknownAddresses: true,
        collectUnknownAddressbookName: 'My Book',
      })
      const result = mapMailGeneralSettingsToApi(settings)
      expect(result.SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE).toBe(true)
      expect(result.SOGO_U_SHOW_ALL_UNSEEN_COUNT).toBe(true)
      expect(result.SOGO_U_SORT_BY_THREAD).toBe(true)
      expect(result.SOGO_U_MAIL_FORWARDING_FORMAT).toBe('inline')
      expect(result.SOGO_U_REPLY_POSITION).toBe('below')
      expect(result.SOGO_U_SIGNATURE_POSITION).toBe('below')
      expect(result.SOGO_U_MARK_READ_DELAY).toBe(30)
      expect(result.SOGO_U_MAIL_ALLOW_RECEIPT).toBe(true)
      expect(result.SOGO_U_COLLECT_UNKNWON_ADDRESSES).toBe(true)
      expect(result.SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME).toBe('My Book')
    })

    describe('hideInlineAttachments → SOGO_U_ATTACHMENT_POSITION', () => {
      it('maps hideInlineAttachments: true to attachment position "below"', () => {
        const result = mapMailGeneralSettingsToApi(makeGeneralSettings({ hideInlineAttachments: true }))
        expect(result.SOGO_U_ATTACHMENT_POSITION).toBe('below')
      })

      it('maps hideInlineAttachments: false to attachment position "above"', () => {
        const result = mapMailGeneralSettingsToApi(makeGeneralSettings({ hideInlineAttachments: false }))
        expect(result.SOGO_U_ATTACHMENT_POSITION).toBe('above')
      })

      it('also sets SOGO_U_HIDE_INLINE_ATTACHMENT directly', () => {
        expect(mapMailGeneralSettingsToApi(makeGeneralSettings({ hideInlineAttachments: true })).SOGO_U_HIDE_INLINE_ATTACHMENT).toBe(true)
        expect(mapMailGeneralSettingsToApi(makeGeneralSettings({ hideInlineAttachments: false })).SOGO_U_HIDE_INLINE_ATTACHMENT).toBe(false)
      })
    })

    describe('composeIn enum mapping', () => {
      it('maps composeIn "html" to "html"', () => {
        expect(mapMailGeneralSettingsToApi(makeGeneralSettings({ composeIn: 'html' })).SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT).toBe('html')
      })

      it('maps composeIn "text" to "text"', () => {
        expect(mapMailGeneralSettingsToApi(makeGeneralSettings({ composeIn: 'text' })).SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT).toBe('text')
      })
    })

    describe('composeMailWindow enum mapping', () => {
      it('maps composeMailWindow "popup" to "popup"', () => {
        expect(mapMailGeneralSettingsToApi(makeGeneralSettings({ composeMailWindow: 'popup' })).SOGO_U_COMPOSE_MAIL_WINDOW).toBe('popup')
      })

      it('maps composeMailWindow "inline" to "inline"', () => {
        expect(mapMailGeneralSettingsToApi(makeGeneralSettings({ composeMailWindow: 'inline' })).SOGO_U_COMPOSE_MAIL_WINDOW).toBe('inline')
      })
    })

    describe('SOGO_U_USE_SIGNATURE array', () => {
      it('is empty when all sign-on flags are false', () => {
        const result = mapMailGeneralSettingsToApi(
          makeGeneralSettings({ signOnNew: false, signOnReply: false, signOnForward: false })
        )
        expect(result.SOGO_U_USE_SIGNATURE).toEqual([])
      })

      it('includes "new" when signOnNew is true', () => {
        const result = mapMailGeneralSettingsToApi(makeGeneralSettings({ signOnNew: true }))
        expect(result.SOGO_U_USE_SIGNATURE).toContain('new')
      })

      it('includes "reply" when signOnReply is true', () => {
        const result = mapMailGeneralSettingsToApi(makeGeneralSettings({ signOnReply: true }))
        expect(result.SOGO_U_USE_SIGNATURE).toContain('reply')
      })

      it('includes "forward" when signOnForward is true', () => {
        const result = mapMailGeneralSettingsToApi(makeGeneralSettings({ signOnForward: true }))
        expect(result.SOGO_U_USE_SIGNATURE).toContain('forward')
      })

      it('includes all three when all sign-on flags are true', () => {
        const result = mapMailGeneralSettingsToApi(
          makeGeneralSettings({ signOnNew: true, signOnReply: true, signOnForward: true })
        )
        expect(result.SOGO_U_USE_SIGNATURE).toEqual(['new', 'reply', 'forward'])
      })

      it('preserves order: new, reply, forward', () => {
        const result = mapMailGeneralSettingsToApi(
          makeGeneralSettings({ signOnNew: true, signOnReply: false, signOnForward: true })
        )
        expect(result.SOGO_U_USE_SIGNATURE).toEqual(['new', 'forward'])
      })

      it('does not include null values', () => {
        const result = mapMailGeneralSettingsToApi(
          makeGeneralSettings({ signOnNew: false, signOnReply: true, signOnForward: false })
        )
        expect(result.SOGO_U_USE_SIGNATURE).not.toContain(null)
      })
    })
  })

  // ── mapApiToMailGeneralSettings ───────────────────────────────────────────

  describe('mapApiToMailGeneralSettings', () => {
    it('maps all direct passthrough API fields to camelCase', () => {
      const data = makeApiPreferences({
        SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: true,
        SOGO_U_SHOW_ALL_UNSEEN_COUNT: true,
        SOGO_U_SORT_BY_THREAD: true,
        SOGO_U_MAIL_FORWARDING_FORMAT: 'asAttachment',
        SOGO_U_HIDE_INLINE_ATTACHMENT: true,
        SOGO_U_REPLY_POSITION: 'below',
        SOGO_U_SIGNATURE_POSITION: 'above',
        SOGO_U_MARK_READ_DELAY: 15,
        SOGO_U_MAIL_ALLOW_RECEIPT: true,
        SOGO_U_COLLECT_UNKNWON_ADDRESSES: true,
        SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: 'AddressBook',
      })
      const result = mapApiToMailGeneralSettings(data)
      expect(result.mailfolderSubscribe).toBe(true)
      expect(result.countAllUnseen).toBe(true)
      expect(result.sortByThreads).toBe(true)
      expect(result.forwardMessages).toBe('asAttachment')
      expect(result.hideInlineAttachments).toBe(true)
      expect(result.startReply).toBe('below')
      expect(result.placeSignature).toBe('above')
      expect(result.autoMarkAsReadDelay).toBe(15)
      expect(result.mailAllowReceipt).toBe(true)
      expect(result.collectUnknownAddresses).toBe(true)
      expect(result.collectUnknownAddressbookName).toBe('AddressBook')
    })

    describe('attachmentPosition mapping', () => {
      it('maps SOGO_U_ATTACHMENT_POSITION "below" to "below"', () => {
        const result = mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_ATTACHMENT_POSITION: 'below' }))
        expect(result.attachmentPosition).toBe('below')
      })

      it('maps SOGO_U_ATTACHMENT_POSITION "above" to "above"', () => {
        const result = mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_ATTACHMENT_POSITION: 'above' }))
        expect(result.attachmentPosition).toBe('above')
      })

      it('defaults to "above" for any other value', () => {
        const result = mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_ATTACHMENT_POSITION: undefined }))
        expect(result.attachmentPosition).toBe('above')
      })
    })

    describe('composeIn mapping', () => {
      it('maps SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT "html" to "html"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'html' })).composeIn).toBe('html')
      })

      it('maps SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT "text" to "text"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'text' })).composeIn).toBe('text')
      })

      it('defaults to "text" when value is not "html"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: undefined })).composeIn).toBe('text')
      })
    })

    describe('composeMailWindow mapping', () => {
      it('maps SOGO_U_COMPOSE_MAIL_WINDOW "popup" to "popup"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COMPOSE_MAIL_WINDOW: 'popup' })).composeMailWindow).toBe('popup')
      })

      it('maps SOGO_U_COMPOSE_MAIL_WINDOW "inline" to "inline"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COMPOSE_MAIL_WINDOW: 'inline' })).composeMailWindow).toBe('inline')
      })

      it('defaults to "inline" when value is not "popup"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COMPOSE_MAIL_WINDOW: undefined })).composeMailWindow).toBe('inline')
      })
    })

    describe('SOGO_U_USE_SIGNATURE → signOn* booleans', () => {
      it('sets signOnNew true when "new" is in the array', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_USE_SIGNATURE: ['new'] })).signOnNew).toBe(true)
      })

      it('sets signOnReply true when "reply" is in the array', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_USE_SIGNATURE: ['reply'] })).signOnReply).toBe(true)
      })

      it('sets signOnForward true when "forward" is in the array', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_USE_SIGNATURE: ['forward'] })).signOnForward).toBe(true)
      })

      it('sets all signOn flags false when array is empty', () => {
        const result = mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_USE_SIGNATURE: [] }))
        expect(result.signOnNew).toBe(false)
        expect(result.signOnReply).toBe(false)
        expect(result.signOnForward).toBe(false)
      })

      it('sets all signOn flags true when all values are present', () => {
        const result = mapApiToMailGeneralSettings(
          makeApiPreferences({ SOGO_U_USE_SIGNATURE: ['new', 'reply', 'forward'] })
        )
        expect(result.signOnNew).toBe(true)
        expect(result.signOnReply).toBe(true)
        expect(result.signOnForward).toBe(true)
      })

      it('falls back to empty array when SOGO_U_USE_SIGNATURE is undefined', () => {
        const result = mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_USE_SIGNATURE: undefined }))
        expect(result.signOnNew).toBe(false)
        expect(result.signOnReply).toBe(false)
        expect(result.signOnForward).toBe(false)
      })
    })

    describe('fallbacks when USER_MAIL_GENERAL_SETTINGS fields are missing', () => {
      it('defaults autoMarkAsReadDelay to 0', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_MARK_READ_DELAY: undefined })).autoMarkAsReadDelay).toBe(0)
      })

      it('defaults collectUnknownAddresses to false', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COLLECT_UNKNWON_ADDRESSES: undefined })).collectUnknownAddresses).toBe(false)
      })

      it('defaults collectUnknownAddressbookName to empty string', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: undefined })).collectUnknownAddressbookName).toBe('')
      })

      it('defaults mailAllowReceipt to false', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_MAIL_ALLOW_RECEIPT: undefined })).mailAllowReceipt).toBe(false)
      })

      it('defaults mailfolderSubscribe to false', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: undefined })).mailfolderSubscribe).toBe(false)
      })

      it('defaults forwardMessages to "inline"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_MAIL_FORWARDING_FORMAT: undefined })).forwardMessages).toBe('inline')
      })

      it('defaults startReply to "above"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_REPLY_POSITION: undefined })).startReply).toBe('above')
      })

      it('defaults placeSignature to "below"', () => {
        expect(mapApiToMailGeneralSettings(makeApiPreferences({ SOGO_U_SIGNATURE_POSITION: undefined })).placeSignature).toBe('below')
      })
    })
  })

  // ── mapMailCategorySettingsToApi ──────────────────────────────────────────

  describe('mapMailCategorySettingsToApi', () => {
    it('returns the correct top-level key', () => {
      expect(mapMailCategorySettingsToApi(makeCategorySettings())).toHaveProperty('SOGO_U_MAIL_CATEGORIES')
    })

    it('returns an empty array when categories is empty', () => {
      expect(mapMailCategorySettingsToApi(makeCategorySettings()).SOGO_U_MAIL_CATEGORIES).toEqual([])
    })

    it('maps a single category to API shape', () => {
      const settings = makeCategorySettings({
        categories: [makeCategory({ name: 'Inbox', color: '#ef4444', isDefault: true })],
      })
      expect(mapMailCategorySettingsToApi(settings).SOGO_U_MAIL_CATEGORIES).toEqual([
        { name: 'Inbox', color: '#ef4444', is_default: true },
      ])
    })

    it('maps multiple categories preserving order', () => {
      const settings = makeCategorySettings({
        categories: [
          makeCategory({ name: 'Work', color: '#3b82f6', isDefault: false }),
          makeCategory({ name: 'Personal', color: '#10b981', isDefault: true }),
          makeCategory({ name: 'Spam', color: '#ef4444', isDefault: false }),
        ],
      })
      const result = mapMailCategorySettingsToApi(settings).SOGO_U_MAIL_CATEGORIES
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ name: 'Work', color: '#3b82f6', is_default: false })
      expect(result[1]).toEqual({ name: 'Personal', color: '#10b981', is_default: true })
      expect(result[2]).toEqual({ name: 'Spam', color: '#ef4444', is_default: false })
    })

    it('converts camelCase isDefault to snake_case is_default', () => {
      const settings = makeCategorySettings({
        categories: [makeCategory({ isDefault: true })],
      })
      const [cat] = mapMailCategorySettingsToApi(settings).SOGO_U_MAIL_CATEGORIES
      expect(cat).toHaveProperty('is_default', true)
      expect(cat).not.toHaveProperty('isDefault')
    })

    it('preserves name and color values exactly', () => {
      const settings = makeCategorySettings({
        categories: [makeCategory({ name: 'Exact Name', color: '#abcdef' })],
      })
      const [cat] = mapMailCategorySettingsToApi(settings).SOGO_U_MAIL_CATEGORIES
      expect(cat.name).toBe('Exact Name')
      expect(cat.color).toBe('#abcdef')
    })
  })

  // ── mapApiToMailCategorySettings ──────────────────────────────────────────

  describe('mapApiToMailCategorySettings', () => {
    it('returns an empty categories array when SOGO_U_MAIL_CATEGORIES is empty', () => {
      expect(mapApiToMailCategorySettings(makeApiPreferences()).categories).toEqual([])
    })

    it('maps a single API category to MailCategory', () => {
      const data = {
        ...makeApiPreferences(),
        USER_MAIL_CATEGORY_SETTINGS: {
          SOGO_U_MAIL_CATEGORIES: [{ name: 'Work', color: '#ef4444', is_default: true }],
        },
      } as unknown as UserPreferences
      expect(mapApiToMailCategorySettings(data).categories).toEqual([
        { name: 'Work', color: '#ef4444', isDefault: true },
      ])
    })

    it('maps multiple API categories preserving order', () => {
      const data = {
        ...makeApiPreferences(),
        USER_MAIL_CATEGORY_SETTINGS: {
          SOGO_U_MAIL_CATEGORIES: [
            { name: 'Work', color: '#3b82f6', is_default: false },
            { name: 'Personal', color: '#10b981', is_default: true },
          ],
        },
      } as unknown as UserPreferences
      const { categories } = mapApiToMailCategorySettings(data)
      expect(categories).toHaveLength(2)
      expect(categories[0]).toEqual({ name: 'Work', color: '#3b82f6', isDefault: false })
      expect(categories[1]).toEqual({ name: 'Personal', color: '#10b981', isDefault: true })
    })

    it('converts snake_case is_default to camelCase isDefault', () => {
      const data = {
        ...makeApiPreferences(),
        USER_MAIL_CATEGORY_SETTINGS: {
          SOGO_U_MAIL_CATEGORIES: [{ name: 'X', color: '#000', is_default: true }],
        },
      } as unknown as UserPreferences
      const [cat] = mapApiToMailCategorySettings(data).categories
      expect(cat).toHaveProperty('isDefault', true)
      expect(cat).not.toHaveProperty('is_default')
    })

    it('falls back to empty array when USER_MAIL_CATEGORY_SETTINGS is undefined', () => {
      const data = { ...makeApiPreferences(), USER_MAIL_CATEGORY_SETTINGS: undefined } as unknown as UserPreferences
      expect(mapApiToMailCategorySettings(data).categories).toEqual([])
    })

    it('falls back to empty array when SOGO_U_MAIL_CATEGORIES is undefined', () => {
      const data = {
        ...makeApiPreferences(),
        USER_MAIL_CATEGORY_SETTINGS: {},
      } as unknown as UserPreferences
      expect(mapApiToMailCategorySettings(data).categories).toEqual([])
    })
  })

  // ── round-trip: categories ────────────────────────────────────────────────

  describe('round-trip: categories (toApi → fromApi)', () => {
    it('recovers original category settings after mapping to API and back', () => {
      const original = makeCategorySettings({
        categories: [
          makeCategory({ name: 'Work', color: '#3b82f6', isDefault: false }),
          makeCategory({ name: 'Personal', color: '#ef4444', isDefault: true }),
        ],
      })
      const apiShape = mapMailCategorySettingsToApi(original)
      const asPreferences = {
        ...makeApiPreferences(),
        USER_MAIL_CATEGORY_SETTINGS: apiShape,
      } as unknown as UserPreferences
      expect(mapApiToMailCategorySettings(asPreferences)).toEqual(original)
    })
  })
})