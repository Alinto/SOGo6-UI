import { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import LabelsForm from '../address-books-form-core'

// --- Mocks ---

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} type={type ?? 'button'} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  FormField: ({ render, name }: any) =>
    render({
      field: {
        value: '',
        onChange: jest.fn(),
        onBlur: jest.fn(),
        name,
        ref: jest.fn(),
      },
    }),
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormLabel: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
  FormMessage: () => null,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => {
  return function MockFixedFormButtonGroup({
    onReset,
    disableReset,
    disableSubmit,
  }: any) {
    return (
      <div data-testid="button-group">
        <button
          type="button"
          onClick={onReset}
          disabled={disableReset}
          data-testid="reset-btn"
        >
          Reset
        </button>
        <button type="submit" disabled={disableSubmit} data-testid="submit-btn">
          Submit
        </button>
      </div>
    )
  }
})

jest.mock('@radix-ui/react-accessible-icon', () => ({
  AccessibleIcon: ({ children, label }: any) => (
    <span aria-label={label}>{children}</span>
  ),
}))

jest.mock('lucide-react', () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
  Check: () => <svg data-testid="check-icon" />,
}))

jest.mock('../../store/address-books-utils', () => ({
  mapApiToContactGeneralSettings: jest.fn((data: any) => ({
    creationNotification: data?.creationNotification ?? false,
    categories: data?.categories ?? [],
  })),
  mapContactsSettingsToApi: jest.fn((values: any) => values),
}))

jest.mock('../address-books-schema', () => ({
  schema: { parse: jest.fn((v) => v) },
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (values: any) => ({ values, errors: {} }),
}))

// --- Helpers ---

const makePreferences = (
  categories: { name: string; color: string; canBeTranslated: boolean }[] = [],
  creationNotification = false
): UserPreferences =>
  ({
    creationNotification,
    categories,
  }) as unknown as UserPreferences

const setupTranslations = () => {
  ;(useTranslations as jest.Mock).mockImplementation(() => {
    const map: Record<string, string> = {
      'create.string': 'Create',
      'notification.title': 'Notify on creation',
      'notification.string': 'Receive a notification when a contact is created',
      'accessibility.icon.delete.string': 'Delete {{name}}',
    }
    return (key: string, vars?: Record<string, string>) => {
      let result = map[key] ?? key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v)
        })
      }
      return result
    }
  })
}

// --- Tests ---

