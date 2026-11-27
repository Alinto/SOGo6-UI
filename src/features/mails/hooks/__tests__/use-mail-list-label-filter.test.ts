import { act, renderHook } from '@testing-library/react'
import { setMailSearch } from '../../store/mail-search-slice'
import { useMailListLabelFilter } from '../use-mail-list-label-filter'

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

const render = () => renderHook(() => useMailListLabelFilter()).result

describe('useMailListLabelFilter', () => {
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

  describe('labels', () => {
    it('are the URL labels without search', () => {
      mockSearchParams = new URLSearchParams('label=Work&label=toto')
      expect(render().current.labels).toEqual(['Work', 'toto'])
    })

    it('include the labels of a match:all search, without duplicates', () => {
      mockSearchParams = new URLSearchParams('label=work&label=toto')
      activateSearch({ subject: 'invoice', labels: ['Work', 'Home'] })
      expect(render().current.labels).toEqual(['Work', 'Home', 'toto'])
    })

    it('leave out the labels of a match:any search', () => {
      activateSearch({ subject: 'invoice', labels: ['Work'], operator: 'OR' })
      expect(render().current.labels).toEqual([])
    })

    it('leave out the search of another account', () => {
      mockMailSearch = {
        isActive: true,
        accountId: '1',
        params: { labels: ['Work'] },
        folder: 'INBOX',
      }
      expect(render().current.labels).toEqual([])
    })
  })

  describe('toggle', () => {
    it('adds a checked label to the URL, back to page 1', () => {
      mockSearchParams = new URLSearchParams('filter=unread&page=2&label=Work')
      const result = render()
      act(() => result.current.toggle('toto', true))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/INBOX?filter=unread&label=Work&label=toto'
      )
    })

    it('does not add a label the search already requires', () => {
      activateSearch({ labels: ['Work'] })
      const result = render()
      act(() => result.current.toggle('work', true))
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('removes an unchecked label from the URL', () => {
      mockSearchParams = new URLSearchParams('label=Work&label=toto')
      const result = render()
      act(() => result.current.toggle('work', false))
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=toto')
    })

    it('removes an unchecked label from the search', () => {
      activateSearch({ subject: 'invoice', labels: ['Work', 'Home'] })
      const result = render()
      act(() => result.current.toggle('Work', false))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'invoice', labels: ['Home'] },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })

    it('removes an unchecked label from the advanced search route URL', () => {
      mockRouteParams = { account: '0', folder: 'advanced-search' }
      mockPathname = '/u/0/advanced-search'
      mockSearchParams = new URLSearchParams(
        'subject=invoice&labels=Work,Home&sort=t_asc'
      )
      activateSearch(
        { subject: 'invoice', labels: ['Work', 'Home'] },
        'advanced-search'
      )
      const result = render()
      act(() => result.current.toggle('Work', false))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/advanced-search?subject=invoice&labels=Home&sort=t_asc'
      )
    })
  })

  describe('match:any search', () => {
    const anySearch = {
      subject: 'x',
      labels: ['Work'],
      operator: 'OR' as const,
    }

    it('turns into a match:all one keeping its labels when a label is checked', () => {
      activateSearch(anySearch)
      const result = render()
      act(() => result.current.toggle('Home', true))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'x', labels: ['Work'] },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=Home')
    })

    it('does not add to the URL a label the search already has', () => {
      activateSearch(anySearch)
      const result = render()
      act(() => result.current.toggle('work', true))
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'x', labels: ['Work'] },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })

    it('drops the operator from the advanced search route URL', () => {
      mockRouteParams = { account: '0', folder: 'advanced-search' }
      mockPathname = '/u/0/advanced-search'
      mockSearchParams = new URLSearchParams(
        'subject=x&labels=Work&operator=OR'
      )
      activateSearch(anySearch, 'advanced-search')
      const result = render()
      act(() => result.current.toggle('Home', true))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/advanced-search?subject=x&labels=Work&label=Home'
      )
    })
  })

  describe('select', () => {
    it('goes to the given path with the label checked', () => {
      mockPathname = '/u/0/INBOX/42'
      const result = render()
      act(() => result.current.select('Work', '/u/0/INBOX'))
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=Work')
    })

    it('still navigates for a label already checked', () => {
      mockPathname = '/u/0/INBOX/42'
      activateSearch({ labels: ['Work'] })
      const result = render()
      act(() => result.current.select('Work', '/u/0/INBOX'))
      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })
  })

  describe('clear', () => {
    it('removes the labels of the URL and of the search', () => {
      mockSearchParams = new URLSearchParams('label=toto&filter=read')
      activateSearch({ subject: 'invoice', labels: ['Work'] })
      const result = render()
      act(() => result.current.clear())
      expect(mockDispatch).toHaveBeenCalledWith(
        setMailSearch({
          accountId: '0',
          params: { subject: 'invoice' },
          folder: 'INBOX',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?filter=read')
    })
  })
})
