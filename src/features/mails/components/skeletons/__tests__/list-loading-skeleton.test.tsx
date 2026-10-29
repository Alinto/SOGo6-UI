import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import MailListLoadingSkeleton from '../list-loading-skeleton'

jest.mock('../list-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-list-skeleton" />,
}))

describe('MailListLoadingSkeleton', () => {
  it('renders the skeleton with the loading spinner on top', () => {
    render(<MailListLoadingSkeleton />)
    expect(screen.getByTestId('mail-list-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('loading.string')
  })
})
