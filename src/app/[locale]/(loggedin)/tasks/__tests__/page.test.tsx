import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'

jest.mock('@/features/tasks', () => ({
  TasksPage: () => <div data-testid="tasks-page" />,
}))

describe('Tasks Page', () => {
  it('should render the tasks page', () => {
    render(<Page />)

    expect(screen.getByTestId('tasks-page')).toBeInTheDocument()
  })
})
