import { renderHook } from '@testing-library/react'
import {
  MAIL_DRAGGING_CLASS,
  MAIL_DROP_FORBIDDEN_CLASS,
  useMailDragPointer,
} from '../use-mail-drag-pointer'

const mockUseDndContext = jest.fn(() => ({ active: null, over: null }))

jest.mock('@dnd-kit/core', () => ({
  useDndContext: () => mockUseDndContext(),
}))

const mailActive = {
  data: {
    current: {
      type: 'mail',
      mailId: '1',
      accountId: '0',
      folder: 'INBOX',
      folderType: 'INBOX',
      subject: 'Hi',
      from: 'A',
      count: 1,
    },
  },
}

describe('useMailDragPointer', () => {
  beforeEach(() => {
    document.documentElement.classList.remove(
      MAIL_DRAGGING_CLASS,
      MAIL_DROP_FORBIDDEN_CLASS
    )
    mockUseDndContext.mockReturnValue({ active: null, over: null })
  })

  afterEach(() => {
    document.documentElement.classList.remove(
      MAIL_DRAGGING_CLASS,
      MAIL_DROP_FORBIDDEN_CLASS
    )
  })

  it('adds grabbing cursor while a mail is dragged', () => {
    mockUseDndContext.mockReturnValue({ active: mailActive, over: null })
    renderHook(() => useMailDragPointer())
    expect(document.documentElement).toHaveClass(MAIL_DRAGGING_CLASS)
    expect(document.documentElement).not.toHaveClass(MAIL_DROP_FORBIDDEN_CLASS)
  })

  it('adds not-allowed cursor over a forbidden folder', () => {
    mockUseDndContext.mockReturnValue({
      active: mailActive,
      over: {
        data: {
          current: {
            type: 'folder',
            folderPath: 'Sent',
            folderType: 'SENT',
          },
        },
      },
    })
    renderHook(() => useMailDragPointer())
    expect(document.documentElement).toHaveClass(MAIL_DRAGGING_CLASS)
    expect(document.documentElement).toHaveClass(MAIL_DROP_FORBIDDEN_CLASS)
  })

  it('clears cursor classes when the drag ends', () => {
    mockUseDndContext.mockReturnValue({ active: mailActive, over: null })
    const { rerender, unmount } = renderHook(() => useMailDragPointer())
    expect(document.documentElement).toHaveClass(MAIL_DRAGGING_CLASS)

    mockUseDndContext.mockReturnValue({ active: null, over: null })
    rerender()
    expect(document.documentElement).not.toHaveClass(MAIL_DRAGGING_CLASS)
    unmount()
  })
})
