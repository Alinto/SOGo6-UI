import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import TaskEmptyState from '../task-empty-state'

describe('TaskEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders empty state with translations', () => {
      render(<TaskEmptyState onCreateClick={jest.fn()} />)
      expect(screen.getByTestId('tasks-empty-state')).toBeInTheDocument()
      expect(screen.getByText('empty_title.string')).toBeInTheDocument()
      expect(screen.getByText('empty_description.string')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('calls onCreateClick when button is pressed', async () => {
      const user = userEvent.setup()
      const onCreateClick = jest.fn()
      render(<TaskEmptyState onCreateClick={onCreateClick} />)
      await user.click(screen.getByRole('button', { name: 'new_task.string' }))
      expect(onCreateClick).toHaveBeenCalledTimes(1)
    })
  })
})
