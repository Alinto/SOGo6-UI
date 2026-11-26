import { act, renderHook } from '@testing-library/react'
import { closeDraft } from '../../store'
import { MAIL_PRIORITY_NORMAL } from '../../store/mail-compose-slice'

const mockDispatch = jest.fn()
const mockSendMail = jest.fn()
const mockUploadAttachment = jest.fn()
const mockUseSendMailMutation = jest.fn()
const mockBuildComposeMailPayload = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('../../store/mail-api', () => ({
  useSendMailMutation: () => mockUseSendMailMutation(),
  useUploadAttachmentMutation: () => [
    mockUploadAttachment,
    { isLoading: false },
  ],
}))

jest.mock('../../utils/build-compose-mail-payload', () => ({
  buildComposeMailPayload: (...args: unknown[]) =>
    mockBuildComposeMailPayload(...args),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

const mockEnqueueOutbox = jest.fn()
let mockOutboxEnabled = false
const mockProbeNetwork = jest.fn(async (..._args: unknown[]) => true)

jest.mock('@/features/offline/flags', () => ({
  isPwaOutboxEnabled: () => mockOutboxEnabled,
}))

jest.mock('@/features/offline/network/probe', () => ({
  probeNetwork: (...args: unknown[]) => mockProbeNetwork(...args),
}))

jest.mock('@/features/offline/auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('@/features/offline/outbox/outbox-coordinator', () => ({
  enqueueOutbox: (...args: unknown[]) => mockEnqueueOutbox(...args),
  isOutboxItemGoneError: (error: unknown) =>
    error instanceof Error && error.name === 'OutboxItemGoneError',
}))

jest.mock('@/features/offline/db/drafts-store', () => ({
  deleteLocalDraft: jest.fn(async () => undefined),
}))

const mockDeleteOutboxItem = jest.fn(async (..._args: unknown[]) => undefined)
const mockGetOutboxItem = jest.fn(
  async (..._args: unknown[]): Promise<unknown> => ({ id: 'o1' })
)

jest.mock('@/features/offline/db/outbox-store', () => ({
  deleteOutboxItem: (...args: unknown[]) => mockDeleteOutboxItem(...args),
  getOutboxItem: (...args: unknown[]) => mockGetOutboxItem(...args),
}))

jest.mock('@/features/offline/outbox/outbox-events', () => ({
  notifyOutboxChanged: jest.fn(),
}))

const mockReleaseOutboxForEdit = jest.fn()

jest.mock('@/features/offline/outbox/outbox-edit-hold', () => ({
  releaseOutboxForEdit: (...args: unknown[]) =>
    mockReleaseOutboxForEdit(...args),
}))

import { toast } from 'sonner'
import { trackDraftSave } from '../../utils/draft-save-tracker'
import { useComposeSend } from '../use-compose-send'

const baseFields = {
  draftId: 'draft-1',
  accountId: 'acc-1',
  mailKey: null as string | null,
  selectedIdentity: { mail: 'me@sogo.nu', replyTo: '' } as any,
  toRecipients: [{ email: 'to@sogo.nu' }],
  ccRecipients: [],
  bccRecipients: [],
  subject: 'Subject',
  body: 'Body',
  requestReadReceipt: false,
  selectedPriority: MAIL_PRIORITY_NORMAL as 1 | 2 | 3 | 4 | 5,
  isPlainText: false,
}

describe('useComposeSend', () => {
  beforeEach(() => {
    mockOutboxEnabled = false
    mockProbeNetwork.mockResolvedValue(true)
    mockEnqueueOutbox.mockReset()
    mockDispatch.mockReset()
    mockUseSendMailMutation.mockReturnValue([
      mockSendMail,
      { isLoading: false },
    ])
    mockSendMail.mockResolvedValue({ data: {} })
    mockUploadAttachment.mockResolvedValue({
      data: { data: { key: 'tmp-key', filename: 'a.txt' } },
    })
    mockBuildComposeMailPayload.mockReturnValue({ mocked: 'payload' })
    mockUploadAttachment.mockClear()
    mockSendMail.mockClear()
    mockDeleteOutboxItem.mockClear()
    mockGetOutboxItem.mockReset()
    mockGetOutboxItem.mockResolvedValue({ id: 'o1' })
    mockReleaseOutboxForEdit.mockClear()
    jest.mocked(toast.warning).mockClear()
  })

  it('shows the no-recipient alert and does not send when there are no recipients', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, toRecipients: [] })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.showNoRecipientAlert).toBe(true)
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('shows the "both" empty-content alert when subject and body are blank', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: '  ', body: ' ' })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.emptyContentAlert).toBe('both')
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('shows the "subject" empty-content alert when only the subject is blank', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: '', body: 'Hi' })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.emptyContentAlert).toBe('subject')
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('shows the "body" empty-content alert when only the body is blank', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: 'Hi', body: '' })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(result.current.emptyContentAlert).toBe('body')
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('sends directly and closes the draft when recipients, subject and body are all present', async () => {
    const { result } = renderHook(() => useComposeSend(baseFields))

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockSendMail).toHaveBeenCalledWith({
      accountId: 'acc-1',
      mailKey: null,
      mail: { mocked: 'payload' },
    })
    expect(mockDispatch).toHaveBeenCalledWith(
      closeDraft({ draftId: 'draft-1' })
    )
  })

  it('does nothing when there is no selected identity', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, selectedIdentity: null })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockSendMail).not.toHaveBeenCalled()
    expect(result.current.showNoRecipientAlert).toBe(false)
    expect(result.current.emptyContentAlert).toBeNull()
  })

  it('does not close the draft when sendMail returns an error', async () => {
    mockSendMail.mockResolvedValue({ error: { status: 500 } })
    const { result } = renderHook(() => useComposeSend(baseFields))

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('handleConfirmSendAnyway clears the empty-content alert and sends', async () => {
    const { result } = renderHook(() =>
      useComposeSend({ ...baseFields, subject: '', body: '' })
    )

    await act(async () => {
      await result.current.handleSend()
    })
    expect(result.current.emptyContentAlert).toBe('both')

    await act(async () => {
      await result.current.handleConfirmSendAnyway()
    })

    expect(result.current.emptyContentAlert).toBeNull()
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(
      closeDraft({ draftId: 'draft-1' })
    )
  })

  it('exposes isSending from the underlying mutation state', () => {
    mockUseSendMailMutation.mockReturnValue([mockSendMail, { isLoading: true }])
    const { result } = renderHook(() => useComposeSend(baseFields))

    expect(result.current.isSending).toBe(true)
  })

  it('uploads local files then sends with the tmp draft key', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' })
    const { result } = renderHook(() =>
      useComposeSend({
        ...baseFields,
        attachments: [
          {
            draftId: 'att-1',
            name: 'a.txt',
            size: 1,
            type: 'text/plain',
            file,
            uploadStatus: 'pending',
          },
        ],
      })
    )

    await act(async () => {
      await result.current.handleSend()
    })

    expect(mockUploadAttachment).toHaveBeenCalledWith({
      accountId: 'acc-1',
      mailKey: null,
      file,
    })
    expect(mockSendMail).toHaveBeenCalledWith({
      accountId: 'acc-1',
      mailKey: 'tmp-key',
      mail: { mocked: 'payload' },
    })
  })

  it('toasts a dedicated quota error when enqueueing fails for storage', async () => {
    mockOutboxEnabled = true
    mockProbeNetwork.mockResolvedValue(false)
    const quotaError = Object.assign(new Error('StorageQuotaExceeded'), {
      name: 'StorageQuotaExceededError',
    })
    mockEnqueueOutbox.mockRejectedValue(quotaError)

    const { result } = renderHook(() => useComposeSend(baseFields))

    await act(async () => {
      await result.current.handleSend()
    })

    expect(toast.error).toHaveBeenCalledWith('storage_quota_exceeded.string')
    expect(mockDispatch).not.toHaveBeenCalledWith(
      closeDraft({ draftId: 'draft-1' })
    )
  })
  it('sends only once when send is triggered twice during the network probe', async () => {
    mockOutboxEnabled = true
    let releaseProbe: (online: boolean) => void = () => {}
    const probe = new Promise<boolean>((resolve) => {
      releaseProbe = resolve
    })
    mockProbeNetwork.mockImplementation(() => probe)

    const { result } = renderHook(() => useComposeSend(baseFields))

    let first: Promise<void> = Promise.resolve()
    let second: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.handleSend()
      second = result.current.handleSend()
    })
    expect(result.current.isSending).toBe(true)

    await act(async () => {
      releaseProbe(true)
      await Promise.all([first, second])
    })

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(result.current.isSending).toBe(false)
  })

  it('waits for an in-flight draft save and sends with its key', async () => {
    let finishSave: (key: string | null) => void = () => {}
    trackDraftSave(
      'draft-1',
      new Promise<string | null>((resolve) => {
        finishSave = resolve
      })
    )

    const { result } = renderHook(() => useComposeSend(baseFields))

    let sending: Promise<void> = Promise.resolve()
    act(() => {
      sending = result.current.handleSend()
    })
    expect(mockSendMail).not.toHaveBeenCalled()

    await act(async () => {
      finishSave('saved-key')
      await sending
    })

    expect(mockSendMail).toHaveBeenCalledWith({
      accountId: 'acc-1',
      mailKey: 'saved-key',
      mail: { mocked: 'payload' },
    })
  })

  describe('Outbox-sourced drafts', () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' })
    const onServer = new File(['y'], 'b.txt', { type: 'text/plain' })
    const restored = [
      {
        draftId: 'att-1',
        name: 'a.txt',
        size: 1,
        type: 'text/plain',
        file,
        uploadStatus: 'pending' as const,
      },
      {
        draftId: 'att-2',
        name: 'b.txt',
        size: 1,
        type: 'text/plain',
        file: onServer,
        uploadStatus: 'completed' as const,
      },
    ]

    it('uploads restored local attachments when sending online, then drops the queued copy', async () => {
      mockOutboxEnabled = true
      const { result } = renderHook(() =>
        useComposeSend({
          ...baseFields,
          mailKey: 'draft-1',
          attachments: restored,
          sourceOutboxId: 'o1',
        })
      )

      await act(async () => {
        await result.current.handleSend()
      })

      expect(mockUploadAttachment).toHaveBeenCalledTimes(1)
      expect(mockUploadAttachment).toHaveBeenCalledWith({
        accountId: 'acc-1',
        mailKey: 'draft-1',
        file,
      })
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ mailKey: 'tmp-key' })
      )
      expect(mockDeleteOutboxItem).toHaveBeenCalledWith(
        'user@example.org',
        'o1'
      )
      expect(mockReleaseOutboxForEdit).toHaveBeenCalledWith(
        'o1',
        'user@example.org'
      )
    })

    it('keeps the queued copy when an attachment upload fails', async () => {
      mockOutboxEnabled = true
      mockUploadAttachment.mockResolvedValue({ error: { status: 500 } })
      const { result } = renderHook(() =>
        useComposeSend({
          ...baseFields,
          attachments: restored,
          sourceOutboxId: 'o1',
        })
      )

      await act(async () => {
        await result.current.handleSend()
      })

      expect(mockSendMail).not.toHaveBeenCalled()
      expect(mockDeleteOutboxItem).not.toHaveBeenCalled()
    })

    it('does not silently resend an item that left the Outbox meanwhile', async () => {
      mockOutboxEnabled = true
      mockGetOutboxItem.mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        useComposeSend({ ...baseFields, sourceOutboxId: 'o1' })
      )

      await act(async () => {
        await result.current.handleSend()
      })

      expect(mockSendMail).not.toHaveBeenCalled()
      expect(toast.warning).toHaveBeenCalledWith(
        'outbox_item_gone.string',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'outbox_send_anyway.string',
          }),
        })
      )

      // "Send anyway" sends it as a new message.
      const [, options] = jest.mocked(toast.warning).mock
        .calls[0] as unknown as [string, { action: { onClick: () => void } }]
      await act(async () => {
        options.action.onClick()
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockDeleteOutboxItem).not.toHaveBeenCalled()
    })

    it('queues offline with the uploaded marker for server-side attachments', async () => {
      mockOutboxEnabled = true
      mockProbeNetwork.mockResolvedValue(false)
      mockEnqueueOutbox.mockResolvedValue({})
      const { result } = renderHook(() =>
        useComposeSend({
          ...baseFields,
          mailKey: 'draft-1',
          attachments: restored,
          sourceOutboxId: 'o1',
        })
      )

      await act(async () => {
        await result.current.handleSend()
      })

      const queued = mockEnqueueOutbox.mock.calls[0]![0] as {
        replaceOutboxId?: string
        attachments: { name: string; uploaded: boolean }[]
      }
      expect(queued.replaceOutboxId).toBe('o1')
      expect(
        queued.attachments.map(({ name, uploaded }) => ({ name, uploaded }))
      ).toEqual([
        { name: 'a.txt', uploaded: false },
        { name: 'b.txt', uploaded: true },
      ])
    })

    it('warns instead of re-creating a vanished item when queueing offline', async () => {
      mockOutboxEnabled = true
      mockProbeNetwork.mockResolvedValue(false)
      mockEnqueueOutbox.mockRejectedValue(
        Object.assign(new Error('gone'), { name: 'OutboxItemGoneError' })
      )
      const { result } = renderHook(() =>
        useComposeSend({ ...baseFields, sourceOutboxId: 'o1' })
      )

      await act(async () => {
        await result.current.handleSend()
      })

      expect(toast.warning).toHaveBeenCalledWith(
        'outbox_item_gone.string',
        expect.anything()
      )
      expect(mockDispatch).not.toHaveBeenCalledWith(
        closeDraft({ draftId: 'draft-1' })
      )
    })
  })
})
