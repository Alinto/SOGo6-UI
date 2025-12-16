import { createApiNotificationHandler } from '../api-notification-handler'
import { addNotification } from '../notifications-slice'

jest.mock('../notifications-slice', () => ({
  addNotification: jest.fn((payload) => ({
    type: 'ADD_NOTIFICATION',
    payload,
  })),
}))

describe('createApiNotificationHandler', () => {
  let mockDispatch: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch = jest.fn()
  })

  it('creates a handler function', () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'success.title',
      successMessage: 'success.message',
      errorTitle: 'error.title',
      errorMessage: 'error.message',
    })

    expect(typeof handler).toBe('function')
  })

  it('dispatches success notification on query success', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'success.title',
      successMessage: 'success.message',
      errorTitle: 'error.title',
      errorMessage: 'error.message',
    })

    const mockQueryFulfilled = Promise.resolve({ data: 'test' })

    await handler(undefined, { queryFulfilled: mockQueryFulfilled })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'success',
        title: 'success.title',
        message: 'success.message',
        duration: 3000,
      })
    )
  })

  it('dispatches error notification on query failure', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'success.title',
      successMessage: 'success.message',
      errorTitle: 'error.title',
      errorMessage: 'error.message',
    })

    const mockQueryFulfilled = Promise.reject(new Error('Query failed'))

    await handler(undefined, { queryFulfilled: mockQueryFulfilled })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'error',
        title: 'error.title',
        message: 'error.message',
        duration: 5000,
      })
    )
  })

  it('uses correct success duration (3000ms)', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'title',
      successMessage: 'message',
      errorTitle: 'error',
      errorMessage: 'error message',
    })

    await handler(undefined, {
      queryFulfilled: Promise.resolve({}),
    })

    const successCall = mockDispatch.mock.calls[0][0]
    expect(successCall.payload.duration).toBe(3000)
  })

  it('uses correct error duration (5000ms)', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'title',
      successMessage: 'message',
      errorTitle: 'error',
      errorMessage: 'error message',
    })

    await handler(undefined, {
      queryFulfilled: Promise.reject(new Error('Failed')),
    })

    const errorCall = mockDispatch.mock.calls[0][0]
    expect(errorCall.payload.duration).toBe(5000)
  })

  it('uses provided notification strings', async () => {
    const customStrings = {
      successTitle: 'custom.success.title',
      successMessage: 'custom.success.message',
      errorTitle: 'custom.error.title',
      errorMessage: 'custom.error.message',
    }

    const handler = createApiNotificationHandler(mockDispatch, customStrings)

    await handler(undefined, {
      queryFulfilled: Promise.resolve({}),
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'success',
        title: customStrings.successTitle,
        message: customStrings.successMessage,
        duration: 3000,
      })
    )
  })

  it('handles different error types', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'success',
      successMessage: 'success message',
      errorTitle: 'error',
      errorMessage: 'error message',
    })

    const errors = [
      new Error('Network error'),
      new TypeError('Type error'),
      { message: 'Custom error' },
    ]

    for (const error of errors) {
      mockDispatch.mockClear()
      await handler(undefined, {
        queryFulfilled: Promise.reject(error),
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        addNotification(
          expect.objectContaining({
            type: 'error',
            title: 'error',
            message: 'error message',
          })
        )
      )
    }
  })

  it('does not dispatch on success if query throws before settlement', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'success',
      successMessage: 'success message',
      errorTitle: 'error',
      errorMessage: 'error message',
    })

    const mockError = new Error('Fetch failed')
    const mockQueryFulfilled = new Promise((_, reject) => {
      setTimeout(() => reject(mockError), 100)
    })

    await handler(undefined, { queryFulfilled: mockQueryFulfilled })

    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification(
        expect.objectContaining({
          type: 'error',
        })
      )
    )
  })

  it('respects first-arg null/undefined', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'success',
      successMessage: 'success message',
      errorTitle: 'error',
      errorMessage: 'error message',
    })

    // Handler should work regardless of first argument
    await handler(null as any, {
      queryFulfilled: Promise.resolve({}),
    })

    expect(mockDispatch).toHaveBeenCalled()
  })

  it('works with RTK Query integration pattern', async () => {
    const handler = createApiNotificationHandler(mockDispatch, {
      successTitle: 'CALENDAR.creation.success.title',
      successMessage: 'CALENDAR.creation.success.message',
      errorTitle: 'CALENDAR.creation.error.title',
      errorMessage: 'CALENDAR.creation.error.message',
    })

    const rtkQueryArgs = {} // RTK Query passes args as first parameter
    const rtkQueryApi = {
      queryFulfilled: Promise.resolve({
        data: { id: '123', name: 'Calendar' },
      }),
    }

    await handler(rtkQueryArgs, rtkQueryApi as any)

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification(
        expect.objectContaining({
          type: 'success',
          title: 'CALENDAR.creation.success.title',
          message: 'CALENDAR.creation.success.message',
        })
      )
    )
  })
})
