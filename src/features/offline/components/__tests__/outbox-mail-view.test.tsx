/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { OutboxRecord } from '../../types'
import OutboxMailView from '../outbox-mail-view'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('../../db/outbox-store', () => ({
  getOutboxAttachments: jest.fn(async () => []),
}))

jest.mock('@/features/mails/components/mail/mail-action-bar', () => ({
  __esModule: true,
  default: ({
    actions,
    onAction,
  }: {
    actions: { id?: string; title?: string }[]
    onAction: (idx: number, action: { id?: string }) => void
  }) => (
    <div>
      {actions.map((action, idx) => (
        <button
          key={action.id ?? idx}
          type="button"
          onClick={() => onAction(idx, action)}
        >
          {action.title}
        </button>
      ))}
    </div>
  ),
}))

jest.mock('@/features/mails/components/mail/mail-return-button', () => ({
  MailReturnButton: ({ onBack }: { onBack?: () => void }) => (
    <button type="button" onClick={onBack}>
      back
    </button>
  ),
}))

jest.mock('@/features/mails/components/mail/mail-subject', () => ({
  __esModule: true,
  default: ({ subject }: { subject: string }) => <h1>{subject}</h1>,
}))

jest.mock('@/features/mails/components/mail/mail-header-mobile', () => ({
  __esModule: true,
  default: ({ from }: { from: { email: string } }) => <div>{from.email}</div>,
}))

jest.mock('@/features/mails/components/mail/mail-content', () => ({
  __esModule: true,
  default: ({ body }: { body?: string }) => <div>{body}</div>,
}))

jest.mock('@/features/mails/components/mail/mail-contact-badge', () => ({
  ContactBadge: ({ contact }: { contact: { email: string } }) => (
    <span>{contact.email}</span>
  ),
}))

const item: OutboxRecord = {
  id: 'ob-1',
  userId: 'user@example.org',
  accountId: '0',
  mailKey: null,
  identityMail: 'me@example.org',
  signatureKey: null,
  to: [{ name: 'Alice', email: 'alice@example.org' }],
  cc: [],
  bcc: [],
  subject: 'Hello',
  body: '<p>Hi</p>',
  isPlainText: false,
  priority: 3,
  requestReadReceipt: false,
  attachmentIds: [],
  status: 'pending',
  retryCount: 0,
  lastError: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('OutboxMailView', () => {
  it('renders the queued message like a mail and exposes edit/delete', async () => {
    const onBack = jest.fn()
    const onEdit = jest.fn()
    const onDelete = jest.fn()
    const user = userEvent.setup()

    render(
      <OutboxMailView
        item={item}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('me@example.org')).toBeInTheDocument()
    expect(screen.getByText('<p>Hi</p>')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outbox_edit.string' }))
    expect(onEdit).toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: 'outbox_delete.string' })
    )
    expect(onDelete).toHaveBeenCalled()
  })

  it('does not show technical lastError text', () => {
    render(
      <OutboxMailView
        item={{ ...item, status: 'failed', lastError: 'HTTP 500' }}
        onBack={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('outbox_status_failed.string')).toBeInTheDocument()
    expect(screen.queryByText(/HTTP 500/)).not.toBeInTheDocument()
  })

  it('shows bcc recipients when present', () => {
    render(
      <OutboxMailView
        item={{
          ...item,
          bcc: [{ name: 'Secret', email: 'secret@example.org' }],
        }}
        onBack={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('bcc.string')).toBeInTheDocument()
    expect(screen.getByText('secret@example.org')).toBeInTheDocument()
  })
})