describe('LabelsForm', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    setupTranslations()
  })

  // --- Rendering ---

  describe('Initial rendering', () => {
    it('renders the form element with p-4 class', () => {
      const { container } = render(
        <LabelsForm data={undefined} update={mockUpdate} />
      )
      expect(container.querySelector('form')).toHaveClass('p-4')
    })

    it('renders the Create button', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      expect(
        screen.getByRole('button', { name: /create/i })
      ).toBeInTheDocument()
    })

    it('renders the notification checkbox', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders the notification title label', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      expect(screen.getByText('Notify on creation')).toBeInTheDocument()
    })

    it('renders the notification description', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      expect(
        screen.getByText('Receive a notification when a contact is created')
      ).toBeInTheDocument()
    })

    it('renders the FixedFormButtonGroup', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      expect(screen.getByTestId('button-group')).toBeInTheDocument()
    })

    it('renders without crashing when data is undefined', () => {
      expect(() =>
        render(<LabelsForm data={undefined} update={mockUpdate} />)
      ).not.toThrow()
    })

    it('renders the categories grid container', () => {
      const { container } = render(
        <LabelsForm data={undefined} update={mockUpdate} />
      )
      expect(
        container.querySelector('.grid.gap-4.lg\\:grid-cols-2')
      ).toBeInTheDocument()
    })
  })

  // --- Rendering with data ---

  describe('Rendering with initial category data', () => {
    it('renders one input row per category', () => {
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
        { name: 'Work', color: '#ef4444', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)
      expect(screen.getAllByRole('textbox')).toHaveLength(2)
    })

    it('populates input values from initial categories', () => {
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
        { name: 'Work', color: '#ef4444', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      expect(inputs[0]).toHaveValue('Personal')
      expect(inputs[1]).toHaveValue('Work')
    })

    it('renders a trash icon for each category', () => {
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
        { name: 'Work', color: '#ef4444', canBeTranslated: false },
        { name: 'Family', color: '#10b981', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(3)
    })

    it('renders accessible delete label with interpolated category name', () => {
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)
      expect(screen.getByLabelText('Delete Personal')).toBeInTheDocument()
    })

    it('renders a color popover for each category', () => {
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
        { name: 'Work', color: '#ef4444', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)
      expect(screen.getAllByTestId('popover-content')).toHaveLength(2)
    })

    it('renders 10 color swatches inside each popover', () => {
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)
      // The popover content renders 10 color buttons
      const popover = screen.getByTestId('popover-content')
      const colorButtons = popover.querySelectorAll('button')
      expect(colorButtons).toHaveLength(10)
    })

    it('renders no category rows when categories array is empty', () => {
      render(<LabelsForm data={makePreferences([])} update={mockUpdate} />)
      expect(screen.queryAllByRole('textbox')).toHaveLength(0)
      expect(screen.queryAllByTestId('trash-icon')).toHaveLength(0)
    })
  })

  // --- Adding categories ---

  describe('Adding a new category', () => {
    it('adds a new row when Create is clicked', async () => {
      const user = userEvent.setup()
      render(<LabelsForm data={makePreferences([])} update={mockUpdate} />)

      await user.click(screen.getByRole('button', { name: /create/i }))

      expect(screen.getAllByRole('textbox')).toHaveLength(1)
    })

    it('adds multiple rows on repeated clicks', async () => {
      const user = userEvent.setup()
      render(<LabelsForm data={makePreferences([])} update={mockUpdate} />)

      const createBtn = screen.getByRole('button', { name: /create/i })
      await user.click(createBtn)
      await user.click(createBtn)
      await user.click(createBtn)

      expect(screen.getAllByRole('textbox')).toHaveLength(3)
    })

    it('new row input starts empty', async () => {
      const user = userEvent.setup()
      render(<LabelsForm data={makePreferences([])} update={mockUpdate} />)

      await user.click(screen.getByRole('button', { name: /create/i }))

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      expect(inputs[0]).toHaveValue('')
    })

    it('appends new row after existing categories', async () => {
      const user = userEvent.setup()
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)

      await user.click(screen.getByRole('button', { name: /create/i }))

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      expect(inputs).toHaveLength(2)
      expect(inputs[0]).toHaveValue('Personal')
      expect(inputs[1]).toHaveValue('')
    })

    it('new row has a trash icon', async () => {
      const user = userEvent.setup()
      render(<LabelsForm data={makePreferences([])} update={mockUpdate} />)

      await user.click(screen.getByRole('button', { name: /create/i }))

      expect(screen.getAllByTestId('trash-icon')).toHaveLength(1)
    })
  })

  // --- Removing categories ---

  describe('Removing a category', () => {
    it('removes a row when its delete button is clicked', async () => {
      const user = userEvent.setup()
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
        { name: 'Work', color: '#ef4444', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)

      await user.click(screen.getAllByLabelText(/delete/i)[0])

      expect(screen.getAllByRole('textbox')).toHaveLength(1)
    })

    it('removes all rows when each is deleted', async () => {
      const user = userEvent.setup()
      const data = makePreferences([
        { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
      ])
      render(<LabelsForm data={data} update={mockUpdate} />)

      await user.click(screen.getByLabelText('Delete Personal'))

      expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    })
  })

  // --- Translations ---

  describe('Translations', () => {
    it('calls useTranslations with US_ADDRESS_BOOKS namespace', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      expect(useTranslations).toHaveBeenCalledWith('US_ADDRESS_BOOKS')
    })

    it('only calls useTranslations with the US_ADDRESS_BOOKS namespace', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)
      const calls = (useTranslations as jest.Mock).mock.calls.map((c) => c[0])
      expect(calls.every((ns: string) => ns === 'US_ADDRESS_BOOKS')).toBe(true)
    })
  })

  // --- Form button group state ---

  describe('FixedFormButtonGroup', () => {
    it('disables reset and submit when form is pristine', () => {
      render(<LabelsForm data={makePreferences()} update={mockUpdate} />)
      expect(screen.getByTestId('reset-btn')).toBeDisabled()
      expect(screen.getByTestId('submit-btn')).toBeDisabled()
    })
  })
})
