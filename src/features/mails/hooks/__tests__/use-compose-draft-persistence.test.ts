import { act, renderHook } from '@testing-library/react'
import { closeDraft } from '../../store'
import { markDraftSaved, updateMailKey } from '../../store/mail-compose-slice'

const mockDispatch = jest.fn()
const mockSaveDraft = jest.fn()
const mockDeleteMail = jest.fn()
const mockUseSaveDraftMutation = jest.fn()
const mockUseDeleteMailMutation = jest.fn()
const mockBuildComposeMailPayload = jest.fn()

let intervalCallback: (() => void) | undefined
let intervalDelay: number | undefined
let intervalEnabled: boolean | undefined

jest.mock('@/hooks/use-interval', () => ({
  useInterval: (cb: () => void, delay: number, enabled?: boolean) => {
    intervalCallback = cb
    intervalDelay = delay
    intervalEnabled = enabled
  },
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('../../store/mail-api', () => ({
  useSaveDraftMutation: () => mockUseSaveDraftMutation(),
  useDeleteMailMutation: () => mockUseDeleteMailMutation(),
}))

jest.mock('../../utils/build-compose-mail-payload', () => ({
  buildComposeMailPayload: (...args: unknown[]) =>
    mockBuildComposeMailPayload(...args),
}))

jest.mock('@/features/offline/flags', () => ({
  isPwaOutboxEnabled: () => false,
}))

jest.mock('@/features/offline/network/probe', () => ({
  probeNetwork: jest.fn(async () => true),
}))

jest.mock('@/features/offline/hooks/use-offline-draft-sync', () => ({
  persistLocalDraft: jest.fn(),
}))

jest.mock('@/features/offline/auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

jest.mock('@/features/offline/outbox/outbox-edit-hold', () => ({
  releaseOutboxForEdit: jest.fn(),
}))

import { useComposeDraftPersistence } from '../use-compose-draft-persistence'

const baseOptions = {
  draftId: 'draft-1',
  accountId: 'acc-1',
  mailKey: null as string | null,
  isActive: true,
  isMinimized: false,
  isDirty: true,
  hasDraft: true,
  isSending: false,
  isUploading: false,
  autosaveIntervalMs: 5000,
  selectedIdentity: { mail: 'me@sogo.nu', replyTo: '' } as any,
  toRecipients: [{ email: 'to@sogo.nu' }],
  ccRecipients: [],
  bccRecipients: [],
  subject: 'Subject',
  body: 'Body',
  requestReadReceipt: false,
  selectedPriority: 2 as const,
  isPlainText: false,
}

describe('useComposeDraftPersistence', () => {
  beforeEach(() => {
    intervalCallback = undefined
    intervalDelay = undefined
    intervalEnabled = undefined
    mockUseSaveDraftMutation.mockReturnValue([
      mockSaveDraft,
      { isLoading: false },
    ])
    mockUseDeleteMailMutation.mockReturnValue([mockDeleteMail])
    mockSaveDraft.mockResolvedValue({ data: { data: {} } })
    mockDeleteMail.mockResolvedValue({})
    mockBuildComposeMailPayload.mockReturnValue({ mocked: 'payload' })
  })

  describe('handleSaveDraft', () => {
    it('saves with the built payload and reports the draft saved', async () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence(baseOptions)
      )

      await act(async () => {
        await result.current.handleSaveDraft(true, true, false)
      })

      expect(mockSaveDraft).toHaveBeenCalledWith({
        accountId: 'acc-1',
        mailKey: null,
        mail: { mocked: 'payload' },
        close: false,
        displayNotificationOnError: true,
        displayNotificationOnSuccess: true,
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        markDraftSaved({ draftId: 'draft-1' })
      )
    })

    it('updates the mail key when the server returns one', async () => {
      mockSaveDraft.mockResolvedValue({ data: { data: { key: 'srv-key' } } })
      const { result } = renderHook(() =>
        useComposeDraftPersistence(baseOptions)
      )

      await act(async () => {
        await result.current.handleSaveDraft(false, false, false)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        updateMailKey({ draftId: 'draft-1', mailKey: 'srv-key' })
      )
    })

    it('does not dispatch updateMailKey when no key comes back', async () => {
      mockSaveDraft.mockResolvedValue({ data: { data: {} } })
      const { result } = renderHook(() =>
        useComposeDraftPersistence(baseOptions)
      )

      await act(async () => {
        await result.current.handleSaveDraft(false, false, false)
      })

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: updateMailKey({ draftId: 'x', mailKey: 'x' }).type,
        })
      )
    })

    it('closes the draft when closeOnSave is true', async () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence(baseOptions)
      )

      await act(async () => {
        await result.current.handleSaveDraft(false, false, true)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        closeDraft({ draftId: 'draft-1' })
      )
    })

    it('does not dispatch anything when the save errors', async () => {
      mockSaveDraft.mockResolvedValue({ error: { status: 500 } })
      const { result } = renderHook(() =>
        useComposeDraftPersistence(baseOptions)
      )

      await act(async () => {
        await result.current.handleSaveDraft(true, true, true)
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('autosave interval', () => {
    it('forwards autosaveIntervalMs and enables the interval when not minimized', () => {
      renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, isMinimized: false })
      )
      expect(intervalDelay).toBe(5000)
      expect(intervalEnabled).toBe(true)
    })

    it('disables the interval when minimized', () => {
      renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, isMinimized: true })
      )
      expect(intervalEnabled).toBe(false)
    })

    it('autosaves when active, dirty, with a draft and nothing else in flight', async () => {
      renderHook(() => useComposeDraftPersistence(baseOptions))

      await act(async () => {
        intervalCallback?.()
      })

      expect(mockSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          close: false,
          displayNotificationOnError: false,
          displayNotificationOnSuccess: false,
        })
      )
    })

    it.each([
      ['isActive', { isActive: false }],
      ['isDirty', { isDirty: false }],
      ['hasDraft', { hasDraft: false }],
      ['isSending', { isSending: true }],
      ['isUploading', { isUploading: true }],
    ])('does not autosave when %s prevents it', async (_label, overrides) => {
      renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, ...overrides })
      )

      await act(async () => {
        intervalCallback?.()
      })

      expect(mockSaveDraft).not.toHaveBeenCalled()
    })

    it('does not autosave while a save is already in progress', async () => {
      mockUseSaveDraftMutation.mockReturnValue([
        mockSaveDraft,
        { isLoading: true },
      ])
      renderHook(() => useComposeDraftPersistence(baseOptions))

      await act(async () => {
        intervalCallback?.()
      })

      expect(mockSaveDraft).not.toHaveBeenCalled()
    })
  })

  describe('handleClose', () => {
    it('closes the draft directly when it is not dirty', () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, isDirty: false })
      )

      act(() => {
        result.current.handleClose()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        closeDraft({ draftId: 'draft-1' })
      )
      expect(mockSaveDraft).not.toHaveBeenCalled()
    })

    it('saves (and closes on save) when the draft is dirty', async () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, isDirty: true })
      )

      await act(async () => {
        await result.current.handleClose()
      })

      expect(mockSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({ close: true })
      )
    })

    it('closes an outbox edit without saving a server draft', async () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence({
          ...baseOptions,
          isDirty: true,
          sourceOutboxId: 'ob-1',
        })
      )

      await act(async () => {
        await result.current.handleClose()
      })

      expect(mockSaveDraft).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        closeDraft({ draftId: 'draft-1' })
      )
    })
  })

  describe('handleDiscardDraft', () => {
    it('deletes the mail then closes the draft when a mailKey exists', async () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, mailKey: 'key-1' })
      )

      await act(async () => {
        await result.current.handleDiscardDraft()
      })

      expect(mockDeleteMail).toHaveBeenCalledWith({
        accountId: 'acc-1',
        mailKey: 'key-1',
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        closeDraft({ draftId: 'draft-1' })
      )
    })

    it('closes the draft without deleting when there is no mailKey', async () => {
      const { result } = renderHook(() =>
        useComposeDraftPersistence({ ...baseOptions, mailKey: null })
      )

      await act(async () => {
        await result.current.handleDiscardDraft()
      })

      expect(mockDeleteMail).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        closeDraft({ draftId: 'draft-1' })
      )
    })
  })

  it('exposes isSavingDraft from the underlying mutation state', () => {
    mockUseSaveDraftMutation.mockReturnValue([
      mockSaveDraft,
      { isLoading: true },
    ])
    const { result } = renderHook(() => useComposeDraftPersistence(baseOptions))

    expect(result.current.isSavingDraft).toBe(true)
  })
})
