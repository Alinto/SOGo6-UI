import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MailBulkLabelPickerDialog from '../mail-bulk-label-picker-dialog'

const mockUseGetUserPreferencesQuery = jest.fn()
const mockUpdateCategories = jest.fn(() => ({
  unwrap: () => Promise.resolve(undefined),
}))

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useGetUserPreferencesQuery: (...args: unknown[]) =>
    mockUseGetUserPreferencesQuery(...args),
  useUpdateUserPreferencesMailCategoryMutation: () => [
    mockUpdateCategories,
    { isLoading: false },
  ],
}))

jest.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="categories-settings-link">
      {children}
    </a>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/color-picker', () => ({
  DEFAULT_COLORS: ['#ef4444', '#f97316'],
  ColorPicker: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (color: string) => void
  }) => (
    <button
      type="button"
      data-testid="color-picker"
      data-value={value}
      onClick={() => onChange('#ff0000')}
    >
      color-picker
    </button>
  ),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onApplyLabels: jest.fn().mockResolvedValue(undefined),
}

const mockCategories = [
  { name: 'Important', color: '#ff0000', is_default: false },
  { name: 'Work', color: '#00ff00', is_default: false },
]

const buildPreferences = (categories: typeof mockCategories) => ({
  data: {
    data: {
      USER_MAIL_CATEGORY_SETTINGS: {
        SOGO_U_MAIL_CATEGORIES: categories,
      },
    },
  },
  isFetching: false,
})

describe('MailBulkLabelPickerDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetUserPreferencesQuery.mockReturnValue(
      buildPreferences(mockCategories)
    )
  })

  it('renders dialog title and categories', () => {
    render(<MailBulkLabelPickerDialog {...defaultProps} />)
    expect(screen.getByText('label.string')).toBeInTheDocument()
    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('disables the apply button until a label is selected', () => {
    render(<MailBulkLabelPickerDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    ).toBeDisabled()
  })

  it('applies the selected labels and closes on Apply', async () => {
    const onApplyLabels = jest.fn().mockResolvedValue(undefined)
    const onOpenChange = jest.fn()
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        onApplyLabels={onApplyLabels}
        onOpenChange={onOpenChange}
      />
    )

    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    )

    await waitFor(() => {
      expect(onApplyLabels).toHaveBeenCalledWith(['Work'])
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('creates a new tag and applies it along with existing selections', async () => {
    const onApplyLabels = jest.fn().mockResolvedValue(undefined)
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        onApplyLabels={onApplyLabels}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
    )
    fireEvent.change(
      screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string'),
      { target: { value: 'Urgent' } }
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.create.string' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    )

    await waitFor(() => {
      expect(mockUpdateCategories).toHaveBeenCalledWith({
        SOGO_U_MAIL_CATEGORIES: expect.arrayContaining([
          { name: 'Urgent', color: '#ef4444', is_default: false },
        ]),
      })
      expect(onApplyLabels).toHaveBeenCalledWith(
        expect.arrayContaining(['Urgent'])
      )
    })
  })

  it('pre-checks a label already applied to every selected mail', () => {
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        selectedMailsFlags={[['Work'], ['Work']]}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toHaveAttribute('data-state', 'unchecked') // Important
    expect(checkboxes[1]).toHaveAttribute('data-state', 'checked') // Work
  })

  it('shows a label applied to only some selected mails as indeterminate', () => {
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        selectedMailsFlags={[['Work'], []]}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[1]).toHaveAttribute('data-state', 'indeterminate')
    expect(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    ).toBeDisabled()
  })

  it('applying to all selected mails when clicking an indeterminate label', async () => {
    const onApplyLabels = jest.fn().mockResolvedValue(undefined)
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        selectedMailsFlags={[['Work'], []]}
        onApplyLabels={onApplyLabels}
      />
    )
    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    )
    await waitFor(() => {
      expect(onApplyLabels).toHaveBeenCalledWith(['Work'])
    })
  })

  it('removes a pre-checked label when it is unchecked', async () => {
    const onApplyLabels = jest.fn().mockResolvedValue(undefined)
    const onRemoveLabels = jest.fn().mockResolvedValue(undefined)
    const onOpenChange = jest.fn()
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        selectedMailsFlags={[['Work'], ['Work']]}
        onApplyLabels={onApplyLabels}
        onRemoveLabels={onRemoveLabels}
        onOpenChange={onOpenChange}
      />
    )
    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    )
    await waitFor(() => {
      expect(onRemoveLabels).toHaveBeenCalledWith(['Work'])
      expect(onApplyLabels).not.toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('does not apply labels when saving a new tag fails', async () => {
    mockUpdateCategories.mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('network error')),
    })
    const onApplyLabels = jest.fn().mockResolvedValue(undefined)
    const onOpenChange = jest.fn()
    render(
      <MailBulkLabelPickerDialog
        {...defaultProps}
        onApplyLabels={onApplyLabels}
        onOpenChange={onOpenChange}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
    )
    fireEvent.change(
      screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string'),
      { target: { value: 'Urgent' } }
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.create.string' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'label_dialog.apply.string' })
    )

    await waitFor(() => {
      expect(mockUpdateCategories).toHaveBeenCalled()
    })

    expect(onApplyLabels).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
