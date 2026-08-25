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

jest.mock('@/features/offline/flags', () => ({
  isPwaOutboxEnabled: () => false,
}))

jest.mock('@/features/offline/network/probe', () => ({
  probeNetwork: jest.fn(async () => true),
}))

jest.mock('@/features/offline/auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('@/features/offline/outbox/outbox-coordinator', () => ({
  enqueueOutbox: jest.fn(),
}))

jest.mock('@/features/offline/db/outbox-store', () => ({
  deleteOutboxItem: jest.fn(),
}))

jest.mock('@/features/offline/outbox/outbox-events', () => ({
  notifyOutboxChanged: jest.fn(),
}))

jest.mock('@/features/offline/outbox/outbox-edit-hold', () => ({
  releaseOutboxForEdit: jest.fn(),
}))

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
  selectedPriority: MAIL_PRIORITY_NORMAL as 0 | 1 | 2 | 3 | 4,
  isPlainText: false,
}

describe('useComposeSend', () => {
  beforeEach(() => {
    mockUseSendMailMutation.mockReturnValue([
      mockSendMail,
      { isLoading: false },
    ])
    mockSendMail.mockResolvedValue({ data: {} })
    mockUploadAttachment.mockResolvedValue({
      data: { data: { key: 'tmp-key', filename: 'a.txt' } },
    })
    mockBuildComposeMailPayload.mockReturnValue({ mocked: 'payload' })
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
})
