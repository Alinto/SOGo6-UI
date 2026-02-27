import { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import LabelsForm from '../address-books-form-core'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormDescription: ({ children }: any) => <p>{children}</p>,
  FormField: ({ render, ...props }: any) =>
    render({ field: { value: '', onChange: jest.fn(), ...props } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => null,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => {
  return function MockButtonGroup(props: any) {
    return (
      <div data-testid="button-group">
        <button
          onClick={props.onReset}
          disabled={props.disableReset}
          data-testid="reset-btn"
        >
          Reset
        </button>
        <button disabled={props.disableSubmit} data-testid="submit-btn">
          Submit
        </button>
      </div>
    )
  }
})

jest.mock('@radix-ui/react-accessible-icon', () => ({
  AccessibleIcon: ({ children, label }: any) => (
    <div title={label}>{children}</div>
  ),
}))

jest.mock('lucide-react', () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
  Check: () => <svg data-testid="check-icon" />,
}))

// Mock the store utils so we control what the form receives
jest.mock('../../store/address-books-utils', () => ({
  mapApiToContactGeneralSettings: (data: any) => ({
    creationNotification: data?.creationNotification ?? false,
    categories: data?.categories ?? [],
  }),
  mapContactsSettingsToApi: (values: any) => values,
}))

// Helper to build a UserPreferences-shaped object for tests
const makePreferences = (
  categories: { name: string; color: string; canBeTranslated: boolean }[] = [],
  creationNotification = false
): UserPreferences =>
  ({
    creationNotification,
    categories,
  }) as unknown as UserPreferences

describe('LabelsForm', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockImplementation(() => {
      const translations: Record<string, string> = {
        'create.string': 'Create',
        'notification.title': 'Notification Title',
        'notification.string': 'Notification Description',
        'accessibility.icon.delete.string': 'Delete {{name}}',
      }
      return (key: string, variables?: Record<string, string>) => {
        let result = translations[key] ?? key
        if (variables) {
          Object.entries(variables).forEach(([k, v]) => {
            result = result.replace(`{{${k}}}`, v)
          })
        }
        return result
      }
    })
  })

  it('should render the form with no categories', () => {
    render(<LabelsForm data={undefined} update={mockUpdate} />)

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('should render delete buttons for each category', () => {
    const data = makePreferences([
      { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
      { name: 'Work', color: '#ef4444', canBeTranslated: false },
    ])

    render(<LabelsForm data={data} update={mockUpdate} />)

    const trashIcons = screen.getAllByTestId('trash-icon')
    expect(trashIcons).toHaveLength(2)
  })

  it('should add a new category row when create button is clicked', async () => {
    const user = userEvent.setup()
    const data = makePreferences([
      { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
    ])

    render(<LabelsForm data={data} update={mockUpdate} />)

    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle undefined data gracefully', () => {
    render(<LabelsForm data={undefined} update={mockUpdate} />)

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('should render the button group', () => {
    render(<LabelsForm data={makePreferences()} update={mockUpdate} />)

    expect(screen.getByTestId('button-group')).toBeInTheDocument()
  })

  it('should use the US_ADDRESS_BOOKS translation namespace', () => {
    render(<LabelsForm data={makePreferences()} update={mockUpdate} />)

    expect(useTranslations).toHaveBeenCalledWith('US_ADDRESS_BOOKS')
  })

  it('should render categories in a grid layout', () => {
    const data = makePreferences([
      { name: 'Personal', color: '#3b82f6', canBeTranslated: false },
      { name: 'Work', color: '#ef4444', canBeTranslated: false },
    ])

    const { container } = render(<LabelsForm data={data} update={mockUpdate} />)

    const gridDiv = container.querySelector('.grid.gap-4.lg\\:grid-cols-2')
    expect(gridDiv).toBeInTheDocument()
  })

  it('should render the form with correct base styles', () => {
    const { container } = render(
      <LabelsForm data={makePreferences()} update={mockUpdate} />
    )

    const form = container.querySelector('form')
    expect(form).toHaveClass('p-4')
  })
})
