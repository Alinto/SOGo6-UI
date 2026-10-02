import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

const mockUseGetTaskByIdQuery = jest.fn()

jest.mock('../../store/tasks-api', () => ({
  useGetTaskByIdQuery: (...args: unknown[]) => mockUseGetTaskByIdQuery(...args),
  useCreateTaskMutation: () => [jest.fn()],
  useUpdateTaskMutation: () => [jest.fn()],
}))

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: () => ({
    data: [{ name: 'Personal', description: null, key: 'cal-1' }],
    isLoading: false,
  }),
}))

let lastTaskFormProps: {
  task: { title?: string } | null
  open: boolean
} | null = null

jest.mock('../task-form', () => ({
  __esModule: true,
  default: (props: { task: { title?: string } | null; open: boolean }) => {
    lastTaskFormProps = props
    return props.open ? <div data-testid="task-form" /> : null
  },
}))

import tasksUiReducer, { openCreateForm } from '../../store/tasks-ui-slice'
import TaskFormHost from '../task-form-host'

describe('TaskFormHost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    lastTaskFormProps = null
    mockUseGetTaskByIdQuery.mockReturnValue({
      data: undefined,
      currentData: undefined,
    })
  })

  it('opens the form when the redux flag is set', () => {
    const store = configureStore({
      reducer: { tasksUi: tasksUiReducer },
    })
    store.dispatch(openCreateForm())

    render(
      <Provider store={store}>
        <TaskFormHost />
      </Provider>
    )

    expect(screen.getByTestId('task-form')).toBeInTheDocument()
  })

  it('does not pass cached task data when opening create after edit', () => {
    mockUseGetTaskByIdQuery.mockReturnValue({
      data: { title: 'Review quarterly report', key: 'task-1' },
      currentData: undefined,
    })
    const store = configureStore({
      reducer: { tasksUi: tasksUiReducer },
    })
    store.dispatch(openCreateForm())

    render(
      <Provider store={store}>
        <TaskFormHost />
      </Provider>
    )

    expect(lastTaskFormProps?.task).toBeNull()
  })
})
