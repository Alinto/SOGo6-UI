import { renderHook, act } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockTriggerGetEditMessage = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      mailCompose: {
        openDraftIds: ['draft-1'],
        drafts: { 'draft-1': { mailKey: 'mail-42' } },
      },
    }),
}))

jest.mock('@/features/mails/store/mail-compose-slice', () => ({
  createDraft: jest.fn((payload) => ({ type: 'createDraft', payload })),
  setActiveDraft: jest.fn((id) => ({ type: 'setActiveDraft', payload: id })),
  selectOpenDraftIds: (state: { mailCompose: { openDraftIds: string[] } }) =>
    state.mailCompose.openDraftIds,
  selectAllDrafts: (state: { mailCompose: { drafts: Record<string, unknown> } }) =>
    state.mailCompose.drafts,
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useLazyGetEditMessageQuery: () => [mockTriggerGetEditMessage],
}))

jest.mock('@/features/mails/utils/mail-compose-from-api', () => ({
  apiDataToMailComposeDraft: jest.fn((_id, data) => data),
}))

jest.mock('@/lib/utils/create-client-id', () => ({
  createClientId: () => 'new-draft-id',
}))

import { setActiveDraft, createDraft } from '@/features/mails/store/mail-compose-slice'
import { useOpenDraftOnClick } from '../use-open-draft-on-click'

describe('useOpenDraftOnClick', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTriggerGetEditMessage.mockResolvedValue({ data: { subject: 'Draft' } })
  })

  it('returns false for non-draft folders', async () => {
    const { result } = renderHook(() => useOpenDraftOnClick())

    let opened = false
    await act(async () => {
      opened = await result.current.openDraftIfNeeded({
        folderType: 'INBOX',
        folderPath: 'INBOX',
        accountId: '0',
        mailId: 'mail-42',
      })
    })

    expect(opened).toBe(false)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('activates existing draft when already open', async () => {
    const { result } = renderHook(() => useOpenDraftOnClick())

    await act(async () => {
      await result.current.openDraftIfNeeded({
        folderType: 'DRAFT',
        folderPath: 'Drafts',
        accountId: '0',
        mailId: 'mail-42',
      })
    })

    expect(setActiveDraft).toHaveBeenCalledWith('draft-1')
    expect(mockTriggerGetEditMessage).not.toHaveBeenCalled()
  })

  it('creates a new draft when none exists', async () => {
    const { result } = renderHook(() => useOpenDraftOnClick())

    await act(async () => {
      await result.current.openDraftIfNeeded({
        folderType: 'DRAFTS',
        folderPath: 'Drafts',
        accountId: '0',
        mailId: 'mail-99',
      })
    })

    expect(mockTriggerGetEditMessage).toHaveBeenCalledWith({
      folder: 'Drafts',
      mailId: 'mail-99',
      accountId: '0',
    })
    expect(createDraft).toHaveBeenCalled()
  })
})
