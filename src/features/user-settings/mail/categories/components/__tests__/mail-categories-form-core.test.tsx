import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import LabelsForm from '../mail-categories-form-core'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) =>
    render({ field: { value: '', onChange: jest.fn() } }),
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormMessage: () => null,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => {
  return function MockFixedFormButtonGroup(props: any) {
    return (
      <div data-testid="button-group">
        <button
          type="button"
          onClick={props.onReset}
          disabled={props.disableReset}
          data-testid="reset-btn"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={props.disableSubmit}
          data-testid="submit-btn"
        >
          Submit
        </button>
      </div>
    )
  }
})

jest.mock('@radix-ui/react-accessible-icon', () => ({
  AccessibleIcon: ({ children, label }: any) => (
    <div aria-label={label}>{children}</div>
  ),
}))

jest.mock('lucide-react', () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
  Check: () => <svg data-testid="check-icon" />,
}))

jest.mock('../../../store/mail-utils', () => ({
  mapApiToMailCategorySettings: jest.fn((data) => data),
  mapMailCategorySettingsToApi: jest.fn((data) => data),
}))

jest.mock('../mail-categories-schema', () => ({
  createSchema: jest.fn(() => ({
    parse: jest.fn((v) => v),
  })),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: any) => ({ values, errors: {} })),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUpdate = jest.fn()

const dataWithCategories = {
  categories: [
    { name: 'Work', color: '#3b82f6', isDefault: false },
    { name: 'Personal', color: '#ef4444', isDefault: false },
  ],
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      US_MAIL_CATEGORIES: {
        'create.string': 'Create',
        'accessibility.icon.delete.string': 'Delete {{name}}',
      },
    }
    return (key: string, variables?: Record<string, string>) => {
      let result = translations[namespace]?.[key] ?? key
      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v)
        })
      }
      return result
    }
  })
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MailCategoriesForm', () => {
  describe('rendering', () => {
    it('renders without crashing when data is undefined', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(
        screen.getByRole('button', { name: /create/i })
      ).toBeInTheDocument()
    })

    it('renders the form element with correct base styles', () => {
      const { container } = render(
        <LabelsForm data={undefined} update={mockUpdate} />
      )

      expect(container.querySelector('form')).toHaveClass('p-4')
    })

    it('renders the create button', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(
        screen.getByRole('button', { name: /create/i })
      ).toBeInTheDocument()
    })

    it('renders the fixed button group with reset and submit', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('button-group')).toBeInTheDocument()
      expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    })

    it('renders the categories grid container', () => {
      render(
        <LabelsForm data={dataWithCategories as any} update={mockUpdate} />
      )

      expect(
        document.querySelector('.grid.gap-4.lg\\:grid-cols-2')
      ).toBeInTheDocument()
    })

    it('renders no category rows when data is undefined', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(screen.queryAllByTestId('trash-icon')).toHaveLength(0)
    })
  })

  describe('with category data', () => {
    it('renders a trash icon for each category', () => {
      render(
        <LabelsForm data={dataWithCategories as any} update={mockUpdate} />
      )

      expect(screen.getAllByTestId('trash-icon')).toHaveLength(2)
    })

    it('renders a text input for each category name', () => {
      render(
        <LabelsForm data={dataWithCategories as any} update={mockUpdate} />
      )

      expect(screen.getAllByPlaceholderText('Key')).toHaveLength(2)
    })

    it('renders accessible delete labels with interpolated category names', () => {
      render(
        <LabelsForm data={dataWithCategories as any} update={mockUpdate} />
      )

      expect(screen.getByLabelText('Delete Work')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Personal')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('adds a new category row when the create button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <LabelsForm data={dataWithCategories as any} update={mockUpdate} />
      )

      const before = screen.getAllByTestId('trash-icon').length

      await user.click(screen.getByRole('button', { name: /create/i }))

      expect(screen.getAllByTestId('trash-icon').length).toBe(before + 1)
    })

    it('removes a category row when a delete button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <LabelsForm data={dataWithCategories as any} update={mockUpdate} />
      )

      const deleteButton = screen
        .getAllByTestId('trash-icon')[0]
        .closest('button')!

      await user.click(deleteButton)

      expect(screen.getAllByTestId('trash-icon')).toHaveLength(1)
    })

    it('disables reset and submit buttons when the form is pristine', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('reset-btn')).toBeDisabled()
      expect(screen.getByTestId('submit-btn')).toBeDisabled()
    })
  })

  describe('translations', () => {
    it('calls useTranslations with the correct namespace', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(useTranslations).toHaveBeenCalledWith('US_MAIL_CATEGORIES')
    })
  })
})
