import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

const mockUseGetCalendarsQuery = jest.fn()

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: () => mockUseGetCalendarsQuery(),
}))

jest.mock('../event-create-dialog', () => ({
  __esModule: true,
  default: ({ selectedSlot }: { selectedSlot: unknown }) =>
    selectedSlot ? <div data-testid="event-create-dialog" /> : null,
}))

import calendarUiReducer, {
  requestCreateEvent,
} from '@/features/calendars/store/calendar-ui-slice'
import EventCreateHost from '../event-create-host'

function renderHost() {
  const store = configureStore({
    reducer: { calendarUi: calendarUiReducer },
  })
  store.dispatch(requestCreateEvent())
  render(
    <Provider store={store}>
      <EventCreateHost />
    </Provider>
  )
  return store
}

describe('EventCreateHost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens the create dialog from the redux flag and clears it', () => {
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [
        {
          name: 'Personal',
          description: null,
          key: 'cal-1',
          is_default: true,
        },
      ],
      isLoading: false,
    })

    const store = renderHost()

    expect(screen.getByTestId('event-create-dialog')).toBeInTheDocument()
    expect(store.getState().calendarUi.createEventRequested).toBe(false)
  })

  it('does not open a dialog when the preferred calendar is not writable', () => {
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [
        { name: 'Feed', description: null, source_type: 'ics', key: 'ics-1' },
      ],
      isLoading: false,
    })

    const store = renderHost()

    expect(screen.queryByTestId('event-create-dialog')).not.toBeInTheDocument()
    expect(store.getState().calendarUi.createEventRequested).toBe(false)
  })
})
