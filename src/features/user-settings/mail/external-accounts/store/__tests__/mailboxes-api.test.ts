import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/features/notifications/api-notification-handler', () => ({
  createApiNotificationHandler: jest.fn(() => jest.fn()),
}))

jest.mock('@/lib/redux/api/api-slice', () => {
  const endpoints: Record<string, any> = {}

  const builder = {
    query: (def: any) => ({ ...def, type: 'query' }),
    mutation: (def: any) => ({ ...def, type: 'mutation' }),
  }

  return {
    MAILBOXES_SLICE: 'Mailboxes',
    apiSlice: {
      injectEndpoints: ({ endpoints: endpointsFn }: any) => {
        const built = endpointsFn(builder)
        Object.assign(endpoints, built)
        return { endpoints, _endpointDefs: built }
      },
    },
  }
})

// Import after mocks
import { userMailboxesApi } from '../mailboxes-api'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn()
const makeQueryFulfilled = (resolveValue = {}) =>
  Promise.resolve({ data: resolveValue })
const makeRejectedQuery = (error = new Error('Network error')) =>
  Promise.reject(error)

// Extract the raw endpoint definitions (query/mutation config objects)
const defs = (userMailboxesApi as any)._endpointDefs

// ── Endpoint query builders ───────────────────────────────────────────────────

describe('mailboxes-api endpoint query builders', () => {
  describe('getUserMailboxes', () => {
    it('queries the correct URL', () => {
      expect(defs.getUserMailboxes.query()).toBe('mailboxes')
    })
  })

  describe('getUserMailbox', () => {
    it('queries the correct URL with id', () => {
      expect(defs.getUserMailbox.query({ id: '42' })).toEqual({
        url: 'mailboxes/42',
      })
    })
  })

  describe('createUserMailbox', () => {
    it('posts to mailboxes with the correct body', () => {
      const post = { mail: 'a@b.com', name: 'Test', replyTo: '', isDefault: false, signatures: {} }
      expect(defs.createUserMailbox.query(post)).toEqual({
        url: 'mailboxes',
        method: 'POST',
        body: post,
      })
    })
  })

  describe('updateUserMailboxProfile', () => {
    it('patches the correct URL and strips id and _skipNotification from body', () => {
      const result = defs.updateUserMailboxProfile.query({
        id: '0',
        _skipNotification: true,
        identities: [],
      })
      expect(result).toEqual({
        url: 'mailboxes/0',
        method: 'PATCH',
        body: { identities: [] },
      })
      expect(result.body).not.toHaveProperty('id')
      expect(result.body).not.toHaveProperty('_skipNotification')
    })
  })

  describe('updateUserMailbox', () => {
    it('patches the correct URL and strips id from body', () => {
      const result = defs.updateUserMailbox.query({
        id: '5',
        identities: [],
        certificates: {},
        receipts: {},
      })
      expect(result).toEqual({
        url: 'mailboxes/5',
        method: 'PATCH',
        body: { identities: [], certificates: {}, receipts: {} },
      })
      expect(result.body).not.toHaveProperty('id')
    })
  })

  describe('deleteUserMailbox', () => {
    it('deletes the correct URL', () => {
      expect(defs.deleteUserMailbox.query({ id: '3' })).toEqual({
        url: 'mailboxes/3',
        method: 'DELETE',
      })
    })
  })
})

// ── mailboxesOnQueryStarted ───────────────────────────────────────────────────

describe('mailboxesOnQueryStarted', () => {
  const mockNotificationFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createApiNotificationHandler as jest.Mock).mockReturnValue(mockNotificationFn)
  })

  // Helper: call onQueryStarted directly from a built endpoint
  const callOnQueryStarted = (endpointName: string, arg: any, queryFulfilled: Promise<any>) =>
    defs[endpointName].onQueryStarted(arg, { dispatch: mockDispatch, queryFulfilled })

  describe('when _skipNotification is true', () => {
    it('does not call createApiNotificationHandler', async () => {
      await callOnQueryStarted(
        'updateUserMailboxProfile',
        { _skipNotification: true },
        makeQueryFulfilled()
      )
      expect(createApiNotificationHandler).not.toHaveBeenCalled()
    })
  })

  describe('when _skipNotification is false or absent', () => {
    it('calls createApiNotificationHandler with correct titles and messages', async () => {
      await callOnQueryStarted(
        'createUserMailbox',
        {},
        makeQueryFulfilled()
      )
      expect(createApiNotificationHandler).toHaveBeenCalledWith(
        mockDispatch,
        {
          successTitle: 'title.success.string',
          successMessage: 'message.success.string',
          errorTitle: 'title.error.string',
          errorMessage: 'message.error.string',
        }
      )
    })

    it('calls the returned notification function', async () => {
      await callOnQueryStarted('createUserMailbox', {}, makeQueryFulfilled())
      expect(mockNotificationFn).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ queryFulfilled: expect.any(Promise) })
      )
    })

    it('passes the queryFulfilled promise to the notification handler', async () => {
      const queryFulfilled = makeQueryFulfilled({ id: '1' })
      await callOnQueryStarted('updateUserMailbox', {}, queryFulfilled)
      expect(mockNotificationFn).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ queryFulfilled })
      )
    })
  })

})