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

import { useCreateContactAction } from '../use-create-contact-action'

describe('useCreateContactAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    })
    mockUseParams.mockReturnValue({ book_id: 'book-1' })
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

    it('dispatches openCreateForm without book id when param is not a string', () => {
      mockUseParams.mockReturnValue({ book_id: ['book-1'] })
      const { result } = renderHook(() => useCreateContactAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        openCreateForm({ bookId: undefined })
      )
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
