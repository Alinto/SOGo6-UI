import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import ContactSelectionPlaceholder from '../contact-selection-placeholder'

describe('ContactSelectionPlaceholder', () => {
  describe('basic rendering', () => {
    it('renders placeholder with translation keys', () => {
      render(<ContactSelectionPlaceholder />)

      expect(screen.getByTestId('contact-selection-placeholder')).toBeInTheDocument()
      expect(screen.getByText('selection_placeholder.title.string')).toBeInTheDocument()
      expect(screen.getByText('selection_placeholder.description.string')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('uses centered layout classes', () => {
      render(<ContactSelectionPlaceholder />)
      const placeholder = screen.getByTestId('contact-selection-placeholder')
      expect(placeholder).toHaveClass('flex', 'h-full', 'flex-col', 'items-center')
    })
  })
})
