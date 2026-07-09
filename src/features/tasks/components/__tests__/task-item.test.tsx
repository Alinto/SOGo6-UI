import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/tasks/components/task-complete-checkbox', () => ({
  __esModule: true,
  default: ({
    label,
    onToggle,
  }: {
    label: string
    onToggle: () => void
  }) => (
    <button type="button" data-testid="task-checkbox" onClick={onToggle}>
      {label}
    </button>
  ),
}))

import TaskItem from '../task-item'

const calendars = [
  { key: 'cal-1', id: 'cal-1', name: 'Personal', color: '#ff0000' },
]

const task = {
  id: 't1',
  key: 't1',
  title: 'Buy milk',
  calendar_key: 'cal-1',
  status: 'needs_action' as const,
  priority: 1,
  due: '2020-01-01T00:00:00.000Z',
}

describe('TaskItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders task title and calendar', () => {
      render(
        <TaskItem
          task={task}
          calendars={calendars}
          onToggleComplete={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      expect(screen.getByTestId('task-item-t1')).toBeInTheDocument()
      expect(screen.getByTestId('task-item-t1')).toHaveTextContent('Buy milk')
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('shows selection checkbox in selection mode', async () => {
      const user = userEvent.setup()
      const onToggleSelection = jest.fn()
      render(
        <TaskItem
          task={task}
          calendars={calendars}
          onToggleComplete={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          selectionMode
          isSelected={false}
          onToggleSelection={onToggleSelection}
        />
      )

      expect(screen.getByTestId('task-select-checkbox')).toBeInTheDocument()
      expect(screen.queryByTestId('task-checkbox')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'actions.edit.string' })
      ).not.toBeInTheDocument()

      await user.click(screen.getByTestId('task-item-t1'))
      expect(onToggleSelection).toHaveBeenCalledWith('t1')
    })

    it('calls onEdit and onDelete', async () => {
      const user = userEvent.setup()
      const onEdit = jest.fn()
      const onDelete = jest.fn()
      render(
        <TaskItem
          task={task}
          calendars={calendars}
          onToggleComplete={jest.fn()}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
      await user.click(screen.getByRole('button', { name: 'actions.edit.string' }))
      await user.click(screen.getByRole('button', { name: 'actions.delete.string' }))
      expect(onEdit).toHaveBeenCalledWith('t1')
      expect(onDelete).toHaveBeenCalledWith('t1')
    })

    it('calls onToggleComplete from checkbox', async () => {
      const user = userEvent.setup()
      const onToggleComplete = jest.fn().mockResolvedValue(undefined)
      render(
        <TaskItem
          task={task}
          calendars={calendars}
          onToggleComplete={onToggleComplete}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      await user.click(screen.getByTestId('task-checkbox'))
      expect(onToggleComplete).toHaveBeenCalledWith(task)
    })
  })

  describe('progress', () => {
    it('shows progress bar for in_process tasks', () => {
      render(
        <TaskItem
          task={{ ...task, status: 'in_process', percent_complete: 40 }}
          calendars={calendars}
          onToggleComplete={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      expect(screen.getByTestId('task-progress-bar')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('applies line-through when completed', () => {
      render(
        <TaskItem
          task={{ ...task, status: 'completed' }}
          calendars={calendars}
          onToggleComplete={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      const title = screen.getByTestId('task-item-t1').querySelector('p.font-medium')
      expect(title).toHaveClass('line-through')
    })
  })
})
