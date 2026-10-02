import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import { UserPlus } from 'lucide-react'
import { openCreateForm } from '../../store/address-books-ui-slice'

const mockDispatch = jest.fn()
const mockSetOpenMobile = jest.fn()
const mockUseSidebar = jest.fn()
const mockUseParams = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => mockUseSidebar(),
}))

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../use-active-address-book', () => ({
  useActiveAddressBookWritable: () => ({
    writable: true,
    permissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canErase: true,
    },
  }),
}))

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBooksQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
  })),
}))

import { useGetAddressBooksQuery } from '../../store/address-books-api'
import { useCreateContactAction } from '../use-create-contact-action'

const mockUseGetAddressBooksQuery = useGetAddressBooksQuery as jest.Mock

describe('useCreateContactAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    })
    mockUseParams.mockReturnValue({ book_id: 'book-1' })
    mockUseGetAddressBooksQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
  })

  describe('configuration', () => {
    it('returns label and icon', () => {
      const { result } = renderHook(() => useCreateContactAction())
      expect(result.current.label).toBe('new_contact.string')
      expect(result.current.icon).toBe(UserPlus)
    })
  })

  describe('integration', () => {
    it('dispatches openCreateForm with book id from params', () => {
      const { result } = renderHook(() => useCreateContactAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        openCreateForm({ bookId: 'book-1' })
      )
    })

    it('dispatches openCreateForm with the default personal book outside a book route', () => {
      mockUseParams.mockReturnValue({})
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [
            {
              id: 'personal-1',
              name: 'Personal',
              description: '',
              type: 'personal',
              default: true,
            },
          ],
          subscriptions: [],
          globals: [],
        },
        isLoading: false,
      })
      const { result } = renderHook(() => useCreateContactAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        openCreateForm({ bookId: 'personal-1' })
      )
    })

    it('does not dispatch on the all-contacts book', () => {
      mockUseParams.mockReturnValue({ book_id: 'all' })
      const { result } = renderHook(() => useCreateContactAction())

      expect(result.current.disabled).toBe(true)

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('stays disabled when no personal book exists', () => {
      mockUseParams.mockReturnValue({})
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: { personals: [], subscriptions: [], globals: [] },
        isLoading: false,
      })
      const { result } = renderHook(() => useCreateContactAction())

      expect(result.current.disabled).toBe(true)

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('responsive layout', () => {
    it('closes mobile sidebar on click when on mobile by default', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        setOpenMobile: mockSetOpenMobile,
      })
      const { result } = renderHook(() => useCreateContactAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
    })

    it('does not close mobile sidebar when closeMobileSidebar is false', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        setOpenMobile: mockSetOpenMobile,
      })
      const { result } = renderHook(() =>
        useCreateContactAction({ closeMobileSidebar: false })
      )

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('does not close sidebar when not on mobile', () => {
      const { result } = renderHook(() => useCreateContactAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })
  })
})
