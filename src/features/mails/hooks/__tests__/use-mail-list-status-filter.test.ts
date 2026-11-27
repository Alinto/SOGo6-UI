import { act, renderHook } from '@testing-library/react'
import { setMailSearch } from '../../store/mail-search-slice'
import { useMailListStatusFilter } from '../use-mail-list-status-filter'

const mockPush = jest.fn()
const mockDispatch = jest.fn()
let mockSearchParams = new URLSearchParams()
let mockPathname = '/u/0/INBOX'
let mockRouteParams: Record<string, string> = { account: '0', folder: 'INBOX' }
let mockMailSearch: Record<string, unknown> = {
  isActive: false,
  accountId: null,
  params: null,
  folder: null,
}

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useParams: () => mockRouteParams,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (fn: (s: any) => unknown) =>
    fn({ mailSearch: mockMailSearch }),
}))

const activateSearch = (params: Record<string, unknown>, folder = 'INBOX') => {
  mockMailSearch = { isActive: true, accountId: '0', params, folder }
}

const render = () => renderHook(() => useMailListStatusFilter()).result

describe('useMailListStatusFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    mockPathname = '/u/0/INBOX'
    mockRouteParams = { account: '0', folder: 'INBOX' }
    mockMailSearch = {
      isActive: false,
      accountId: null,
      params: null,
      folder: null,
    }
  })

  describe('value', () => {
    it('is "all" without filter nor search', () => {
      expect(render().current.value).toBe('all')
    })

    it('follows the URL filter', () => {
      mockSearchParams = new URLSearchParams('filter=flagged')
      expect(render().current.value).toBe('flagged')
    })

    it.each([
      [{ is_read: true }, 'read'],
      [{ is_read: false }, 'unread'],
      [{ is_flagged: true }, 'flagged'],
      [{ has_attachment: true }, 'attachments'],
    ])('selects the status of a match:all search %p', (status, expected) => {
      activateSearch({ subject: 'invoice', ...status })
      expect(render().current.value).toBe(expected)
    })

    it('prefers the URL filter to the search status', () => {
      mockSearchParams = new URLSearchParams('filter=unread')
      activateSearch({ is_read: true })
      expect(render().current.value).toBe('unread')
    })

    it.each([
      [
        'a match:any search',
        { subject: 'tutu', is_read: true, operator: 'OR' },
      ],
      ['several statuses', { is_read: true, has_attachment: true }],
    ])('selects nothing for %s', (_, params) => {
      activateSearch(params)
      expect(render().current.value).toBe('all')
    })

    it('ignores the search of another account', () => {
      mockMailSearch = {
        isActive: true,
        accountId: '1',
        params: { is_read: true },
        folder: 'INBOX',
      }
      expect(render().current.value).toBe('all')
    })
  })

  describe('setValue', () => {
    it('sets the URL filter, keeping the other params, back to page 1', () => {
      mockSearchParams = new URLSearchParams('sort=t_asc&page=3&label=Work')
      const result = render()
      act(() => result.current.setValue('unread'))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/INBOX?sort=t_asc&label=Work&filter=unread'
      )
    })

    it('removes the URL filter for "all"', () => {
      mockSearchParams = new URLSearchParams('filter=read')
      const result = render()
      act(() => result.current.setValue('all'))
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })

    it('replaces the status of the search by the chosen one', () => {
      activateSearch({ subject: 'invoice', is_read: true, is_flagged: true })
      const result = render()
      act(() => result.current.setValue('attachments'))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'invoice' },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?filter=attachments')
    })

    it('removes the status of the search for "all"', () => {
      activateSearch({ subject: 'invoice', is_read: true })
      const result = render()
      act(() => result.current.setValue(''))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'invoice' },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })

    it('leaves a search without status as is', () => {
      activateSearch({ subject: 'invoice' })
      const result = render()
      act(() => result.current.setValue('read'))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?filter=read')
    })

    it('turns a match:any search into a match:all one for a chosen status', () => {
      activateSearch({ subject: 'x', is_read: true, operator: 'OR' })
      const result = render()
      act(() => result.current.setValue('unread'))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'x' },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?filter=unread')
    })

    it('keeps a match:any search for "all", only removing its status', () => {
      activateSearch({ subject: 'x', is_read: true, operator: 'OR' })
      const result = render()
      act(() => result.current.setValue('all'))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'x', operator: 'OR' },
          folder: 'INBOX',
        })
      )
    })

    it('removes the status from the URL of the advanced search route', () => {
      mockRouteParams = { account: '0', folder: 'advanced-search' }
      mockPathname = '/u/0/advanced-search'
      mockSearchParams = new URLSearchParams(
        'subject=invoice&is_read=read&label=Work'
      )
      activateSearch({ subject: 'invoice', is_read: true }, 'advanced-search')
      const result = render()
      act(() => result.current.setValue('flagged'))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/advanced-search?subject=invoice&label=Work&filter=flagged'
      )
    })
  })
})
