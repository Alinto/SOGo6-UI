import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import { AddressBook } from '../../address-books-types'
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
}))

describe('LabelsForm', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock translations
    ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
      const translations: Record<string, Record<string, string>> = {
        FORM_COMMONS: {},
        US_ADDRESS_BOOKS: {
          'create.string': 'Create',
          'accessibility.icon.delete.string': 'Delete {{name}}',
        },
      }
      return (key: string, variables?: Record<string, string>) => {
        let result = translations[namespace]?.[key] || key
        if (variables) {
          Object.entries(variables).forEach(([k, v]) => {
            result = result.replace(`{{${k}}}`, v)
          })
        }
        return result
      }
    })
  })

  it('should render the form with an empty list', () => {
    render(<LabelsForm data={[]} update={mockUpdate} />)

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('should render the form with initial data', () => {
    const data: AddressBook[] = [
      { id: '1', label: 'Personal' },
      { id: '2', label: 'Work' },
    ]

    render(<LabelsForm data={data} update={mockUpdate} />)

    // Get all input fields
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]

    // Verify we have 2 inputs
    expect(inputs).toHaveLength(2)

    // Verify the values are set correctly from initial data
    expect(inputs[0]).toHaveValue('Personal')
    expect(inputs[1]).toHaveValue('Work')
  })

  it('should render delete buttons for each address book', () => {
    const data: AddressBook[] = [
      { id: '1', label: 'Personal' },
      { id: '2', label: 'Work' },
    ]

    render(<LabelsForm data={data} update={mockUpdate} />)

    const trashIcons = screen.getAllByTestId('trash-icon')
    expect(trashIcons).toHaveLength(2)
  })

  it('should add a new address book when create button is clicked', async () => {
    const user = userEvent.setup()
    const data: AddressBook[] = [{ id: '1', label: 'Personal' }]

    const { rerender } = render(<LabelsForm data={data} update={mockUpdate} />)

    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    // After clicking, we should see a new empty input field
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle undefined data gracefully', () => {
    render(<LabelsForm data={undefined} update={mockUpdate} />)

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('should render the button group with correct props', () => {
    const data: AddressBook[] = [{ id: '1', label: 'Personal' }]

    render(<LabelsForm data={data} update={mockUpdate} />)

    expect(screen.getByTestId('button-group')).toBeInTheDocument()
  })

  it('should use correct translation namespaces', () => {
    const data: AddressBook[] = []

    render(<LabelsForm data={data} update={mockUpdate} />)

    expect(useTranslations).toHaveBeenCalledWith('FORM_COMMONS')
    expect(useTranslations).toHaveBeenCalledWith('US_ADDRESS_BOOKS')
  })

  it('should render form in grid layout', () => {
    const data: AddressBook[] = [
      { id: '1', label: 'Personal' },
      { id: '2', label: 'Work' },
    ]

    const { container } = render(<LabelsForm data={data} update={mockUpdate} />)

    const gridDiv = container.querySelector('.grid.gap-4.lg\\:grid-cols-2')
    expect(gridDiv).toBeInTheDocument()
  })

  it('should render form with correct base styles', () => {
    const data: AddressBook[] = []

    const { container } = render(<LabelsForm data={data} update={mockUpdate} />)

    const form = container.querySelector('form')
    expect(form).toHaveClass('p-4')
  })
})
