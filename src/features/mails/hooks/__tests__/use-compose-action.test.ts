import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import { Pencil } from 'lucide-react'
import { createDraft, MAX_OPEN_DRAFTS } from '../../store'

const mockDispatch = jest.fn()
const mockSetOpenMobile = jest.fn()
const mockUseIsMobile = jest.fn()
const mockUseAppSelector = jest.fn()
const mockToastError = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    mockUseAppSelector(selector),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ setOpenMobile: mockSetOpenMobile }),
}))

jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { max?: number }) => {
    if (key === 'max_windows_error.string' && values?.max !== undefined) {
      return `max:${values.max}`
    }
    return key
  },
}))

import { useComposeAction } from '../use-compose-action'

describe('useComposeAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsMobile.mockReturnValue(false)
    mockUseAppSelector.mockReturnValue(true)
  })

  describe('configuration', () => {
    it('returns label and icon', () => {
      const { result } = renderHook(() => useComposeAction())
      expect(result.current.label).toBe('new_message.string')
      expect(result.current.icon).toBe(Pencil)
    })
  })

  describe('integration', () => {
    it('dispatches createDraft with a draft id when allowed', () => {
      const { result } = renderHook(() => useComposeAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockDispatch).toHaveBeenCalledTimes(1)
      const action = mockDispatch.mock.calls[0][0]
      expect(action.type).toBe(createDraft({ draftId: 'x' }).type)
      expect(action.payload).toEqual(
        expect.objectContaining({
          draftId: expect.any(String),
        })
      )
    })

    it('shows toast and does not dispatch when max drafts reached', () => {
      mockUseAppSelector.mockReturnValue(false)
      const { result } = renderHook(() => useComposeAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockToastError).toHaveBeenCalledWith(`max:${MAX_OPEN_DRAFTS}`)
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('responsive layout', () => {
    it('closes mobile sidebar on click when on mobile by default', () => {
      mockUseIsMobile.mockReturnValue(true)
      const { result } = renderHook(() => useComposeAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
    })

    it('does not close mobile sidebar when closeMobileSidebar is false', () => {
      mockUseIsMobile.mockReturnValue(true)
      const { result } = renderHook(() =>
        useComposeAction({ closeMobileSidebar: false })
      )

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('does not close sidebar when not on mobile', () => {
      const { result } = renderHook(() => useComposeAction())

      act(() => {
        result.current.onClick()
      })

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })
  })
})
