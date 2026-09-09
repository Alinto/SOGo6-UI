import { renderHook } from '@testing-library/react'
import type { ImapMessagesList } from '../../mails-types'

const mockUseAppSelector = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    mockUseAppSelector(selector),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { useMailFolderLabel } from '../use-mail-folder-label'

const mailSearchState = (overrides: Record<string, unknown> = {}) => ({
  isActive: true,
  accountId: '0',
  params: { folders: ['all'] },
  folder: 'INBOX',
  ...overrides,
})

const mockData = { folder: 'INBOX/Work' } as ImapMessagesList

describe('useMailFolderLabel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns undefined when no search is active', () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ mailSearch: mailSearchState({ isActive: false }) })
    )

    const { result } = renderHook(() =>
      useMailFolderLabel(mockData, 'INBOX/Work', 'NORMAL')
    )

    expect(result.current).toBeUndefined()
  })

  it('returns the folder display name even when search is scoped to a single folder', () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        mailSearch: mailSearchState({ params: { folders: ['INBOX'] } }),
      })
    )

    const { result } = renderHook(() =>
      useMailFolderLabel(mockData, 'INBOX/Work', 'NORMAL')
    )

    expect(result.current).toBe('Work')
  })

  it('returns undefined when the mail has no folder of its own', () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ mailSearch: mailSearchState() })
    )

    const { result } = renderHook(() =>
      useMailFolderLabel({} as ImapMessagesList, 'INBOX/Work', 'NORMAL')
    )

    expect(result.current).toBeUndefined()
  })

  it('returns the folder display name for an all-folders search', () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ mailSearch: mailSearchState() })
    )

    const { result } = renderHook(() =>
      useMailFolderLabel(mockData, 'INBOX/Work', 'NORMAL')
    )

    expect(result.current).toBe('Work')
  })
})
