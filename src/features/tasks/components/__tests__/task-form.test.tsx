import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="task-form-sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
}))

import TaskForm from '../task-form'

const calendars = [
  { key: 'cal-1', id: 'cal-1', name: 'Personal', description: null },
]

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders create form when open', () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByTestId('task-form-sheet')).toBeInTheDocument()
      expect(screen.getByTestId('task-form')).toBeInTheDocument()
      expect(screen.getByText('form.create_title.string')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <TaskForm
          open={false}
          calendars={calendars}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.queryByTestId('task-form-sheet')).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows edit title when task is provided', () => {
      render(
        <TaskForm
          open
          calendars={calendars}
          task={{
            id: 't1',
            key: 't1',
            title: 'Existing',
            calendar_key: 'cal-1',
          }}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
        />
      )
      expect(screen.getByText('form.edit_title.string')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('submits create form', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      const onClose = jest.fn()
      render(
        <TaskForm
          open
          calendars={calendars}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )
      await user.type(screen.getByLabelText('form.title.string'), 'New task')
      await user.click(screen.getByRole('button', { name: 'form.save.string' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
