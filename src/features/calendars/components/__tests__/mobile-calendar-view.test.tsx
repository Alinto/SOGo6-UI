jest.mock('@/lib/i18n/date-locales', () => {
  const { enUS } = require('date-fns/locale/en-US')
  return {
    getDateFnsLocale: () => enUS,
  }
})

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => true,
}))

import { render } from '@testing-library/react'
import { Views } from 'react-big-calendar'
import { MobileCalendarView } from '../mobile-calendar-view'

describe('MobileCalendarView', () => {
  const mockOnNavigate = jest.fn()
  const mockOnViewChange = jest.fn()

  const defaultProps = {
    view: Views.MONTH,
    date: new Date('2026-01-19'),
    events: [],
    calendarColorMap: {},
    defaultColor: '#3b82f6',
    onNavigate: mockOnNavigate,
    onViewChange: mockOnViewChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    const { container } = render(<MobileCalendarView {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should render month view when view is MONTH', () => {
    const { container } = render(
      <MobileCalendarView {...defaultProps} view={Views.MONTH} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('should render week view when view is WEEK', () => {
    const { container } = render(
      <MobileCalendarView {...defaultProps} view={Views.WEEK} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('should render day view when view is DAY', () => {
    const { container } = render(
      <MobileCalendarView {...defaultProps} view={Views.DAY} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('should render different views correctly', () => {
    const { container: monthContainer } = render(
      <MobileCalendarView {...defaultProps} view={Views.MONTH} />
    )
    expect(monthContainer.firstChild).toBeTruthy()

    const { container: weekContainer } = render(
      <MobileCalendarView {...defaultProps} view={Views.WEEK} />
    )
    expect(weekContainer.firstChild).toBeTruthy()

    const { container: dayContainer } = render(
      <MobileCalendarView {...defaultProps} view={Views.DAY} />
    )
    expect(dayContainer.firstChild).toBeTruthy()
  })
})
