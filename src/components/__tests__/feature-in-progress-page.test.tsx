import { render, screen } from '@testing-library/react'
import { FeatureInProgress } from '../feature-in-progress-page'

describe('FeatureInProgress', () => {
  it('renders the component with correct structure', () => {
    render(<FeatureInProgress />)

    // Check for the main container
    const container = screen.getByTestId('page-incoming-feature')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass(
      'flex',
      'min-h-[400px]',
      'items-center',
      'justify-center'
    )

    // Check for the text content
    expect(screen.getByText('Incoming Feature')).toBeInTheDocument()

    // Check for the construction icon (rendered as SVG)
    const icon = screen.getByRole('img', { hidden: true })
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass(
      'text-muted-foreground',
      'mx-auto',
      'mb-4',
      'h-12',
      'w-12'
    )
  })

  it('renders the text with correct styling', () => {
    render(<FeatureInProgress />)

    const textElement = screen.getByText('Incoming Feature')
    expect(textElement).toHaveClass('text-muted-foreground')
  })
})