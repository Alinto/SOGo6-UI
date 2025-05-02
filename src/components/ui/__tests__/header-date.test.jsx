import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import HeaderDate, { getDateDetails } from '../header-date'
jest.useFakeTimers()
jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en'),
}))

describe('getDateDetails utility function', () => {
  it('returns correct date details for a given locale', () => {
    const mockDate = new Date(2025, 4, 2) // May 2, 2025
    jest.setSystemTime(mockDate)

    const dateDetails = getDateDetails('en')

    expect(dateDetails).toEqual({
      dayName: 'FRIDAY',
      month: 'MAY',
      year: 2025,
      dayNumber: '02',
    })
  })
})

describe('HeaderDate component', () => {
  it('renders the correct date details', () => {
    render(<HeaderDate />)

    const mockDate = new Date(2025, 4, 2) // May 2, 2025
    jest.setSystemTime(mockDate)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('FRIDAY')).toBeInTheDocument()
    expect(screen.getByText('MAY')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<HeaderDate />)
    expect(asFragment()).toMatchSnapshot()
  })
})
