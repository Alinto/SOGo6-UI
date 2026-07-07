import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import GlobalNotFound from '../not-found'

jest.mock('@/lib/fonts', () => ({
  geistSans: { variable: '--font-geist-sans' },
  geistMono: { variable: '--font-geist-mono' },
  openDyslexic: { variable: '--font-opendyslexic' },
}))

describe('GlobalNotFound', () => {
  it('renders 404 status and message', () => {
    render(<GlobalNotFound />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders main content region', () => {
    render(<GlobalNotFound />)

    expect(screen.getByRole('main')).toHaveClass('text-center')
  })
})
