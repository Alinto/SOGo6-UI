import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import type { MailFilter } from '../../mail-filters-types'
import { createEmptyFilter } from '../../mail-filters-utils'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/dnd/sortable-container', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-container">{children}</div>
  ),
}))

jest.mock('@/components/dnd/sortable-item', () => ({
  __esModule: true,
  default: ({
    children,
  }: {
    children: React.ReactElement
  }) => children,
}))

jest.mock('../filter-line-form', () => ({
  __esModule: true,
  default: ({
    onEdit,
    onDelete,
  }: {
    onEdit: () => void
    onDelete: () => void
  }) => (
    <div data-testid="filter-line">
      <button type="button" onClick={onEdit}>
        Edit
      </button>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
}))

jest.mock('../filter-form', () => ({
  __esModule: true,
  default: ({
    open,
    onSave,
  }: {
    open: boolean
    onSave: (filter: MailFilter) => void
  }) =>
    open ? (
      <button
        type="button"
        data-testid="dialog-save"
        onClick={() =>
          onSave({
            ...createEmptyFilter(),
            name: 'New filter',
          })
        }
      >
        Save dialog
      </button>
    ) : null,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
}))

jest.mock('@/features/user-settings/components/settings-form-action-bar', () => ({
  __esModule: true,
  default: () => (
    <button type="submit" data-testid="submit-btn">
      Save
    </button>
  ),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: unknown) => ({ values, errors: {} })),
}))

import MailFiltersSettingsForm from '../filters-form-core'

const mockUpdate = jest.fn()

const sampleFilters: MailFilter[] = [
  {
    ...createEmptyFilter(),
    id: 'f1',
    name: 'Filter 1',
    rules: [
      {
        id: 'r1',
        field: 'from',
        condition: 'CONTAINS',
        value: 'test@example.com',
      },
    ],
    actions: [{ id: 'a1', action: 'keep', value: '' }],
  },
]

describe('MailFiltersSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
      const map: Record<string, Record<string, string>> = {
        US_MAIL_FILTERS: {
          'empty_state.title.string': 'No mail filters yet',
          'empty_state.description.string': 'Create rules to organize mail.',
          'empty_state.add_button.string': 'Add your first filter',
          'list.add_filter.string': 'Add filter',
          'list.delete_confirm.title.string': 'Delete filter?',
          'list.delete_confirm.description.string': 'Removed on save.',
          'list.delete_confirm.confirm.string': 'Delete',
          'list.delete_confirm.cancel.string': 'Cancel',
        },
        FORM_COMMONS: {
          'reset.default.string': 'Reset',
          'save.default.string': 'Save',
        },
      }
      return (key: string) => map[namespace]?.[key] ?? key
    })
    mockUpdate.mockReturnValue({ unwrap: () => Promise.resolve(sampleFilters) })
  })

  it('renders empty state when no filters', () => {
    render(
      <MailFiltersSettingsForm
        data={[]}
        accountId="0"
        update={mockUpdate}
      />
    )

    expect(screen.getByText('No mail filters yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first filter')).toBeInTheDocument()
  })

  it('renders filter list and submits updates', async () => {
    const user = userEvent.setup()

    render(
      <MailFiltersSettingsForm
        data={sampleFilters}
        accountId="0"
        update={mockUpdate}
      />
    )

    expect(screen.getByTestId('filter-line')).toBeInTheDocument()

    const submit = screen.getByTestId('submit-btn')
    await user.click(submit)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: '0',
        filters: expect.any(Array),
      })
    )
  })

  it('opens create dialog from add button', async () => {
    const user = userEvent.setup()

    render(
      <MailFiltersSettingsForm
        data={sampleFilters}
        accountId="0"
        update={mockUpdate}
      />
    )

    await user.click(screen.getByText('Add filter'))
    expect(screen.getByTestId('dialog-save')).toBeInTheDocument()
  })
})
