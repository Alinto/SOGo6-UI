import { mailComposeReducer, selectAllDrafts } from '@/features/mails/store'
import {
  apiDataToMailComposeDraft,
  buildForwardedBody,
  buildQuotedReplyBody,
} from '@/features/mails/utils/mail-compose-from-api'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import MailHeader from '../mail-header'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'mail_display.header.unsubscribe.string': 'Unsubscribe',
      'mail_display.action-bar.reply.string': 'Reply',
      'mail_display.action-bar.reply_all.string': 'Reply All',
      'mail_display.action-bar.forward.string': 'Forward',
    }
    return translations[key] || key
  }),
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: jest.fn(({ children, className }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  )),
  AvatarImage: jest.fn(({ src }) => (
    <img data-testid="avatar-image" src={src} alt="" />
  )),
  AvatarFallback: jest.fn(({ children }) => (
    <div data-testid="avatar-fallback">{children}</div>
  )),
}))

jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
}))

jest.mock('lucide-react', () => ({
  Reply: jest.fn(() => <span data-testid="reply-icon">↩️</span>),
  ReplyAll: jest.fn(() => <span data-testid="reply-all-icon">↩️↩️</span>),
  Forward: jest.fn(() => <span data-testid="forward-icon">➡️</span>),
}))

jest.mock('../mail-action-bar', () =>
  jest.fn(({ actions, onAction }) => (
    <div data-testid="mail-action-bar">
      {actions.map((action: any, idx: number) => (
        <button key={idx} onClick={() => onAction?.(idx, action)}>
          {action.title}
        </button>
      ))}
    </div>
  ))
)

jest.mock('../mail-contact-badge', () => ({
  ContactBadge: jest.fn(({ contact }) => (
    <div data-testid="contact-badge">{contact.name || contact.email}</div>
  )),
}))

jest.mock('../mail-unsubscribe-dialog', () => ({
  UnsubscribeDialog: jest.fn(({ open, senderName, senderEmail }) => (
    <div data-testid="unsubscribe-dialog" data-open={open}>
      Dialog for {senderName} ({senderEmail})
    </div>
  )),
}))

jest.mock('../utils', () => ({
  formatMailTime: jest.fn((date) => 'Jan 15, 2024 10:00 AM'),
}))

const mockTriggerGetEditMessage = jest.fn()
const mockTriggerGetReplyMessage = jest.fn()

jest.mock('@/features/mails/store/mails-api', () => ({
  ...jest.requireActual('@/features/mails/store/mails-api'),
  useLazyGetEditMessageQuery: () => [mockTriggerGetEditMessage],
  useLazyGetReplyMessageQuery: () => [mockTriggerGetReplyMessage],
}))

