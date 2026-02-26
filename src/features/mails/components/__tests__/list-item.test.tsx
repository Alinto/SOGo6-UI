import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ImapMessagesList } from '../../mails-types'
import ListItem from '../list-item'

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}))

jest.mock('../list-item-desktop', () => ({
  __esModule: true,
  default: () => <div data-testid="list-item-desktop" />,
}))

jest.mock('../list-item-mobile', () => ({
  __esModule: true,
  default: () => <div data-testid="list-item-mobile" />,
}))

const mockUseIsMobile = require('@/hooks/use-mobile').useIsMobile

const mockData: ImapMessagesList = {
  id: '1',
  subject: 'Test',
  from: { name: 'John', email: 'john@example.com' },
  to: [{ name: 'Jane', email: 'jane@example.com' }],
  date: '2024-01-01',
  seen: false,
  flagged: false,
  hasAttachment: false,
  snippet: 'snippet',
}

const defaultProps = {
  data: mockData,
  isSelected: false,
  onHandleCheckboxClick: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ListItem', () => {
  it('renders desktop component on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    render(<ListItem {...defaultProps} />)
    expect(screen.getByTestId('list-item-desktop')).toBeInTheDocument()
    expect(screen.queryByTestId('list-item-mobile')).not.toBeInTheDocument()
  })

  it('renders mobile component on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    render(<ListItem {...defaultProps} />)
    expect(screen.getByTestId('list-item-mobile')).toBeInTheDocument()
    expect(screen.queryByTestId('list-item-desktop')).not.toBeInTheDocument()
  })

  it('renders without optional props', () => {
    mockUseIsMobile.mockReturnValue(false)
    render(<ListItem {...defaultProps} />)
    expect(screen.getByTestId('list-item-desktop')).toBeInTheDocument()
  })
})
