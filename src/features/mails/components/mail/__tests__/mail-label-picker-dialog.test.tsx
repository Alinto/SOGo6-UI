import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MailLabelPickerDialog from '../mail-label-picker-dialog'

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
  appliedFlags: ['Important'],
  onApplyLabel: jest.fn().mockResolvedValue(undefined),
  onRemoveLabel: jest.fn().mockResolvedValue(undefined),
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

describe('MailLabelPickerDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetUserPreferencesQuery.mockReturnValue(
      buildPreferences(mockCategories)
    )
  })

  describe('basic rendering', () => {
    it('renders dialog title and categories', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(screen.getByText('label.string')).toBeInTheDocument()
      expect(screen.getByText('Important')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    it('shows loading spinner when fetching without categories', () => {
      mockUseGetUserPreferencesQuery.mockReturnValue({
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
      expect(mockUseGetUserPreferencesQuery).toHaveBeenCalledWith(undefined, {
        skip: true,
      })
    })

    it('does not call the API when a checkbox is toggled', () => {
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

      expect(onApplyLabel).not.toHaveBeenCalled()
    })

    it('closes dialog when cancel button is clicked', () => {
      const onOpenChange = jest.fn()
      render(
        <MailLabelPickerDialog {...defaultProps} onOpenChange={onOpenChange} />
      )
      fireEvent.click(
        screen.getAllByRole('button', { name: 'ham_confirm.cancel.string' })[0]
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('applying changes', () => {
    it('disables the apply button until a change is made', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: 'label_dialog.apply.string' })
      ).toBeDisabled()
    })

    it('enables the apply button once a checkbox is toggled', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(screen.getAllByRole('checkbox')[1])
      expect(
        screen.getByRole('button', { name: 'label_dialog.apply.string' })
      ).not.toBeDisabled()
    })

    it('calls onApplyLabel and onRemoveLabel for the diff when Apply is clicked, then closes', async () => {
      const onApplyLabel = jest.fn().mockResolvedValue(undefined)
      const onRemoveLabel = jest.fn().mockResolvedValue(undefined)
      const onOpenChange = jest.fn()
      render(
        <MailLabelPickerDialog
          {...defaultProps}
          onApplyLabel={onApplyLabel}
          onRemoveLabel={onRemoveLabel}
          onOpenChange={onOpenChange}
        />
      )

      // 'Important' is applied initially, 'Work' is not.
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // uncheck Important
      fireEvent.click(checkboxes[1]) // check Work

      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.apply.string' })
      )

      await waitFor(() => {
        expect(onApplyLabel).toHaveBeenCalledWith('Work')
        expect(onRemoveLabel).toHaveBeenCalledWith('Important')
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('resets pending selection when the dialog is reopened', () => {
      const { rerender } = render(
        <MailLabelPickerDialog {...defaultProps} open={false} />
      )
      rerender(<MailLabelPickerDialog {...defaultProps} open={true} />)

      expect(
        screen.getByRole('button', { name: 'label_dialog.apply.string' })
      ).toBeDisabled()
    })
  })

  describe('creating a new tag', () => {
    it('reveals the create-tag form when "New tag" is clicked', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      expect(
        screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string')
      ).toBeInTheDocument()
    })

    it('disables create until a name is entered', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      expect(
        screen.getByRole('button', { name: 'label_dialog.create.string' })
      ).toBeDisabled()
    })

    it('disables create and shows an error when the name matches an existing category', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      fireEvent.change(
        screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string'),
        { target: { value: 'Work' } }
      )

      expect(
        screen.getByText('label_dialog.duplicate_name.string')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'label_dialog.create.string' })
      ).toBeDisabled()
    })

    it('is case-insensitive when detecting a duplicate name', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      fireEvent.change(
        screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string'),
        { target: { value: 'work' } }
      )

      expect(
        screen.getByRole('button', { name: 'label_dialog.create.string' })
      ).toBeDisabled()
    })

    it('does not create a pending tag when clicking Create with a duplicate name', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      fireEvent.change(
        screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string'),
        { target: { value: 'Work' } }
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.create.string' })
      )

      // Still only the two original categories are rendered.
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })

    it('does not call the API when a new tag is created', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      fireEvent.click(screen.getByTestId('color-picker'))
      fireEvent.change(
        screen.getByPlaceholderText('label_dialog.new_tag_placeholder.string'),
        { target: { value: 'Urgent' } }
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.create.string' })
      )

      expect(mockUpdateCategories).not.toHaveBeenCalled()
      expect(screen.getByText('Urgent')).toBeInTheDocument()
    })

    it('uses the color already shown in the picker when none is explicitly chosen', async () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      // Note: the color picker is never clicked here, matching a user who
      // accepts the swatch already displayed instead of picking one.
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
      })
    })

    it('enables the apply button once a new tag is created', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
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

      expect(
        screen.getByRole('button', { name: 'label_dialog.apply.string' })
      ).not.toBeDisabled()
    })

    it('creates the tag and applies it to the mail when Apply is clicked', async () => {
      const onApplyLabel = jest.fn().mockResolvedValue(undefined)
      render(
        <MailLabelPickerDialog {...defaultProps} onApplyLabel={onApplyLabel} />
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'label_dialog.new_tag.string' })
      )
      fireEvent.click(screen.getByTestId('color-picker'))
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
          SOGO_U_MAIL_CATEGORIES: [
            { name: 'Important', color: '#ff0000', is_default: false },
            { name: 'Urgent', color: '#ff0000', is_default: false },
            { name: 'Work', color: '#00ff00', is_default: false },
          ],
        })
        expect(onApplyLabel).toHaveBeenCalledWith('Urgent')
      })
    })
  })

  describe('integration', () => {
    it('renders link to the mail categories settings page', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      const link = screen.getByTestId('categories-settings-link')
      expect(link).toHaveAttribute('href', '/user_settings/mail/categories')
    })

    it('shows empty state when no categories exist', () => {
      mockUseGetUserPreferencesQuery.mockReturnValue(buildPreferences([]))
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(screen.getByText('label_dialog.empty.string')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('associates checkboxes with category text', () => {
      render(<MailLabelPickerDialog {...defaultProps} />)
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })
  })
})
