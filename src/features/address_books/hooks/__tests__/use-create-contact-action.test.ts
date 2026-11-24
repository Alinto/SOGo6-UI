import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import { UserPlus } from 'lucide-react'
import type { AddressBook } from '../../address-books-types'
import { openCreateForm } from '../../store/address-books-ui-slice'

const mockDispatch = jest.fn()
const mockSetOpenMobile = jest.fn()
const mockUseSidebar = jest.fn()
const mockUseParams = jest.fn()
const mockCanCreateInRouteBook = jest.fn(() => true)

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ addressBooksUi: { rightsByBook: {} } }),
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
      canCreate: mockCanCreateInRouteBook(),
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

const book = (
  id: string,
  type: AddressBook['type'],
  isDefault = false
): AddressBook => ({
  id,
  name: id,
  description: '',
  type,
  default: isDefault,
})

describe('useCreateContactAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    })
    mockCanCreateInRouteBook.mockReturnValue(true)
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

    it('opens the form on all contacts, preselecting the default personal book', () => {
      mockUseParams.mockReturnValue({ book_id: 'all' })
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [
            book('personal-1', 'personal'),
            book('personal-2', 'personal', true),
          ],
          subscriptions: [],
          globals: [book('global-1', 'global')],
        },
        isLoading: false,
      })
      const { result } = renderHook(() => useCreateContactAction())

      expect(result.current.disabled).toBe(false)

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        openCreateForm({ bookId: 'personal-2' })
      )
    })

    it('opens the form from a read-only book, preselecting a writable one', () => {
      mockUseParams.mockReturnValue({ book_id: 'global-1' })
      mockCanCreateInRouteBook.mockReturnValue(false)
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [book('personal-1', 'personal', true)],
          subscriptions: [],
          globals: [book('global-1', 'global')],
        },
        isLoading: false,
      })
      const { result } = renderHook(() => useCreateContactAction())

      expect(result.current.disabled).toBe(false)

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        openCreateForm({ bookId: 'personal-1' })
      )
    })

    it('falls back to a writable subscription when there is no personal book', () => {
      mockUseParams.mockReturnValue({ book_id: 'all' })
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [],
          subscriptions: [book('sub-1', 'personal')],
          globals: [book('global-1', 'global')],
        },
        isLoading: false,
      })
      const { result } = renderHook(() => useCreateContactAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        openCreateForm({ bookId: 'sub-1' })
      )
    })

    it('stays disabled while the address books load', () => {
      mockUseParams.mockReturnValue({ book_id: 'all' })
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      })
      const { result } = renderHook(() => useCreateContactAction())

      expect(result.current.disabled).toBe(true)
    })

    it('stays disabled when no address book accepts new contacts', () => {
      mockUseParams.mockReturnValue({ book_id: 'all' })
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [],
          subscriptions: [book('shared-1', 'shared')],
          globals: [book('global-1', 'global')],
        },
        isLoading: false,
      })
      const { result } = renderHook(() => useCreateContactAction())

      expect(result.current.disabled).toBe(true)

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('stays disabled when no address book exists', () => {
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
