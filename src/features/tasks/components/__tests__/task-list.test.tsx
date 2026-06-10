import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TaskList from '../task-list'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const calendars = [
  { key: 'cal-1', name: 'Personal', description: null },
]

describe('TaskList', () => {
  it('shows skeleton when loading', () => {
    render(
      <TaskList
        tasks={[]}
        calendars={calendars}
        isLoading
        onToggleComplete={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCreateClick={jest.fn()}
      />
    )
    expect(screen.getByTestId('tasks-list-skeleton')).toBeInTheDocument()
  })

  it('shows empty state when no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        calendars={calendars}
        isLoading={false}
        onToggleComplete={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCreateClick={jest.fn()}
      />
    )
    expect(screen.getByTestId('tasks-empty-state')).toBeInTheDocument()
  })

  it('renders task items', () => {
    render(
      <TaskList
        tasks={[
          {
            id: 't1',
            key: 't1',
            title: 'My task',
            calendar_key: 'cal-1',
          },
        ]}
        calendars={calendars}
        isLoading={false}
        onToggleComplete={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onCreateClick={jest.fn()}
      />
    )
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument()
    expect(screen.getByText('My task')).toBeInTheDocument()
  })
})
