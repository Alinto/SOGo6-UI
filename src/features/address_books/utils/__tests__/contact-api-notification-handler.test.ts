import { createContactApiNotificationHandler } from '../contact-api-notification-handler'

const mockDispatch = jest.fn()

jest.mock('@/features/notifications', () => ({
  addNotification: (payload: unknown) => ({ type: 'notifications/add', payload }),
}))

describe('createContactApiNotificationHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('dispatches success notification when mutation succeeds', async () => {
    const handler = createContactApiNotificationHandler(mockDispatch, {
      successTitle: 'Saved',
      successMessage: 'Contact saved',
    })

    await handler(undefined, { queryFulfilled: Promise.resolve({}) })

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: 'success',
          title: 'Saved',
          message: 'Contact saved',
        }),
      })
    )
  })

  it('dispatches error notification with mapped message key', async () => {
    const handler = createContactApiNotificationHandler(mockDispatch, {
      errorTitle: 'Error',
    })

    await handler(undefined, {
      queryFulfilled: Promise.reject({
        status: 404,
        data: { error_code: 'S000703', error_msg: 'Contact not found' },
      }),
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: 'error',
          title: 'Error',
          message: 'contact_api_errors.contact_not_found.string',
        }),
      })
    )
  })

  it('suppresses toast for conflict errors', async () => {
    const handler = createContactApiNotificationHandler(mockDispatch, {
      errorTitle: 'Error',
    })

    await handler(undefined, {
      queryFulfilled: Promise.reject({
        status: 409,
        data: { error_code: 'S000704', error_msg: 'Duplicate contact' },
      }),
    })

    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
