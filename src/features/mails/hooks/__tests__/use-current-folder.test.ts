import { renderHook } from '@testing-library/react'

const mockUseGetFoldersQuery = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ account: '0', folder: 'INBOX' })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: (args: unknown) => mockUseGetFoldersQuery(args),
}))

import { useCurrentFolder } from '../use-current-folder'

const inboxFolder = {
  name: 'INBOX',
  path: 'INBOX',
  type: 'INBOX' as const,
  unseen_count: 0,
  messages: 1,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: true,
}

const virtualFolder = {
  name: 'Virtual',
  path: 'Virtual',
  type: 'NORMAL' as const,
  unseen_count: 0,
  messages: 0,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: false,
  subfolders: [],
}

describe('useCurrentFolder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resolves folder from tree and returns type', () => {
    mockUseGetFoldersQuery.mockReturnValue({
      data: [inboxFolder],
      isLoading: false,
    })

    const { result } = renderHook(() => useCurrentFolder('INBOX', '0'))

    expect(result.current.folderPath).toBe('INBOX')
    expect(result.current.folderType).toBe('INBOX')
    expect(result.current.isSelectable).toBe(true)
    expect(result.current.isVirtual).toBe(false)
  })

  it('marks non-selectable folders as virtual', () => {
    mockUseGetFoldersQuery.mockReturnValue({
      data: [virtualFolder],
      isLoading: false,
    })

    const { result } = renderHook(() => useCurrentFolder('Virtual', '0'))

    expect(result.current.isSelectable).toBe(false)
    expect(result.current.isVirtual).toBe(true)
  })

  it('normalizes DRAFTS type to DRAFT', () => {
    mockUseGetFoldersQuery.mockReturnValue({
      data: [{ ...inboxFolder, path: 'Drafts', type: 'DRAFTS' as const }],
      isLoading: false,
    })

    const { result } = renderHook(() => useCurrentFolder('Drafts', '0'))

    expect(result.current.folderType).toBe('DRAFT')
  })
})
