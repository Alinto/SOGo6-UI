import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { count?: number }) => {
    if (values?.count !== undefined) {
      return `${key}:${values.count}`
    }
    return key
  },
}))

import TaskSelectionToolbar from '../task-selection-toolbar'

describe('TaskSelectionToolbar', () => {
  const defaultProps = {
    selectionMode: false,
    selectedCount: 0,
    allSelected: false,
    someSelected: false,
    bulkActionIsReopen: false,
    canSelect: true,
    onEnterSelectionMode: jest.fn(),
    onExitSelectionMode: jest.fn(),
    onSelectAll: jest.fn(),
    onBulkComplete: jest.fn(),
    onBulkDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows select entry above the list', () => {
    render(<TaskSelectionToolbar {...defaultProps} />)
    expect(screen.getByTestId('tasks-enter-selection-mode')).toBeInTheDocument()
    expect(screen.getByText('selection.enter.string')).toBeInTheDocument()
  })

  it('enters selection mode from button click', async () => {
    const user = userEvent.setup()
    const onEnterSelectionMode = jest.fn()
    render(
      <TaskSelectionToolbar
        {...defaultProps}
        onEnterSelectionMode={onEnterSelectionMode}
      />
    )

    await user.click(screen.getByTestId('tasks-enter-selection-mode'))
    expect(onEnterSelectionMode).toHaveBeenCalledTimes(1)
  })

  it('shows bulk actions in selection mode', () => {
    render(
      <TaskSelectionToolbar
        {...defaultProps}
        selectionMode
        selectedCount={2}
      />
    )

    expect(screen.getByTestId('tasks-selection-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('tasks-bulk-complete')).toBeEnabled()
    expect(screen.getByTestId('tasks-bulk-delete')).toBeEnabled()
  })

  it('disables bulk actions when nothing is selected', () => {
    render(<TaskSelectionToolbar {...defaultProps} selectionMode />)

    expect(screen.getByTestId('tasks-bulk-complete')).toBeDisabled()
    expect(screen.getByTestId('tasks-bulk-delete')).toBeDisabled()
  })
})
