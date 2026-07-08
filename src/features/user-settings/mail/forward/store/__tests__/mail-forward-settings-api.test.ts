import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'

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
    MAIL_FORWARD_SETTINGS_SLICE: 'mail_forward_settings',
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
  getMailForwardUrl,
  mailForwardSettingsApiEndpoints,
} from '../mail-forward-settings-api'
import { createEmptyForward } from '../../mail-forward-utils'

const defs = (mailForwardSettingsApiEndpoints as unknown as {
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

describe('mail-forward-settings-api', () => {
  describe('getMailForwardUrl', () => {
    it('builds default account forward URL', () => {
      expect(getMailForwardUrl()).toBe('mailboxes/0/forward')
    })

    it('builds custom account forward URL', () => {
      expect(getMailForwardUrl('abc')).toBe('mailboxes/abc/forward')
    })
  })

  describe('getMailForwardSettings', () => {
    it('queries the correct URL', () => {
      expect(defs.getMailForwardSettings.query?.({ accountId: '0' })).toBe(
        'mailboxes/0/forward'
      )
    })

    it('transforms wrapped backend response', () => {
      const result = defs.getMailForwardSettings.transformResponse?.({
        data: {
          forward: {
            enabled: true,
            forward_address: ['a@example.com'],
            keep_copy: true,
            always_send: false,
          },
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(true)
      expect(result?.addresses).toEqual(['a@example.com'])
      expect(result?.keepCopy).toBe(true)
    })

    it('maps null forward to empty UI model', () => {
      const result = defs.getMailForwardSettings.transformResponse?.({
        data: { forward: null },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(false)
      expect(result?.addresses).toEqual([])
    })
  })

  describe('updateMailForwardSettings', () => {
    it('posts Forward payload with PascalCase key', () => {
      const forward = {
        ...createEmptyForward(),
        enabled: true,
        addresses: ['a@example.com'],
      }

      const result = defs.updateMailForwardSettings.query?.({
        accountId: '0',
        forward,
      })

      expect(result).toEqual({
        url: 'mailboxes/0/forward',
        method: 'POST',
        body: {
          Forward: expect.objectContaining({
            enabled: true,
            forward_address: ['a@example.com'],
          }),
        },
      })
    })

    it('transforms POST response to UI model', () => {
      const result = defs.updateMailForwardSettings.transformResponse?.({
        data: {
          filters: null,
          forward: {
            enabled: true,
            forward_address: ['a@example.com'],
            keep_copy: false,
            always_send: true,
          },
          vacation: null,
          notification: null,
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(true)
      expect(result?.alwaysSend).toBe(true)
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

    it('calls createApiNotificationHandler with mail forward messages', async () => {
      const dispatch = jest.fn()
      const queryFulfilled = Promise.resolve({ data: createEmptyForward() })

      await defs.updateMailForwardSettings.onQueryStarted?.(
        { accountId: '0', forward: createEmptyForward() },
        { dispatch, queryFulfilled }
      )

      expect(createApiNotificationHandler).toHaveBeenCalledWith(
        dispatch,
        expect.objectContaining({
          successTitle: 'mail_forward.save.success.title.string',
          successMessage: 'mail_forward.save.success.message.string',
          errorTitle: 'mail_forward.save.error.title.string',
          errorMessage: 'mail_forward.save.error.message.string',
        })
      )
      expect(mockNotificationFn).toHaveBeenCalled()
    })
  })
})
