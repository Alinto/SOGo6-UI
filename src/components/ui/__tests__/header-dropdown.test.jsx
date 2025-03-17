import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import HeaderDropdown from '../header-dropdown'

// filepath: /SOGo/src/components/ui/header-dropdown.test.tsx

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

describe('HeaderDropdown component', () => {
  beforeEach(() => {
    useTranslations.mockReturnValue((key) => key)
  })
  it('matches snapshot', () => {
    const { asFragment } = render(<HeaderDropdown />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders HeaderDropdown component', () => {
    render(<HeaderDropdown />)
    expect(screen.getByText('Henry Fafenback')).toBeInTheDocument()
    expect(screen.getByText('sbarre@alinto.eu')).toBeInTheDocument()
  })

  it('renders dropdown menu items', async () => {
    render(<HeaderDropdown />)

    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    expect(screen.getByText('admin.panel')).toBeInTheDocument()
    expect(screen.getByText('account.section')).toBeInTheDocument()
    expect(screen.getByText('account.profile')).toBeInTheDocument()
    expect(screen.getByText('account.security')).toBeInTheDocument()
    expect(screen.getByText('settings.title')).toBeInTheDocument()
    expect(screen.getByText('settings.general')).toBeInTheDocument()
    expect(screen.getByText('settings.agenda')).toBeInTheDocument()
    expect(screen.getByText('settings.address_books')).toBeInTheDocument()
    expect(screen.getByText('settings.email')).toBeInTheDocument()
    expect(screen.getByText('logout')).toBeInTheDocument()
  })

  it('renders icons in dropdown menu items', () => {
    render(<HeaderDropdown />)
    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    expect(screen.getByTestId('cog-icon')).toBeInTheDocument()
    expect(screen.getByTestId('circle-user-round-icon')).toBeInTheDocument()
    expect(screen.getByTestId('user-round-cog-icon')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-cog-icon')).toBeInTheDocument()
    expect(screen.getByTestId('book-a-icon')).toBeInTheDocument()
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    expect(screen.getByTestId('log-out-icon')).toBeInTheDocument()
  })

  it('toggles dropdown menu on trigger click', () => {
    render(<HeaderDropdown />)
    const trigger = screen.getByTestId('header-dropdown-trigger')
    fireEvent.click(trigger)
    expect(screen.getByText('admin.panel')).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.queryByText('admin.panel')).not.toBeInTheDocument()
  })
})
