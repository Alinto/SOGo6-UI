/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import type { OutboxAttachmentRecord, OutboxRecord } from '../../types'
import OutboxPanel from '../outbox-panel'

const mockDispatch = jest.fn()
const mockHold = jest.fn()
const mockRelease = jest.fn()
const mockGetAttachments = jest.fn()

const item: OutboxRecord = {
  id: 'o1',
  userId: 'user@example.org',
  accountId: '0',
  mailKey: 'draft-1',
  identityMail: 'user@example.org',
  replyTo: null,
  signatureKey: null,
  to: [{ email: 'a@b.c' }],
  cc: [],
  bcc: [],
  subject: 'Queued',
  body: 'Body',
  isPlainText: false,
  priority: 3,
  requestReadReceipt: false,
  attachmentIds: ['a1', 'a2'],
  status: 'pending',
  retryCount: 0,
  lastError: null,
  createdAt: 1,
  updatedAt: 1,
}

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn(), warning: jest.fn() },
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ mailCompose: { drafts: {}, openDraftIds: [] } }),
}))

jest.mock('@/features/mails/store/mail-compose-selectors', () => ({
  selectAllDrafts: () => ({}),
  selectOpenDraftIds: () => [],
}))

jest.mock('@/features/offline/auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('@/features/offline/db/outbox-store', () => ({
  getOutboxAttachments: (...args: unknown[]) => mockGetAttachments(...args),
}))

jest.mock('@/features/offline/outbox/outbox-edit-hold', () => ({
  holdOutboxForEdit: (...args: unknown[]) => mockHold(...args),
  releaseOutboxForEdit: (...args: unknown[]) => mockRelease(...args),
}))

jest.mock('../../hooks/use-outbox', () => ({
  useOutboxList: () => ({ items: [item], remove: jest.fn() }),
}))

jest.mock('@/features/offline/components/outbox-list', () => ({
  __esModule: true,
  default: ({ onOpen }: { onOpen: (id: string) => void }) => (
    <button type="button" onClick={() => onOpen('o1')}>
      open
    </button>
  ),
}))

jest.mock('@/features/offline/components/outbox-mail-view', () => ({
  __esModule: true,
  default: ({ onEdit }: { onEdit: () => void }) => (
    <button type="button" onClick={onEdit}>
      edit
    </button>
  ),
}))

function blobAttachment(
  id: string,
  uploaded?: boolean
): OutboxAttachmentRecord {
  return {
    id,
    outboxId: 'o1',
    name: `${id}.txt`,
    size: 1,
    type: 'text/plain',
    blob: new Blob(['x']),
    uploaded,
  }
}

async function openAndEdit() {
  const user = userEvent.setup()
  render(<OutboxPanel />)
  await user.click(screen.getByText('open'))
  await user.click(screen.getByText('edit'))
}

describe('OutboxPanel edit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('restores only server-side attachments as completed, the others as pending', async () => {
    mockHold.mockResolvedValue(item)
    mockGetAttachments.mockResolvedValue([
      blobAttachment('a1', true),
      blobAttachment('a2'),
    ])

    await openAndEdit()

    await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    expect(mockHold).toHaveBeenCalledWith('user@example.org', 'o1')
    const action = mockDispatch.mock.calls[0]![0] as {
      payload: {
        initialData: {
          sourceOutboxId: string
          mailKey: string
          attachments: { name: string; uploadStatus: string; file: File }[]
        }
      }
    }
    const { initialData } = action.payload
    expect(initialData.sourceOutboxId).toBe('o1')
    expect(initialData.mailKey).toBe('draft-1')
    expect(
      initialData.attachments.map(({ name, uploadStatus }) => ({
        name,
        uploadStatus,
      }))
    ).toEqual([
      { name: 'a1.txt', uploadStatus: 'completed' },
      { name: 'a2.txt', uploadStatus: 'pending' },
    ])
    expect(initialData.attachments[1]!.file).toBeInstanceOf(File)
  })

  it('refuses to edit an item another tab is sending', async () => {
    mockHold.mockResolvedValue(null)

    await openAndEdit()

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('outbox_edit_unavailable.string')
    )
    expect(mockGetAttachments).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
