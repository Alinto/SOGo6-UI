import { fireEvent, render, screen } from '@testing-library/react'
import type { DragControls } from 'framer-motion'
import { ComposeWindowHeader } from '../compose-window-header'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, title, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} title={title} {...props}>
      {children}
    </button>
  ),
}))

const baseProps = {
  subject: '',
  isMobile: false,
  isDraggable: true,
  showMinimized: false,
  isMaximized: false,
  isSending: false,
  isUploading: false,
  dragControls: { start: jest.fn() } as unknown as DragControls,
  onMinimize: jest.fn(),
  onMaximize: jest.fn(),
  onRestore: jest.fn(),
  onDiscardDraft: jest.fn(),
  onClose: jest.fn(),
}

describe('ComposeWindowHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows the subject when present', () => {
    render(<ComposeWindowHeader {...baseProps} subject="Hello there" />)
    expect(screen.getByText('Hello there')).toBeInTheDocument()
  })

  it('falls back to the new message label when subject is blank', () => {
    render(<ComposeWindowHeader {...baseProps} subject="   " />)
    expect(screen.getByText('new_message.string')).toBeInTheDocument()
  })

  describe('expanded state', () => {
    it('renders discard, minimize, maximize and close controls', () => {
      render(<ComposeWindowHeader {...baseProps} />)

      expect(screen.getByTitle('discard_draft.string')).toBeInTheDocument()
      expect(screen.getByText('minimize.string')).toBeInTheDocument()
      expect(screen.getByText('maximize.string')).toBeInTheDocument()
      expect(screen.getByText('close.string')).toBeInTheDocument()
      expect(screen.queryByText('restore.string')).not.toBeInTheDocument()
    })

    it('hides minimize/maximize controls on mobile', () => {
      render(<ComposeWindowHeader {...baseProps} isMobile />)

      expect(screen.queryByText('minimize.string')).not.toBeInTheDocument()
      expect(screen.queryByText('maximize.string')).not.toBeInTheDocument()
      expect(screen.getByTitle('discard_draft.string')).toBeInTheDocument()
    })

    it('calls onDiscardDraft and stops propagation when clicking discard', () => {
      const outerClick = jest.fn()
      render(
        <div onClick={outerClick}>
          <ComposeWindowHeader {...baseProps} />
        </div>
      )

      fireEvent.click(screen.getByTitle('discard_draft.string'))

      expect(baseProps.onDiscardDraft).toHaveBeenCalledTimes(1)
      expect(outerClick).not.toHaveBeenCalled()
    })

    it('calls onMinimize when clicking the minimize button', () => {
      render(<ComposeWindowHeader {...baseProps} />)
      fireEvent.click(screen.getByText('minimize.string'))
      expect(baseProps.onMinimize).toHaveBeenCalledTimes(1)
    })

    it('calls onMaximize when not maximized and clicking the maximize/restore button', () => {
      render(<ComposeWindowHeader {...baseProps} isMaximized={false} />)
      fireEvent.click(screen.getByText('maximize.string'))
      expect(baseProps.onMaximize).toHaveBeenCalledTimes(1)
      expect(baseProps.onRestore).not.toHaveBeenCalled()
    })

    it('calls onRestore instead of onMaximize when already maximized', () => {
      render(<ComposeWindowHeader {...baseProps} isMaximized />)
      fireEvent.click(screen.getByText('restore.string'))
      expect(baseProps.onRestore).toHaveBeenCalledTimes(1)
      expect(baseProps.onMaximize).not.toHaveBeenCalled()
    })

    it('calls onClose and stops propagation when clicking close', () => {
      const outerClick = jest.fn()
      render(
        <div onClick={outerClick}>
          <ComposeWindowHeader {...baseProps} />
        </div>
      )

      fireEvent.click(screen.getByText('close.string'))

      expect(baseProps.onClose).toHaveBeenCalledTimes(1)
      expect(outerClick).not.toHaveBeenCalled()
    })

    it('disables the close button while sending or uploading', () => {
      const { rerender } = render(
        <ComposeWindowHeader {...baseProps} isSending />
      )
      expect(screen.getByText('close.string').closest('button')).toBeDisabled()

      rerender(<ComposeWindowHeader {...baseProps} isUploading />)
      expect(screen.getByText('close.string').closest('button')).toBeDisabled()
    })
  })

  describe('minimized state', () => {
    it('only renders the restore control', () => {
      render(<ComposeWindowHeader {...baseProps} showMinimized />)

      expect(screen.getByText('restore.string')).toBeInTheDocument()
      expect(
        screen.queryByTitle('discard_draft.string')
      ).not.toBeInTheDocument()
      expect(screen.queryByText('minimize.string')).not.toBeInTheDocument()
    })

    it('calls onRestore when clicking the header container', () => {
      const { container } = render(
        <ComposeWindowHeader {...baseProps} showMinimized />
      )
      fireEvent.click(container.firstChild as HTMLElement)
      expect(baseProps.onRestore).toHaveBeenCalled()
    })
  })

  describe('dragging', () => {
    it('starts drag controls on pointer down when draggable', () => {
      const { container } = render(
        <ComposeWindowHeader {...baseProps} isDraggable />
      )
      fireEvent.pointerDown(container.firstChild as HTMLElement)
      expect(baseProps.dragControls.start).toHaveBeenCalledTimes(1)
    })

    it('does not start drag controls when not draggable', () => {
      const { container } = render(
        <ComposeWindowHeader {...baseProps} isDraggable={false} />
      )
      fireEvent.pointerDown(container.firstChild as HTMLElement)
      expect(baseProps.dragControls.start).not.toHaveBeenCalled()
    })
  })
})
