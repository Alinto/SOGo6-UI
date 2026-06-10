import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MailLabelPickerDialog from '../mail-label-picker-dialog'

const mockUseGetMailLabelsSettingsQuery = jest.fn()

jest.mock(
  '@/features/user-settings/mail/labels/store/mail-labels-settings-api',
  () => ({
    useGetMailLabelsSettingsQuery: (...args: unknown[]) =>
      mockUseGetMailLabelsSettingsQuery(...args),
  })
)

jest.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="labels-settings-link">
      {children}
    </a>
  ),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  appliedFlags: ['$label1'],
  onApplyLabel: jest.fn().mockResolvedValue(undefined),
  onRemoveLabel: jest.fn().mockResolvedValue(undefined),
}

const mockLabels = [
  { id: '1', label: 'Important', color: '#ff0000', IMAPLabel: '$label1' },
  { id: '2', label: 'Work', color: '#00ff00', IMAPLabel: '$label2' },
]

describe('MailLabelPickerDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetMailLabelsSettingsQuery.mockReturnValue({
      data: mockLabels,
      isFetching: false,
    })
  })

  describe('basic rendering', () => {
    it('renders dialog title and labels', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(screen.getByText('label.string')).toBeInTheDocument()
      expect(screen.getByText('Important')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    it('shows loading spinner when fetching without labels', () => {
      mockUseGetMailLabelsSettingsQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
      })
      const { container } = render(<MailLabelPickerDialog {...defaultProps} />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('skips query when dialog is closed', () => {
      render(<MailLabelPickerDialog {...defaultProps} open={false} />)
      expect(mockUseGetMailLabelsSettingsQuery).toHaveBeenCalledWith(
        undefined,
        { skip: true }
      )
    })

    it('calls onApplyLabel when unchecked label is checked', async () => {
      const onApplyLabel = jest.fn().mockResolvedValue(undefined)
      render(
        <MailLabelPickerDialog
          {...defaultProps}
          appliedFlags={[]}
          onApplyLabel={onApplyLabel}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      await waitFor(() => {
        expect(onApplyLabel).toHaveBeenCalledWith('$label1')
      })
    })

    it('calls onRemoveLabel when applied label is unchecked', async () => {
      const onRemoveLabel = jest.fn().mockResolvedValue(undefined)
      render(
        <MailLabelPickerDialog
          {...defaultProps}
          onRemoveLabel={onRemoveLabel}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      await waitFor(() => {
        expect(onRemoveLabel).toHaveBeenCalledWith('$label1')
      })
    })

    it('closes dialog when cancel button is clicked', () => {
      const onOpenChange = jest.fn()
      render(
        <MailLabelPickerDialog
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'ham_confirm.cancel.string' })
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('integration', () => {
    it('renders link to label settings', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      const link = screen.getByTestId('labels-settings-link')
      expect(link).toHaveAttribute('href', '/user-settings/mail/labels')
    })

    it('shows empty state when no labels exist', () => {
      mockUseGetMailLabelsSettingsQuery.mockReturnValue({
        data: [],
        isFetching: false,
      })
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(screen.getAllByText('title.string').length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('associates checkboxes with label text', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })
  })
})
