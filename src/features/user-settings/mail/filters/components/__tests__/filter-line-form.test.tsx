import { Form } from '@/components/ui/form'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { createEmptyFilter } from '../../mail-filters-utils'
import FilterLineForm from '../filter-line-form'
import type { FiltersFormValues } from '../filters-schema'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    'aria-label': ariaLabel,
  }: {
    checked: boolean
    onCheckedChange: (value: boolean) => void
    'aria-label'?: string
  }) => (
    <input
      type="checkbox"
      aria-label={ariaLabel}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}))

function Wrapper({
  filterOverrides = {},
  onEdit = jest.fn(),
  onDelete = jest.fn(),
}: {
  filterOverrides?: Partial<FiltersFormValues['filters'][number]>
  onEdit?: () => void
  onDelete?: () => void
}) {
  const form = useForm<FiltersFormValues>({
    defaultValues: {
      filters: [
        {
          ...createEmptyFilter(),
          name: 'Work filter',
          ...filterOverrides,
        },
      ],
    },
  })

  const field = {
    id: 'field-0',
    fieldKey: 'field-0',
  } as Parameters<typeof FilterLineForm>[0]['field']

  return (
    <Form {...form}>
      <FilterLineForm
        field={field}
        index={0}
        control={form.control}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Form>
  )
}

describe('FilterLineForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders drag handle, toggle and filter name', () => {
    render(<Wrapper />)
    expect(
      screen.getByRole('button', { name: 'list.drag_handle.string' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'aria.toggle_filter.string' })
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Work filter')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    render(<Wrapper onEdit={onEdit} />)
    await user.click(screen.getByRole('button', { name: 'form.edit.string' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    render(<Wrapper onDelete={onDelete} />)
    await user.click(
      screen.getByRole('button', { name: 'list.delete_confirm.confirm.string' })
    )
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('shows advanced structure badge when filter has nested rules', () => {
    render(<Wrapper filterOverrides={{ advancedStructure: true }} />)
    expect(
      screen.getByText('list.advanced_structure.string')
    ).toBeInTheDocument()
  })

  it('shows read-only badge when filter is read only', () => {
    render(<Wrapper filterOverrides={{ readOnly: true }} />)
    expect(screen.getByText('list.read_only.string')).toBeInTheDocument()
  })
})
