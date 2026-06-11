import '@testing-library/jest-dom'
import { renderHook, waitFor } from '@testing-library/react'

import { ActionId } from '@/features/mails/components/mail/types'
import type { ImapMessages } from '@/features/mails/mails-types'

const mockDispatch = jest.fn()
const mockTriggerGetEditMessage = jest.fn()
const mockTriggerGetReplyMessage = jest.fn()
const mockCreateDraft = jest.fn((payload: unknown) => ({
  type: 'mailCompose/createDraft',
  payload,
}))
const mockApiDataToMailComposeDraft = jest.fn()
const mockBuildForwardedBody = jest.fn(() => '<div>forwarded</div>')
const mockBuildQuotedReplyBody = jest.fn(() => '<div>quoted</div>')

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/features/mails/store', () => ({
  createDraft: (payload: unknown) => mockCreateDraft(payload),
  useLazyGetEditMessageQuery: jest.fn(() => [mockTriggerGetEditMessage]),
  useLazyGetReplyMessageQuery: jest.fn(() => [mockTriggerGetReplyMessage]),
}))

jest.mock('@/features/mails/utils/mail-compose-from-api', () => ({
  apiDataToMailComposeDraft: (...args: unknown[]) =>
    mockApiDataToMailComposeDraft(...args),
  buildForwardedBody: (...args: unknown[]) => mockBuildForwardedBody(...args),
  buildQuotedReplyBody: (...args: unknown[]) =>
    mockBuildQuotedReplyBody(...args),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

import { useMailReplyActions } from '../use-mail-reply-actions'

const mockMail: ImapMessages = {
  id: '1',
  uid: '1',
  attachments: { count: 0, parts: [] },
  seen: true,
  answered: false,
  deleted: false,
  date: '2026-01-01T00:00:00Z',
  subject: 'Hello',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  cc: [],
  body: '<p>Hi</p>',
}

describe('useMailReplyActions', () => {
  beforeEach(() => {
    mockTriggerGetEditMessage.mockResolvedValue({
      data: { subject: 'Fwd: Hello' },
    })
    mockTriggerGetReplyMessage.mockResolvedValue({
      data: { subject: 'Re: Hello' },
    })
    mockApiDataToMailComposeDraft.mockReturnValue({
      draftId: 'draft-1',
      to: [{ email: 'alice@example.com' }],
      cc: [{ email: 'cc@example.com' }],
      bcc: [],
      subject: 'Re: Hello',
      body: '<p>Hi</p>',
      attachments: [],
    })
  })

  describe('rightActions', () => {
    it('returns reply, reply-all and forward actions in order', () => {
      const { result } = renderHook(() => useMailReplyActions({}))

      expect(result.current.rightActions.map((action) => action.id)).toEqual(
        [ActionId.REPLY, ActionId.REPLY_ALL, ActionId.FORWARD]
      )
    })
  })

  describe('handleMailAction guard clauses', () => {
    it('does nothing when mail is missing', () => {
      const { result } = renderHook(() =>
        useMailReplyActions({ mailId: '1', folder: 'INBOX' })
      )

      result.current.handleMailAction(0, { id: ActionId.REPLY, icon: null })

      expect(mockTriggerGetReplyMessage).not.toHaveBeenCalled()
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('does nothing when mailId is missing', () => {
      const { result } = renderHook(() =>
        useMailReplyActions({ mail: mockMail, folder: 'INBOX' })
      )

      result.current.handleMailAction(0, { id: ActionId.REPLY, icon: null })

      expect(mockTriggerGetReplyMessage).not.toHaveBeenCalled()
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('does nothing when folder is missing', () => {
      const { result } = renderHook(() =>
        useMailReplyActions({ mail: mockMail, mailId: '1' })
      )

      result.current.handleMailAction(0, { id: ActionId.REPLY, icon: null })

      expect(mockTriggerGetReplyMessage).not.toHaveBeenCalled()
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('does nothing for an unrelated action id', () => {
      const { result } = renderHook(() =>
        useMailReplyActions({ mail: mockMail, mailId: '1', folder: 'INBOX' })
      )

      result.current.handleMailAction(0, { id: ActionId.GO_BACK, icon: null })

      expect(mockTriggerGetEditMessage).not.toHaveBeenCalled()
      expect(mockTriggerGetReplyMessage).not.toHaveBeenCalled()
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('forward action', () => {
    it('fetches the edit message and dispatches createDraft with the forwarded body', async () => {
      const { result } = renderHook(() =>
        useMailReplyActions({
          mail: mockMail,
          mailId: '1',
          folder: 'INBOX',
          accountId: '0',
        })
      )

      result.current.handleMailAction(0, { id: ActionId.FORWARD, icon: null })

      await waitFor(() => expect(mockDispatch).toHaveBeenCalled())

      expect(mockTriggerGetEditMessage).toHaveBeenCalledWith({
        folder: 'INBOX',
        mailId: '1',
        accountId: '0',
      })
      expect(mockApiDataToMailComposeDraft).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ ...mockMail, subject: 'Fwd: Hello' })
      )
      expect(mockBuildForwardedBody).toHaveBeenCalled()
      expect(mockCreateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          forwardOf: '1',
          initialData: expect.objectContaining({
            to: [],
            body: '<div>forwarded</div>',
          }),
        })
      )
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'mailCompose/createDraft',
        payload: expect.any(Object),
      })
    })
  })

  describe('reply action', () => {
    it('fetches the reply message and dispatches createDraft without cc/bcc', async () => {
      const { result } = renderHook(() =>
        useMailReplyActions({
          mail: mockMail,
          mailId: '1',
          folder: 'INBOX',
          accountId: '0',
        })
      )

      result.current.handleMailAction(0, { id: ActionId.REPLY, icon: null })

      await waitFor(() => expect(mockDispatch).toHaveBeenCalled())

      expect(mockTriggerGetReplyMessage).toHaveBeenCalledWith({
        folder: 'INBOX',
        mailId: '1',
        accountId: '0',
      })
      expect(mockBuildQuotedReplyBody).toHaveBeenCalled()
      expect(mockCreateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          inReplyTo: '1',
          initialData: expect.objectContaining({
            cc: [],
            bcc: [],
            body: '<div>quoted</div>',
          }),
        })
      )
    })
  })

  describe('reply-all action', () => {
    it('keeps the cc recipients from the draft data', async () => {
      const { result } = renderHook(() =>
        useMailReplyActions({
          mail: mockMail,
          mailId: '1',
          folder: 'INBOX',
          accountId: '0',
        })
      )

      result.current.handleMailAction(0, {
        id: ActionId.REPLY_ALL,
        icon: null,
      })

      await waitFor(() => expect(mockDispatch).toHaveBeenCalled())

      expect(mockCreateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          inReplyTo: '1',
          initialData: expect.objectContaining({
            cc: [{ email: 'cc@example.com' }],
            bcc: [],
          }),
        })
      )
    })
  })
})
