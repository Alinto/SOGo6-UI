import { addNotification } from '@/features/notifications'
import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'

jest.mock('@/features/notifications', () => ({
  addNotification: jest.fn((payload) => ({ type: 'notifications/add', payload })),
}))

jest.mock('@/features/notifications/api-notification-handler', () => ({
  createApiNotificationHandler: jest.fn(() => jest.fn()),
}))

jest.mock('@/lib/redux/api/api-slice', () => {
  const endpoints: Record<string, unknown> = {}

  const builder = {
    query: (def: unknown) => ({ ...(def as object), type: 'query' }),
    mutation: (def: unknown) => ({ ...(def as object), type: 'mutation' }),
  }

  return {
    MAIL_NOTIFICATIONS_SETTINGS_SLICE: 'mail_notifications_settings',
    apiSlice: {
      injectEndpoints: ({ endpoints: endpointsFn }: { endpoints: (b: typeof builder) => Record<string, unknown> }) => {
        const built = endpointsFn(builder)
        Object.assign(endpoints, built)
        return { endpoints, _endpointDefs: built }
      },
    },
  }
})

import {
  getMailNotifyUrl,
  mailNotificationSettingsApiEndpoints,
  wasNotificationPersisted,
} from '../mail-notifications-settings-api'
import { createEmptyNotification } from '../../mail-notifications-utils'

const defs = (mailNotificationSettingsApiEndpoints as unknown as {
  _endpointDefs: Record<
    string,
    {
      query?: (arg: unknown) => unknown
      transformResponse?: (raw: unknown) => unknown
      onQueryStarted?: (
        arg: unknown,
        api: { dispatch: unknown; queryFulfilled: Promise<unknown> }
      ) => Promise<void>
    }
  >
})._endpointDefs

describe('mail-notifications-settings-api', () => {
  describe('getMailNotifyUrl', () => {
    it('builds default account notify URL', () => {
      expect(getMailNotifyUrl()).toBe('mailboxes/0/notify')
    })

    it('builds custom account notify URL', () => {
      expect(getMailNotifyUrl('abc')).toBe('mailboxes/abc/notify')
    })
  })

  describe('getMailNotificationSettings', () => {
    it('queries the correct URL', () => {
      expect(defs.getMailNotificationSettings.query?.({ accountId: '0' })).toBe(
        'mailboxes/0/notify'
      )
    })

    it('transforms wrapped backend response', () => {
      const result = defs.getMailNotificationSettings.transformResponse?.({
        data: {
          notification: {
            enabled: true,
            notify_addresses: ['a@example.com'],
            notify_message: 'Alert',
          },
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(true)
      expect(result?.addresses).toEqual(['a@example.com'])
      expect(result?.message).toBe('Alert')
    })

    it('maps null notification to empty UI model', () => {
      const result = defs.getMailNotificationSettings.transformResponse?.({
        data: { notification: null },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(false)
      expect(result?.addresses).toEqual([])
    })
  })

  describe('updateMailNotificationSettings', () => {
    it('posts Notification payload with PascalCase key', () => {
      const notification = {
        ...createEmptyNotification(),
        enabled: true,
        addresses: ['a@example.com'],
        message: 'Alert',
      }

      const result = defs.updateMailNotificationSettings.query?.({
        accountId: '0',
        notification,
      })

      expect(result).toEqual({
        url: 'mailboxes/0/notify',
        method: 'POST',
        body: {
          Notification: expect.objectContaining({
            enabled: true,
            notify_addresses: ['a@example.com'],
            notify_message: 'Alert',
          }),
        },
      })
    })

    it('transforms POST response to UI model', () => {
      const result = defs.updateMailNotificationSettings.transformResponse?.({
        data: {
          filters: null,
          forward: null,
          vacation: null,
          notification: {
            enabled: true,
            notify_addresses: ['a@example.com'],
            notify_message: 'Alert',
          },
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(true)
      expect(result?.message).toBe('Alert')
    })
  })

  describe('wasNotificationPersisted', () => {
    it('returns true when disabled', () => {
      expect(
        wasNotificationPersisted(
          { enabled: false, notify_addresses: [], notify_message: '' },
          null
        )
      ).toBe(true)
    })

    it('returns false when enabled but response is missing', () => {
      expect(
        wasNotificationPersisted(
          {
            enabled: true,
            notify_addresses: ['a@example.com'],
            notify_message: 'Alert',
          },
          null
        )
      ).toBe(false)
    })
  })

  describe('onQueryStarted', () => {
    const mockNotificationFn = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      ;(createApiNotificationHandler as jest.Mock).mockReturnValue(
        mockNotificationFn
      )
    })

    it('dispatches success notification when enabled settings persist', async () => {
      const dispatch = jest.fn()
      const notification = {
        ...createEmptyNotification(),
        enabled: true,
        addresses: ['a@example.com'],
      }
      const queryFulfilled = Promise.resolve({
        data: { ...notification, enabled: true },
      })

      await defs.updateMailNotificationSettings.onQueryStarted?.(
        { accountId: '0', notification },
        { dispatch, queryFulfilled }
      )

      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'mail_notify.save.success.title.string',
        })
      )
    })

    it('dispatches warning when enabled settings were not persisted', async () => {
      const dispatch = jest.fn()
      const notification = {
        ...createEmptyNotification(),
        enabled: true,
        addresses: ['a@example.com'],
      }
      const queryFulfilled = Promise.resolve({
        data: { ...notification, enabled: false },
      })

      await defs.updateMailNotificationSettings.onQueryStarted?.(
        { accountId: '0', notification },
        { dispatch, queryFulfilled }
      )

      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'mail_notify.save.warning.title.string',
        })
      )
    })
  })
})
