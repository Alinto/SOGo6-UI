import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import { ListPlus } from 'lucide-react'
import { openCreateForm } from '../../store/tasks-ui-slice'

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

import { useCreateTaskAction } from '../use-create-task-action'

describe('useCreateTaskAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    })
  })

  describe('configuration', () => {
    it('returns label and icon', () => {
      const { result } = renderHook(() => useCreateTaskAction())
      expect(result.current.label).toBe('new_task.string')
      expect(result.current.icon).toBe(ListPlus)
    })
  })

  describe('integration', () => {
    it('dispatches openCreateForm on click', () => {
      const { result } = renderHook(() => useCreateTaskAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledWith(openCreateForm())
    })
  })

  describe('responsive layout', () => {
    it('closes mobile sidebar on click when on mobile by default', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        setOpenMobile: mockSetOpenMobile,
      })
      const { result } = renderHook(() => useCreateTaskAction())

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
        useCreateTaskAction({ closeMobileSidebar: false })
      )

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('does not close sidebar when not on mobile', () => {
      const { result } = renderHook(() => useCreateTaskAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })
  })
})
