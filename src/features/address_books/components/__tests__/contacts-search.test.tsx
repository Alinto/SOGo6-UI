import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ addressBooksUi: { searchQuery: '' } }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import ContactsSearch from '../contacts-search'
import { setSearchQuery } from '../../store/address-books-ui-slice'

describe('ContactsSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders search input', () => {
    render(<ContactsSearch />)
    expect(screen.getByTestId('contacts-search')).toBeInTheDocument()
  })

  it('debounces search dispatch', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<ContactsSearch />)
    await user.type(screen.getByTestId('contacts-search'), 'alice')
    jest.advanceTimersByTime(300)
    expect(mockDispatch).toHaveBeenCalledWith(setSearchQuery('alice'))
  })
})
