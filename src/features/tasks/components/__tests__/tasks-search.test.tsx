import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksSearch from '../tasks-search'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ tasksUi: { searchQuery: '' } }),
}))

jest.mock('../../store/tasks-ui-slice', () => ({
  selectTasksUi: (state: { tasksUi: { searchQuery: string } }) => state.tasksUi,
  setSearchQuery: (q: string) => ({ type: 'setSearchQuery', payload: q }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('TasksSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders search input in header style', () => {
    render(<TasksSearch />)
    expect(screen.getByTestId('tasks-search')).toBeInTheDocument()
  })

  it('debounces dispatch when typing', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<TasksSearch />)

    await user.type(screen.getByTestId('tasks-search'), 'abc')

    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ payload: 'abc' })
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: 'abc' })
    )
  })
})
