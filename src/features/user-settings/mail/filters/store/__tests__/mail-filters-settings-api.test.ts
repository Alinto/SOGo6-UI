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
    MAIL_FILTERS_SETTINGS_SLICE: 'mail_filters_settings',
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
  getMailFiltersUrl,
  mailFiltersSettingsApiEndpoints,
} from '../mail-filters-settings-api'

const defs = (mailFiltersSettingsApiEndpoints as unknown as { _endpointDefs: Record<string, { query?: Function; mutation?: Function; onQueryStarted?: Function }> })._endpointDefs

describe('mail-filters-settings-api', () => {
  describe('getMailFiltersUrl', () => {
    it('builds default account filters URL', () => {
      expect(getMailFiltersUrl()).toBe('mailboxes/0/filters')
    })

    it('builds custom account filters URL', () => {
      expect(getMailFiltersUrl('abc')).toBe('mailboxes/abc/filters')
    })
  })

  describe('getMailFiltersSettings', () => {
    it('queries the correct URL', () => {
      expect(defs.getMailFiltersSettings.query({ accountId: '0' })).toBe(
        'mailboxes/0/filters'
      )
    })

    it('transforms wrapped backend response', () => {
      const result = defs.getMailFiltersSettings.transformResponse?.({
        data: {
          filters: [
            {
              name: 'Filter 1',
              enabled: 1,
              rules: {
                op: 'and',
                rules: [
                  { field: 'from', operator: 'contains', value: 'test' },
                ],
              },
              actions: [{ method: 'keep', arguments: {} }],
            },
          ],
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result).toHaveLength(1)
      expect(result?.[0].name).toBe('Filter 1')
      expect(result?.[0].enabled).toBe(true)
    })
  })

  describe('updateMailFiltersSettings', () => {
    it('posts full filters payload', () => {
      const filters = [
        {
          id: '1',
          name: 'Filter 1',
          operator: 'AND' as const,
          enabled: true,
          rules: [
            {
              id: 'r1',
              field: 'from',
              condition: 'CONTAINS',
              value: 'test',
            },
          ],
          actions: [{ id: 'a1', action: 'keep', value: '' }],
        },
      ]

      const result = defs.updateMailFiltersSettings.query?.({
        accountId: '0',
        filters,
      })

      expect(result).toEqual({
        url: 'mailboxes/0/filters',
        method: 'POST',
        body: {
          filters: [
            {
              name: 'Filter 1',
              enabled: 1,
              rules: {
                op: 'and',
                rules: [
                  { field: 'from', operator: 'contains', value: 'test' },
                ],
              },
              actions: [{ method: 'keep', arguments: {} }],
            },
          ],
        },
      })
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

    it('calls createApiNotificationHandler with mail filter messages', async () => {
      const dispatch = jest.fn()
      const queryFulfilled = Promise.resolve({ data: [] })

      await defs.updateMailFiltersSettings.onQueryStarted?.(
        { accountId: '0', filters: [] },
        { dispatch, queryFulfilled }
      )

      expect(createApiNotificationHandler).toHaveBeenCalledWith(
        dispatch,
        expect.objectContaining({
          successTitle: 'mail_filters.save.success.title.string',
          successMessage: 'mail_filters.save.success.message.string',
          errorTitle: 'mail_filters.save.error.title.string',
          errorMessage: 'mail_filters.save.error.message.string',
        })
      )
      expect(mockNotificationFn).toHaveBeenCalled()
    })
  })
})
