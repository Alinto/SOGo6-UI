import { buildMailFolderKey } from '@/features/mails/utils/mail-detail-navigation'
import { renderHook } from '@testing-library/react'
import { useMailDetailNavigation } from '../use-mail-detail-navigation'

const mockPush = jest.fn()
const mockPathname = '/en/u/0/INBOX/2'
const mockMailNavigation = {
  folderKey: '0/INBOX',
  orderedIds: ['1', '2', '3'],
  page: 1,
  totalPages: 2,
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
    selector({ mailNavigation: mockMailNavigation })
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
})
