import { buildMailFolderKey } from '@/features/mails/utils/mail-detail-navigation'
import { renderHook } from '@testing-library/react'
import { useMailDetailNavigation } from '../use-mail-detail-navigation'

const mockPush = jest.fn()
const mockPathname = '/en/u/0/INBOX/2'
const mockMailNavigation = {
  folderKey: '0/INBOX',
  orderedIds: ['1', '2', '3'],
  folderById: {},
  page: 1,
  totalPages: 2,
}

const mockMailSearch = {
  isActive: false,
  accountId: null,
  params: null,
  folder: null,
}

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
  usePathname: jest.fn(() => mockPathname),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    account: '0',
    folder: 'INBOX',
    mail_id: '2',
  })),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: jest.fn((selector: (state: unknown) => unknown) =>
    selector({
      mailNavigation: mockMailNavigation,
      mailSearch: mockMailSearch,
    })
  ),
}))

describe('useMailDetailNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('detects the current mail and navigation boundaries', () => {
    const { result } = renderHook(() => useMailDetailNavigation())

    expect(result.current.mailId).toBe('2')
    expect(result.current.isActive).toBe(true)
    expect(result.current.currentPosition).toBe(2)
    expect(result.current.totalInPage).toBe(3)
    expect(result.current.canGoPrev).toBe(true)
    expect(result.current.canGoNext).toBe(true)
  })

  it('navigates to the previous mail', () => {
    const { result } = renderHook(() => useMailDetailNavigation())

    result.current.goPrev()

    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX/1')
  })

  it('navigates to the next mail', () => {
    const { result } = renderHook(() => useMailDetailNavigation())

    result.current.goNext()

    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX/3')
  })

  it('exposes the redux navigation context', () => {
    const { result } = renderHook(() => useMailDetailNavigation())

    expect(result.current.navigation.folderKey).toBe(
      buildMailFolderKey('0', 'INBOX')
    )
  })

  it('ignores stale mail_id params on folder list URLs', () => {
    const { usePathname } = require('@/lib/i18n/navigation')
    usePathname.mockReturnValue('/en/u/0/INBOX')

    const { result } = renderHook(() => useMailDetailNavigation())

    expect(result.current.isOnMailDetailPath).toBe(false)
    expect(result.current.isActive).toBe(false)
    expect(result.current.mailId).toBeNull()
  })

  describe('cross-folder search results', () => {
    const originalMailNavigation = { ...mockMailNavigation }
    const originalMailSearch = { ...mockMailSearch }

    beforeEach(() => {
      const { usePathname } = require('@/lib/i18n/navigation')
      const { useParams } = require('next/navigation')
      // The result mail actually lives in Sent, so it's opened at
      // /u/0/Sent/2 even though the search was triggered from INBOX.
      usePathname.mockReturnValue('/en/u/0/Sent/2')
      useParams.mockReturnValue({ account: '0', folder: 'Sent', mail_id: '2' })
      Object.assign(mockMailNavigation, {
        folderKey: '0/INBOX',
        orderedIds: ['1', '2', '3'],
        folderById: { '1': 'INBOX', '2': 'Sent', '3': 'INBOX' },
      })
      Object.assign(mockMailSearch, {
        isActive: true,
        accountId: '0',
        folder: 'INBOX',
      })
    })

    afterEach(() => {
      Object.assign(mockMailNavigation, originalMailNavigation)
      Object.assign(mockMailSearch, originalMailSearch)
    })

    it('stays valid despite the route folder differing from the search folder', () => {
      const { result } = renderHook(() => useMailDetailNavigation())

      expect(result.current.mailId).toBe('2')
      expect(result.current.canGoPrev).toBe(true)
      expect(result.current.canGoNext).toBe(true)
    })

    it("navigates prev/next using each mail's own folder", () => {
      const { result } = renderHook(() => useMailDetailNavigation())

      result.current.goPrev()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX/1')

      result.current.goNext()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX/3')
    })
  })

  describe('returning to the advanced-search list at a page boundary', () => {
    const originalMailNavigation = { ...mockMailNavigation }
    const originalMailSearch = { ...mockMailSearch }

    beforeEach(() => {
      const { usePathname } = require('@/lib/i18n/navigation')
      const { useParams } = require('next/navigation')
      usePathname.mockReturnValue('/en/u/0/advanced-search/5')
      useParams.mockReturnValue({
        account: '0',
        folder: 'advanced-search',
        mail_id: '5',
      })
      Object.assign(mockMailNavigation, {
        folderKey: '0/advanced-search',
        orderedIds: ['5'],
        folderById: {},
        page: 2,
        totalPages: 2,
      })
      Object.assign(mockMailSearch, {
        isActive: true,
        accountId: '0',
        folder: 'advanced-search',
        params: { from: ['jane'] },
      })
    })

    afterEach(() => {
      Object.assign(mockMailNavigation, originalMailNavigation)
      Object.assign(mockMailSearch, originalMailSearch)
    })

    it('carries the active search criteria along with the page number', () => {
      const { result } = renderHook(() => useMailDetailNavigation())

      result.current.goPrev()

      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/advanced-search?from=jane&page=1'
      )
    })

    it('exposes a returnToListUrl carrying the search criteria and current page', () => {
      const { result } = renderHook(() => useMailDetailNavigation())

      expect(result.current.returnToListUrl).toBe(
        '/u/0/advanced-search?from=jane&page=2'
      )
    })
  })

  it('exposes a null returnToListUrl on the first page of a folder', () => {
    const { usePathname } = require('@/lib/i18n/navigation')
    const { useParams } = require('next/navigation')
    usePathname.mockReturnValue(mockPathname)
    useParams.mockReturnValue({ account: '0', folder: 'INBOX', mail_id: '2' })

    const { result } = renderHook(() => useMailDetailNavigation())

    expect(result.current.returnToListUrl).toBeNull()
  })

  it('exposes a returnToListUrl keeping the current page of a folder', () => {
    const { usePathname } = require('@/lib/i18n/navigation')
    const { useParams } = require('next/navigation')
    usePathname.mockReturnValue(mockPathname)
    useParams.mockReturnValue({ account: '0', folder: 'INBOX', mail_id: '2' })
    const originalPage = mockMailNavigation.page
    mockMailNavigation.page = 2

    const { result } = renderHook(() => useMailDetailNavigation())

    expect(result.current.returnToListUrl).toBe('/u/0/INBOX?page=2')
    mockMailNavigation.page = originalPage
  })
})
