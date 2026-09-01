import { renderHook } from '@testing-library/react'
import { useExpandSidebarOnMailDrag } from '../use-expand-sidebar-on-mail-drag'

const mockSetOpen = jest.fn()
const mockUseDndContext = jest.fn(() => ({ active: null }))
let sidebarOpen = false

jest.mock('@dnd-kit/core', () => ({
  useDndContext: () => mockUseDndContext(),
}))

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({
    open: sidebarOpen,
    setOpen: mockSetOpen,
  }),
}))

describe('useExpandSidebarOnMailDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sidebarOpen = false
    mockUseDndContext.mockReturnValue({ active: null })
  })

  it('expands a collapsed sidebar when a mail drag starts', () => {
    const { rerender } = renderHook(() => useExpandSidebarOnMailDrag())
    expect(mockSetOpen).not.toHaveBeenCalled()

    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
    })
    rerender()

    expect(mockSetOpen).toHaveBeenCalledWith(true)
  })

  it('restores the previous collapsed state when the drag ends', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
    })
    const { rerender } = renderHook(() => useExpandSidebarOnMailDrag())
    expect(mockSetOpen).toHaveBeenCalledWith(true)

    mockUseDndContext.mockReturnValue({ active: null })
    rerender()
    expect(mockSetOpen).toHaveBeenLastCalledWith(false)
  })

  it('does not collapse a sidebar that was already open', () => {
    sidebarOpen = true
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
    })
    const { rerender } = renderHook(() => useExpandSidebarOnMailDrag())
    mockUseDndContext.mockReturnValue({ active: null })
    rerender()
    expect(mockSetOpen).toHaveBeenLastCalledWith(true)
  })
})
