import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { VCard } from '../../../address-books-types'

jest.mock('../contact-visualization', () => ({
  __esModule: true,
  default: ({ data }: { data: VCard }) => (
    <div data-testid="contact-visualization">{data.firstName}</div>
  ),
}))

jest.mock('../distribution-list-visualization', () => ({
  __esModule: true,
  default: ({ data }: { data: VCard }) => (
    <div data-testid="distribution-list-visualization">{data.firstName}</div>
  ),
}))

import Visualization from '../index'

const contact: VCard = {
  id: 'c1',
  version: '4.0',
  firstName: 'John',
  lastName: 'Doe',
}

const list: VCard = {
  id: 'list-1',
  version: '4.0',
  kind: 'group',
  firstName: 'Team',
  lastName: '',
  members: [{ email: 'a@example.com' }],
}

describe('Visualization', () => {
  describe('basic rendering', () => {
    it('renders contact visualization for individual contacts', () => {
      render(<Visualization data={contact} />)
      expect(screen.getByTestId('contact-visualization')).toHaveTextContent('John')
    })

    it('renders distribution list visualization for group contacts', () => {
      render(<Visualization data={list} />)
      expect(screen.getByTestId('distribution-list-visualization')).toHaveTextContent('Team')
    })
  })
})
