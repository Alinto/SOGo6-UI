import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import { CalendarPlus } from 'lucide-react'
import { requestCreateEvent } from '../../store/calendar-ui-slice'

const mockDispatch = jest.fn()
const mockSetOpenMobile = jest.fn()
const mockUseSidebar = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => mockUseSidebar(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { useCreateEventAction } from '../use-create-event-action'

describe('useCreateEventAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    })
  })

  describe('configuration', () => {
    it('returns label and icon', () => {
      const { result } = renderHook(() => useCreateEventAction())
      expect(result.current.label).toBe('createEvent.string')
      expect(result.current.icon).toBe(CalendarPlus)
    })
  })

  describe('integration', () => {
    it('dispatches requestCreateEvent on click', () => {
      const { result } = renderHook(() => useCreateEventAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(requestCreateEvent())
    })
  })

  describe('responsive layout', () => {
    it('closes mobile sidebar on click when on mobile by default', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        setOpenMobile: mockSetOpenMobile,
      })
      const { result } = renderHook(() => useCreateEventAction())

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
        useCreateEventAction({ closeMobileSidebar: false })
      )

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('does not close sidebar when not on mobile', () => {
      const { result } = renderHook(() => useCreateEventAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })
  })
})
