import { render, screen } from '@testing-library/react'
import OfflinePage from '../page'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'offline.pageTitle.string': 'You are offline',
      'offline.pageDescription.string': 'This page is not available offline',
      'offline.retryButton.string': 'Retry',
      'offline.goHomeButton.string': 'Go Home',
      'offline.cachedPagesHint.string': 'Some pages may be available offline',
    }
    return translations[key] || key
  },
}))

jest.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}))

jest.mock('lucide-react', () => ({
  WifiOff: () => <svg data-testid="wifi-off-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  Home: () => <svg data-testid="home-icon" />,
}))

describe('OfflinePage', () => {
  it('should render the offline page', () => {
    render(<OfflinePage />)
    expect(screen.getByTestId('card')).toBeInTheDocument()
  })

  it('should display the page title', () => {
    render(<OfflinePage />)
    expect(screen.getByText('You are offline')).toBeInTheDocument()
  })

  it('should display retry and home buttons', () => {
    render(<OfflinePage />)
    expect(screen.getByText('Retry')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })
})
