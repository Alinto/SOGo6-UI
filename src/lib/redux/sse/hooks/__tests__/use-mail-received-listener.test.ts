import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { useMailReceivedListener } from '@/lib/redux/sse/hooks/use-mail-received-listener'

const mockDispatch = jest.fn()
const mockSubscribe = jest.fn()
const mockUnsubscribe = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/features/mails/store/mails-api', () => ({}))

jest.mock('@/lib/redux/api/api-slice', () => {
  const updateQueryData = jest.fn(() => ({ type: 'test/updateQueryData' }))
  return {
    apiSlice: {
      util: { updateQueryData },
    },
  }
})

jest.mock('@/lib/redux/sse/sse-api', () => ({
  getSSEServiceInstance: jest.fn(),
}))

const { getSSEServiceInstance } = jest.requireMock(
  '@/lib/redux/sse/sse-api'
) as { getSSEServiceInstance: jest.Mock }

function TestHost({ folder }: { folder?: string }) {
  useMailReceivedListener(folder ?? 'INBOX')
  return React.createElement('div', { 'data-testid': 'host' })
}

describe('useMailReceivedListener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubscribe.mockReturnValue(mockUnsubscribe)
    ;(getSSEServiceInstance as jest.Mock).mockReturnValue({
      subscribe: mockSubscribe,
    })
  })

  describe('basic rendering', () => {
    it('renders host without throwing', () => {
      const { getByTestId } = render(React.createElement(TestHost))
      expect(getByTestId('host')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('subscribes to mail:received when SSE service is ready', async () => {
      render(React.createElement(TestHost, { folder: 'Sent' }))
      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalledWith(
          'mail:received',
          expect.any(Function)
        )
      })
    })

    it('invokes handler and dispatches when a mail:received event is emitted', async () => {
      let handler: ((msg: unknown) => void) | undefined
      mockSubscribe.mockImplementation((event, cb) => {
        if (event === 'mail:received') {
          handler = cb as (msg: unknown) => void
        }
        return mockUnsubscribe
      })

      render(React.createElement(TestHost, { folder: 'INBOX' }))
      await waitFor(() => expect(handler).toBeDefined())
      handler?.({
        type: 'mail:received',
        data: { id: '99', subject: 'Hello', preview: 'Hi' },
      })
      await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    })

    it('unsubscribes on unmount', async () => {
      const { unmount } = render(React.createElement(TestHost))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalled())
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
