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
    MAIL_VACATION_SETTINGS_SLICE: 'mail_vacation_settings',
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
  getMailVacationUrl,
  mailVacationSettingsApiEndpoints,
} from '../mail-vacation-settings-api'
import { createEmptyVacation } from '../../mail-vacation-utils'

const defs = (mailVacationSettingsApiEndpoints as unknown as {
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

describe('mail-vacation-settings-api', () => {
  describe('getMailVacationUrl', () => {
    it('builds default account vacation URL', () => {
      expect(getMailVacationUrl()).toBe('mailboxes/0/vacation')
    })

    it('builds custom account vacation URL', () => {
      expect(getMailVacationUrl('abc')).toBe('mailboxes/abc/vacation')
    })
  })

  describe('getMailVacationSettings', () => {
    it('queries the correct URL', () => {
      expect(defs.getMailVacationSettings.query({ accountId: '0' })).toBe(
        'mailboxes/0/vacation'
      )
    })

    it('transforms wrapped backend response', () => {
      const result = defs.getMailVacationSettings.transformResponse?.({
        data: {
          vacation: {
            enabled: 1,
            customSubjectEnabled: true,
            customSubject: 'Away',
            autoReplyText: 'I am away.',
            startDate: null,
            endDate: null,
            timezone: null,
            alwaysSend: 0,
            ignoreLists: false,
            startTime: null,
            endTime: null,
            weekdaysEnabled: false,
            days: [],
          },
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(true)
      expect(result?.customSubject).toBe('Away')
      expect(result?.autoReplyText).toBe('I am away.')
    })

    it('maps null vacation to empty UI model', () => {
      const result = defs.getMailVacationSettings.transformResponse?.({
        data: { vacation: null },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(false)
    })
  })

  describe('updateMailVacationSettings', () => {
    it('posts Vacation payload with PascalCase key', () => {
      const vacation = {
        ...createEmptyVacation(),
        enabled: true,
        autoReplyText: 'Away',
      }

      const result = defs.updateMailVacationSettings.query?.({
        accountId: '0',
        vacation,
        timezone: 'Europe/Paris',
      })

      expect(result).toEqual({
        url: 'mailboxes/0/vacation',
        method: 'POST',
        body: {
          Vacation: expect.objectContaining({
            enabled: 1,
            autoReplyText: 'Away',
            timezone: 'Europe/Paris',
          }),
        },
      })
    })

    it('transforms POST response to UI model', () => {
      const result = defs.updateMailVacationSettings.transformResponse?.({
        data: {
          filters: null,
          vacation: {
            enabled: 1,
            customSubjectEnabled: false,
            customSubject: '',
            autoReplyText: 'Away',
            startDate: null,
            endDate: null,
            timezone: 'Europe/Paris',
            alwaysSend: 0,
            ignoreLists: true,
            startTime: null,
            endTime: null,
            weekdaysEnabled: false,
            days: [],
          },
          forward: null,
          notification: null,
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      })

      expect(result?.enabled).toBe(true)
      expect(result?.ignoreLists).toBe(true)
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

    it('calls createApiNotificationHandler with mail vacation messages', async () => {
      const dispatch = jest.fn()
      const queryFulfilled = Promise.resolve({ data: createEmptyVacation() })

      await defs.updateMailVacationSettings.onQueryStarted?.(
        { accountId: '0', vacation: createEmptyVacation() },
        { dispatch, queryFulfilled }
      )

      expect(createApiNotificationHandler).toHaveBeenCalledWith(
        dispatch,
        expect.objectContaining({
          successTitle: 'mail_vacation.save.success.title.string',
          successMessage: 'mail_vacation.save.success.message.string',
          errorTitle: 'mail_vacation.save.error.title.string',
          errorMessage: 'mail_vacation.save.error.message.string',
        })
      )
      expect(mockNotificationFn).toHaveBeenCalled()
    })
  })
})
