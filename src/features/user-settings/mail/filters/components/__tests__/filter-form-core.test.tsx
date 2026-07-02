import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { createEmptyFilter } from '../../mail-filters-utils'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('../folder-select-field', () => ({
  __esModule: true,
  default: () => <div data-testid="folder-select" />,
}))

jest.mock('../filter-schema', () => ({
  createSingleFilterSchema: jest.fn(() => ({})),
  defaultFilterValues: {
    id: 'default',
    name: '',
    operator: 'AND',
    enabled: true,
    rules: [
      {
        id: 'r1',
        field: 'header',
        field_value: 'X-Custom',
        condition: 'CONTAINS',
        value: 'value',
      },
    ],
    actions: [{ id: 'a1', action: 'move', value: 'INBOX' }],
  },
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: React.ComponentProps<'input'>) => (
    <input type="checkbox" {...props} />
  ),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

jest.mock('@/components/ui/forms/select-form', () => ({
  __esModule: true,
  default: ({
    options,
    value,
  }: {
    options: { value: string; label: string; disabled?: boolean }[]
    value: string
  }) => (
    <select data-testid="select" value={value} readOnly>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  ),
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormField: ({
    name,
    render,
  }: {
    name: string
    render: (args: {
      field: { value: string; onChange: jest.Mock }
    }) => React.ReactNode
  }) => {
    const defaults: Record<string, string> = {
      name: 'My filter',
      operator: 'AND',
      'rules.0.field': 'header',
      'rules.0.condition': 'CONTAINS',
      'rules.0.value': 'value',
      'rules.0.field_value': 'X-Custom',
      'actions.0.action': 'move',
      'actions.0.value': 'INBOX',
    }
    return render({
      field: {
        value: defaults[name] ?? '',
        onChange: jest.fn(),
      },
    })
  },
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormMessage: () => null,
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: unknown) => ({ values, errors: {} })),
}))

const mockReset = jest.fn()
const mockHandleSubmit = jest.fn(
  (handler: (values: unknown) => void) => (event?: React.FormEvent) => {
    event?.preventDefault?.()
    handler({
      name: 'My filter',
      operator: 'AND',
      rules: [
        {
          id: 'r1',
          field: 'header',
          field_value: 'X-Custom',
          condition: 'CONTAINS',
          value: 'value',
        },
      ],
      actions: [{ id: 'a1', action: 'move', value: 'INBOX' }],
    })
  }
)

const mockWatch = jest.fn((name?: string) => {
  if (name === 'operator') return 'AND'
  if (name === 'name') return 'My filter'
  if (name === 'rules.0.field') return 'header'
  if (name === 'actions.0.action') return 'move'
  return ''
})

const stableForm = {
  control: {},
  reset: mockReset,
  handleSubmit: mockHandleSubmit,
  watch: mockWatch,
  formState: { isDirty: true, isSubmitting: false },
}

jest.mock('react-hook-form', () => ({
  useForm: () => stableForm,
  useWatch: ({ name }: { name: string }) => mockWatch(name),
  useFieldArray: () => ({
    fields: [{ fieldKey: 'rule-1' }],
    remove: jest.fn(),
    insert: jest.fn(),
  }),
}))

import FilterEditDialog from '../filter-form-core'

describe('FilterEditDialog', () => {
  const onSave = jest.fn()
  const onOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
      const map: Record<string, Record<string, string>> = {
        US_MAIL_FILTERS: {
          'form.create.string': 'Create filter',
          'form.edit.string': 'Edit filter: {name}',
          'labels.filter_name.string': 'Filter name',
          'labels.custom_header.string': 'Header name',
          'operators.title.string': 'For incoming messages that',
          'conditions.title.string': 'Match the following conditions',
          'actions.title.string': 'Perform the following actions',
          'actions.flag.disabled_tooltip.string': 'Flag unavailable',
          'actions.reject.disabled_tooltip.string': 'Reject unavailable',
          'actions.move.string': 'File the message in',
          'actions.flag.string': 'Flag',
          'actions.reject.string': 'Reject',
          'folder_select.create_if_missing.string': 'Create folder if missing',
          'operators.and.string': 'Match all rules',
          'operators.or.string': 'Match any rule',
          'operators.all.string': 'Match all messages',
          'rules.from.string': 'From',
          'rules.to.string': 'To',
          'rules.subject.string': 'Subject',
          'rules.header.string': 'Header',
          'conditions.contains.string': 'Contains',
        },
        FORM_COMMONS: {
          'cancel.default.string': 'Cancel',
          'save.default.string': 'Save',
        },
      }
      return (key: string, values?: Record<string, string>) => {
        const raw = map[namespace]?.[key] ?? key
        if (!values) return raw
        return Object.entries(values).reduce(
          (acc, [k, v]) => acc.replace(`{${k}}`, v),
          raw
        )
      }
    })
  })

  it('renders dialog with header field when field is header', () => {
    render(
      <FilterEditDialog
        open
        filter={createEmptyFilter()}
        accountId="0"
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    )

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('Header name')).toBeInTheDocument()
    expect(screen.getByTestId('folder-select')).toBeInTheDocument()
  })

  it('exposes disabled flag and reject actions in action select', () => {
    render(
      <FilterEditDialog
        open
        filter={createEmptyFilter()}
        accountId="0"
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    )

    const flagOption = screen.getByRole('option', { name: 'Flag' })
    const rejectOption = screen.getByRole('option', { name: 'Reject' })

    expect(flagOption).toBeDisabled()
    expect(rejectOption).toBeDisabled()
  })

  it('resets form values when dialog opens', () => {
    render(
      <FilterEditDialog
        open
        filter={createEmptyFilter()}
        accountId="0"
        onOpenChange={onOpenChange}
        onSave={onSave}
      />
    )

    expect(mockReset).toHaveBeenCalled()
  })
})
