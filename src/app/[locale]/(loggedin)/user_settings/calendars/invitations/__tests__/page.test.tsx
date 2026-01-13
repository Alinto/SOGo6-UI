import { render, screen } from '@testing-library/react'
import Page from '../page'

describe('Page', () => {
  it('renders FeatureInProgress component', () => {
    render(<Page />)
    expect(screen.getByTestId('page-incoming-feature')).toBeInTheDocument()
  })
})
