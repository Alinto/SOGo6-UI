import { renderHook, act } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockTriggerGetEditMessage = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      mailCompose: {
        openDraftIds: [],
        drafts: {},
      },
    }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/mails/store/mail-compose-slice', () => ({
  createDraft: jest.fn((payload) => ({ type: 'createDraft', payload })),
  setActiveDraft: jest.fn((id) => ({ type: 'setActiveDraft', payload: id })),
}))

jest.mock('@/features/mails/store/mail-compose-selectors', () => ({
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
  createClientId: () => 'draft-from-detail',
}))

import { ActionId } from '@/features/mails/components/mail/types'
import { createDraft } from '@/features/mails/store/mail-compose-slice'
import { useMailDetailFolderActions } from '../use-mail-detail-folder-actions'

describe('useMailDetailFolderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTriggerGetEditMessage.mockResolvedValue({ data: { subject: 'Hello' } })
  })

  it('exposes edit action for draft folders', () => {
    const { result } = renderHook(() =>
      useMailDetailFolderActions({
        folderType: 'DRAFT',
        folder: 'Drafts',
        accountId: '0',
        mailId: 'mail-1',
        mail: { subject: 'Hello' } as never,
      })
    )

    expect(result.current.folderSpecificActions).toHaveLength(1)
    expect(result.current.folderSpecificActions[0]?.id).toBe(ActionId.EDIT_DRAFT)
    expect(result.current.hideReplyActions).toBe(true)
  })

  it('exposes use-template action for template folders', () => {
    const { result } = renderHook(() =>
      useMailDetailFolderActions({
        folderType: 'TEMPLATE',
        folder: 'Templates',
        accountId: '0',
        mailId: 'mail-1',
      })
    )

    expect(result.current.folderSpecificActions[0]?.id).toBe(ActionId.USE_TEMPLATE)
    expect(result.current.hideReplyActions).toBe(true)
  })

  it('creates draft when edit action is handled', async () => {
    const { result } = renderHook(() =>
      useMailDetailFolderActions({
        folderType: 'DRAFT',
        folder: 'Drafts',
        accountId: '0',
        mailId: 'mail-1',
        mail: { subject: 'Hello' } as never,
      })
    )

    const action = result.current.folderSpecificActions[0]!

    await act(async () => {
      result.current.handleFolderSpecificAction(action)
    })

    expect(mockTriggerGetEditMessage).toHaveBeenCalled()
    expect(createDraft).toHaveBeenCalled()
  })
})
