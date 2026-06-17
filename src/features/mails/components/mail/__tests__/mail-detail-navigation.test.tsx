import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailDetailNavigation from '../mail-detail-navigation'

const mockGoPrev = jest.fn()
const mockGoNext = jest.fn()

const mockUseMailDetailNavigation = jest.fn(() => ({
  isActive: true,
  canGoPrev: true,
  canGoNext: true,
  goPrev: mockGoPrev,
  goNext: mockGoNext,
  currentPosition: 2,
  totalInPage: 5,
}))

jest.mock('@/features/mails/hooks/use-mail-detail-navigation', () => ({
  useMailDetailNavigation: () => mockUseMailDetailNavigation(),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'aria-label': ariaLabel,
    ...props
  }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}))

describe('MailDetailNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMailDetailNavigation.mockReturnValue({
      isActive: true,
      canGoPrev: true,
      canGoNext: true,
      goPrev: mockGoPrev,
      goNext: mockGoNext,
      currentPosition: 2,
      totalInPage: 5,
    })
  })

  describe('basic rendering', () => {
    it('renders previous and next navigation buttons when active', () => {
      render(<MailDetailNavigation />)

      expect(
        screen.getByRole('button', { name: 'previous-mail.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'next-mail.string' })
      ).toBeInTheDocument()
    })

    it('renders nothing when navigation is inactive', () => {
      mockUseMailDetailNavigation.mockReturnValue({
        isActive: false,
        canGoPrev: false,
        canGoNext: false,
        goPrev: mockGoPrev,
        goNext: mockGoNext,
        currentPosition: null,
        totalInPage: null,
      })

      const { container } = render(<MailDetailNavigation />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('configuration', () => {
    it('shows the position indicator when showPosition is true', () => {
      render(<MailDetailNavigation showPosition />)

      expect(screen.getByText('2 / 5')).toBeInTheDocument()
    })

    it('hides the position indicator when showPosition is false', () => {
      render(<MailDetailNavigation />)

      expect(screen.queryByText('2 / 5')).not.toBeInTheDocument()
    })

    it('disables previous button when canGoPrev is false', () => {
      mockUseMailDetailNavigation.mockReturnValue({
        isActive: true,
        canGoPrev: false,
        canGoNext: true,
        goPrev: mockGoPrev,
        goNext: mockGoNext,
        currentPosition: 1,
        totalInPage: 5,
      })

      render(<MailDetailNavigation />)

      expect(
        screen.getByRole('button', { name: 'previous-mail.string' })
      ).toBeDisabled()
    })

    it('disables next button when canGoNext is false', () => {
      mockUseMailDetailNavigation.mockReturnValue({
        isActive: true,
        canGoPrev: true,
        canGoNext: false,
        goPrev: mockGoPrev,
        goNext: mockGoNext,
        currentPosition: 5,
        totalInPage: 5,
      })

      render(<MailDetailNavigation />)

      expect(
        screen.getByRole('button', { name: 'next-mail.string' })
      ).toBeDisabled()
    })
  })

  describe('custom styling', () => {
    it('applies flex layout to the navigation container', () => {
      const { container } = render(<MailDetailNavigation />)

      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('flex', 'items-center')
    })
  })

  describe('accessibility', () => {
    it('exposes translated aria labels on navigation buttons', () => {
      render(<MailDetailNavigation />)

      expect(
        screen.getByRole('button', { name: 'previous-mail.string' })
      ).toHaveAttribute('aria-label', 'previous-mail.string')
      expect(
        screen.getByRole('button', { name: 'next-mail.string' })
      ).toHaveAttribute('aria-label', 'next-mail.string')
    })
  })

  describe('integration', () => {
    it('calls goPrev when previous button is clicked', () => {
      render(<MailDetailNavigation />)

      fireEvent.click(
        screen.getByRole('button', { name: 'previous-mail.string' })
      )

      expect(mockGoPrev).toHaveBeenCalledTimes(1)
    })

    it('calls goNext when next button is clicked', () => {
      render(<MailDetailNavigation />)

      fireEvent.click(screen.getByRole('button', { name: 'next-mail.string' }))

      expect(mockGoNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('component stability', () => {
    it('renders consistently across multiple renders', () => {
      const { rerender } = render(<MailDetailNavigation showPosition />)

      expect(screen.getByText('2 / 5')).toBeInTheDocument()

      rerender(<MailDetailNavigation showPosition />)

      expect(screen.getByText('2 / 5')).toBeInTheDocument()
    })
  })
})
