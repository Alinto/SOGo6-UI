import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import MailSSEListener from '../mail-sse-listener'

const mockUseMailReceivedListener = jest.fn()

jest.mock('@/features/mails/hooks/use-current-folder', () => ({
  useCurrentFolder: jest.fn(() => ({ folderPath: 'INBOX' })),
}))

jest.mock('@/lib/redux/sse/hooks/use-mail-received-listener', () => ({
  useMailReceivedListener: (...args: unknown[]) =>
    mockUseMailReceivedListener(...args),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

describe('MailSSEListener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing', () => {
    const { container } = render(<MailSSEListener />)
    expect(container).toBeEmptyDOMElement()
  })

  it('subscribes to mail SSE events for the current folder', () => {
    render(<MailSSEListener />)

    expect(mockUseMailReceivedListener).toHaveBeenCalledWith(
      'INBOX',
      undefined,
      {
        defaultSubject: 'sse.defaultSubject.string',
        defaultSenderName: 'sse.defaultSender.string',
      }
    )
  })
})
