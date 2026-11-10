import authReducer from '@/features/auth/components/store/auth.slice'
import { notificationsReducer } from '@/features/notifications'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { AttachmentDisplay, MailAttachment } from '../mail-attachment'
import type { ImapAttachmentPart, ImapAttachments } from '../types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { name?: string }) =>
    values?.name ? `${key} ${values.name}` : key,
  useFormatter: () => ({
    number: (value: number, options: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat('fr', options).format(value),
  }),
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ArrowDownToLine: ({ size }: { size?: number }) => (
    <div data-testid="arrow-icon" data-size={size} />
  ),
}))

// Mock tooltip
jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({
    children,
    content,
  }: {
    children: React.ReactNode
    content: string
  }) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  ),
}))

// Mock env service
jest.mock('@/lib/env-service', () => ({
  getCachedEnvVars: () => ({ REACT_APP_API_BASE_URL: 'http://localhost:5000' }),
}))

function createTestStore(token: string | null = 'test-token') {
  return configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationsReducer,
    },
    preloadedState: {
      auth: { token, user: null, rememberMe: false },
    },
  })
}

function renderWithStore(ui: ReactElement, store = createTestStore()) {
  return { store, ...render(<Provider store={store}>{ui}</Provider>) }
}

describe('MailAttachment', () => {
  const mockPart: ImapAttachmentPart = {
    partId: '1',
    name: 'test.pdf',
    contentType: 'application/pdf',
    size: 1024,
  }

  afterEach(() => {
    jest.restoreAllMocks()
    delete (global as { fetch?: typeof fetch }).fetch
  })

  it('renders without crashing', () => {
    expect(() =>
      renderWithStore(
        <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
      )
    ).not.toThrow()
  })

  it('shows the type badge, the size and the name', () => {
    renderWithStore(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('1,0 ko')).toBeInTheDocument()
    expect(screen.getByTestId('attachment-name')).toHaveTextContent(
      /^test\.pdf$/
    )
  })

  it('keeps the extension on one line with the last character of the name', () => {
    renderWithStore(
      <MailAttachment
        part={{ ...mockPart, name: 'A704-68517D00-D-7EC9C580.ics' }}
        attachmentsUrl="/mail/1/"
      />
    )
    const tail = screen.getByText('0.ics')
    expect(tail).toHaveClass('whitespace-nowrap')
    expect(screen.getByTestId('attachment-name')).toHaveTextContent(
      /^A704-68517D00-D-7EC9C580\.ics$/
    )
  })

  it('cuts long names in the middle and keeps the full name in a tooltip', () => {
    const longName = `${'a'.repeat(80)}-end.pdf`
    renderWithStore(
      <MailAttachment
        part={{ ...mockPart, name: longName }}
        attachmentsUrl="/mail/1/"
      />
    )
    const shortName = screen.getByTestId('attachment-name')
    expect(shortName).toHaveTextContent(/^a+….*-end\.pdf$/)
    // The short name is hidden from screen readers, which read the full one.
    expect(shortName).toHaveAttribute('aria-hidden', 'true')
    const fullName = screen.getByText(longName)
    expect(fullName).toHaveClass('sr-only')
    expect(fullName.parentElement).toHaveAttribute('tabindex', '0')
    expect(screen.getAllByTestId('tooltip')[0]).toHaveAttribute(
      'data-content',
      longName
    )
  })

  it('does not render a type badge when no type is known', () => {
    renderWithStore(
      <MailAttachment
        part={{ ...mockPart, name: 'README', contentType: '' }}
        attachmentsUrl="/mail/1/"
      />
    )
    expect(screen.getByTestId('attachment-name')).toHaveTextContent(/^README$/)
    expect(screen.queryByText('PDF')).not.toBeInTheDocument()
  })

  it('builds the download link href from the attachment URL', () => {
    renderWithStore(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    const link = screen.getByRole('link', {
      name: 'mail_display.content.download_attachment_named.string test.pdf',
    })
    expect(link).toHaveAttribute(
      'href',
      'http://localhost:5000/mail/1/test.pdf'
    )
  })

  it('downloads the attachment with the auth token and triggers a save', async () => {
    const blob = new Blob(['file content'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    }) as unknown as typeof fetch

    const { store } = renderWithStore(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    const link = screen.getByRole('link', {
      name: 'mail_display.content.download_attachment_named.string test.pdf',
    })

    // Stub DOM APIs only after the initial render so React's own DOM
    // creation isn't affected by the mock.
    const click = jest.fn()
    const anchorStub = {
      click,
      remove: jest.fn(),
    } as unknown as HTMLAnchorElement
    jest.spyOn(document, 'createElement').mockReturnValue(anchorStub)
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()

    await userEvent.click(link)

    await waitFor(() => expect(click).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/mail/1/test.pdf',
      { headers: { Authorization: 'Bearer test-token' } }
    )
    expect(anchorStub.download).toBe('test.pdf')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    expect(store.getState().notifications.items).toHaveLength(0)
  })

  it('dispatches an error notification when the download fails', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network error')) as unknown as typeof fetch

    const { store } = renderWithStore(
      <MailAttachment part={mockPart} attachmentsUrl="/mail/1/" />
    )
    const link = screen.getByRole('link', {
      name: 'mail_display.content.download_attachment_named.string test.pdf',
    })

    await userEvent.click(link)

    await waitFor(() =>
      expect(store.getState().notifications.items).toHaveLength(1)
    )
    expect(store.getState().notifications.items[0]).toMatchObject({
      type: 'error',
      title: 'mail_attachment.download_error.title.string',
      message: 'mail_attachment.download_error.message.string',
    })
  })
})

describe('AttachmentDisplay', () => {
  const mockAttachments: ImapAttachments = {
    count: 2,
    parts: [
      {
        partId: '1',
        name: 'file1.pdf',
        contentType: 'application/pdf',
        size: 1024,
      },
      {
        partId: '2',
        name: 'file2.txt',
        contentType: 'text/plain',
        size: 512,
      },
    ],
  }

  it('renders without crashing', () => {
    expect(() =>
      renderWithStore(
        <AttachmentDisplay
          attachments={mockAttachments}
          attachmentsUrl="/mail/1/"
        />
      )
    ).not.toThrow()
  })

  it('renders nothing when no attachments', () => {
    const emptyAttachments: ImapAttachments = {
      count: 0,
      parts: [],
    }
    const { container } = renderWithStore(
      <AttachmentDisplay
        attachments={emptyAttachments}
        attachmentsUrl="/mail/1/"
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