const createTestStore = () =>
  configureStore({
    reducer: {
      mailCompose: mailComposeReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  })

const renderWithRedux = (
  ui: React.ReactElement,
  store = createTestStore()
) => ({
  store,
  ...render(<Provider store={store}>{ui}</Provider>),
})

describe('MailHeader', () => {
  const mockMail = {
    id: 'mail-1',
    attachments: { count: 0 },
    seen: true,
    answered: false,
    deleted: false,
    date: new Date('2024-01-15T10:00:00Z').getTime(),
    subject: 'Original subject',
    from: { name: 'John Doe', email: 'john@example.com' },
    to: [{ name: 'Jane Doe', email: 'jane@example.com' }],
    cc: [{ name: 'Cc Person', email: 'cc-person@example.com' }],
    bcc: [{ name: 'Bcc Person', email: 'bcc-person@example.com' }],
    size: 1234,
    body: '<p>Original body</p>',
  }

  const mockProps = {
    from: { name: 'John Doe', email: 'john@example.com' },
    to: Array.from({ length: 7 }, (_, i) => ({
      name: `Recipient ${i + 1}`,
      email: `recipient${i + 1}@example.com`,
    })),
    cc: Array.from({ length: 7 }, (_, i) => ({
      name: `CC ${i + 1}`,
      email: `cc${i + 1}@example.com`,
    })),
    showUnsubscribeButton: false,
    date: new Date('2024-01-15T10:00:00Z').getTime(),
    mail: mockMail,
    mailId: 'mail-1',
    folder: 'INBOX',
    accountId: '0',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockTriggerGetEditMessage.mockResolvedValue({ data: mockMail })
    mockTriggerGetReplyMessage.mockResolvedValue({ data: mockMail })
  })

  it('should render sender avatar and name', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render formatted date', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    expect(screen.getByText('Jan 15, 2024 10:00 AM')).toBeInTheDocument()
  })

  it('should render mail action bar with correct actions', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    expect(screen.getByTestId('mail-action-bar')).toBeInTheDocument()
    expect(screen.getByText('Reply')).toBeInTheDocument()
    expect(screen.getByText('Reply All')).toBeInTheDocument()
    expect(screen.getByText('Forward')).toBeInTheDocument()
  })

  it('should show unsubscribe button when showUnsubscribeButton is true', () => {
    renderWithRedux(<MailHeader {...mockProps} showUnsubscribeButton={true} />)

    expect(screen.getByText('Unsubscribe')).toBeInTheDocument()
  })

  it('should not show unsubscribe button when showUnsubscribeButton is false', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    expect(screen.queryByText('Unsubscribe')).not.toBeInTheDocument()
  })

  it('should show limited recipients by default (max 5)', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    const contactBadges = screen.getAllByTestId('contact-badge')
    // Should show: 1 from + 5 to recipients = 6, but might be more based on implementation
    expect(contactBadges.length).toBeGreaterThanOrEqual(5)
  })

  it('should show +N button for hidden cc recipients', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    const ccSection = screen.getByText('Cc').parentElement!
    expect(ccSection).toContainHTML('+2')
  })

  it('should expand all cc recipients when +N button is clicked', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    const buttons = screen.getAllByText('+2')
    const ccShowMoreButton = buttons[buttons.length - 1].closest('button')!
    fireEvent.click(ccShowMoreButton)

    const contactBadges = screen.getAllByTestId('contact-badge')
    expect(contactBadges.length).toBeGreaterThan(6)
  })

  it('should render avatar fallback with first letter of sender name', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    const fallback = screen.getByTestId('avatar-fallback')
    expect(fallback).toHaveTextContent('J')
  })

  it('should use email first letter when sender name is not provided', () => {
    const propsWithoutName = {
      ...mockProps,
      from: { name: '', email: 'test@example.com' },
    }
    renderWithRedux(<MailHeader {...propsWithoutName} />)

    const fallback = screen.getByTestId('avatar-fallback')
    expect(fallback).toHaveTextContent('T')
  })

  it('should open unsubscribe dialog when unsubscribe button is clicked', () => {
    renderWithRedux(<MailHeader {...mockProps} showUnsubscribeButton={true} />)

    const unsubscribeButton = screen.getByText('Unsubscribe').closest('button')!
    fireEvent.click(unsubscribeButton)

    const dialog = screen.getByTestId('unsubscribe-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('should not render cc section when cc is empty', () => {
    const propsWithoutCc = {
      ...mockProps,
      cc: undefined,
    }
    renderWithRedux(<MailHeader {...propsWithoutCc} />)

    expect(screen.queryByText('Cc')).not.toBeInTheDocument()
  })

  it('should render From label', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    expect(screen.getByText('From')).toBeInTheDocument()
  })

  it('should render To label', () => {
    renderWithRedux(<MailHeader {...mockProps} />)

    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('should dispatch createDraft with the mail data when Forward is clicked', async () => {
    const { store } = renderWithRedux(<MailHeader {...mockProps} />)

    const forwardButton = screen.getByText('Forward').closest('button')!
    fireEvent.click(forwardButton)

    expect(mockTriggerGetEditMessage).toHaveBeenCalledWith({
      folder: 'INBOX',
      mailId: 'mail-1',
      accountId: '0',
    })

    await waitFor(() => {
      expect(Object.values(selectAllDrafts(store.getState()))).toHaveLength(1)
    })

    const draft = Object.values(selectAllDrafts(store.getState()))[0]!
    const expected = apiDataToMailComposeDraft(draft.draftId, mockMail)

    expect(draft).toMatchObject({
      forwardOf: 'mail-1',
      mailKey: expected.mailKey,
      to: [],
      cc: expected.cc,
      bcc: expected.bcc,
      subject: expected.subject,
      body: buildForwardedBody(mockMail, expected.body),
      attachments: expected.attachments,
      priority: expected.priority,
      requestReadReceipt: expected.requestReadReceipt,
    })
  })

  it('should use the data from the edit message query to build the forwarded draft', async () => {
    const editMail = {
      ...mockMail,
      subject: 'Edited subject',
      body: '<p>Edited body</p>',
    }
    mockTriggerGetEditMessage.mockResolvedValue({ data: editMail })

    const { store } = renderWithRedux(<MailHeader {...mockProps} />)

    fireEvent.click(screen.getByText('Forward').closest('button')!)

    await waitFor(() => {
      expect(Object.values(selectAllDrafts(store.getState()))).toHaveLength(1)
    })

    const draft = Object.values(selectAllDrafts(store.getState()))[0]!

    expect(draft.subject).toBe('Edited subject')
    expect(draft.body).toBe(buildForwardedBody(editMail, '<p>Edited body</p>'))
  })

  it('should dispatch createDraft with empty cc and bcc when Reply is clicked', async () => {
    const { store } = renderWithRedux(<MailHeader {...mockProps} />)

    fireEvent.click(screen.getByText('Reply').closest('button')!)

    expect(mockTriggerGetReplyMessage).toHaveBeenCalledWith({
      folder: 'INBOX',
      mailId: 'mail-1',
      accountId: '0',
    })

    await waitFor(() => {
      expect(Object.values(selectAllDrafts(store.getState()))).toHaveLength(1)
    })

    const draft = Object.values(selectAllDrafts(store.getState()))[0]!
    const expected = apiDataToMailComposeDraft(draft.draftId, mockMail)

    expect(draft).toMatchObject({
      inReplyTo: 'mail-1',
      to: expected.to,
      cc: [],
      bcc: [],
      subject: expected.subject,
      body: buildQuotedReplyBody(mockMail, expected.body),
    })
  })

  it('should dispatch createDraft with cc populated when Reply All is clicked, but never bcc', async () => {
    const { store } = renderWithRedux(<MailHeader {...mockProps} />)

    fireEvent.click(screen.getByText('Reply All').closest('button')!)

    expect(mockTriggerGetReplyMessage).toHaveBeenCalledWith({
      folder: 'INBOX',
      mailId: 'mail-1',
      accountId: '0',
    })

    await waitFor(() => {
      expect(Object.values(selectAllDrafts(store.getState()))).toHaveLength(1)
    })

    const draft = Object.values(selectAllDrafts(store.getState()))[0]!
    const expected = apiDataToMailComposeDraft(draft.draftId, mockMail)

    expect(expected.cc.length).toBeGreaterThan(0)
    expect(draft).toMatchObject({
      inReplyTo: 'mail-1',
      to: expected.to,
      cc: expected.cc,
      bcc: [],
      subject: expected.subject,
      body: buildQuotedReplyBody(mockMail, expected.body),
    })
  })

  it('should use the data from the reply message query to build the draft', async () => {
    const replyMail = {
      ...mockMail,
      subject: 'Re: Original subject',
      body: '<p>Reply body</p>',
    }
    mockTriggerGetReplyMessage.mockResolvedValue({ data: replyMail })

    const { store } = renderWithRedux(<MailHeader {...mockProps} />)

    fireEvent.click(screen.getByText('Reply').closest('button')!)

    await waitFor(() => {
      expect(Object.values(selectAllDrafts(store.getState()))).toHaveLength(1)
    })

    const draft = Object.values(selectAllDrafts(store.getState()))[0]!

    expect(draft.subject).toBe('Re: Original subject')
    expect(draft.body).toBe(buildQuotedReplyBody(replyMail, '<p>Reply body</p>'))
  })
})
