import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ClassicLayout from '../layout'

const mockUsePathname = jest.fn()
const mockUseParams = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useParams: () => mockUseParams(),
}))

describe('ClassicLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/en/u/0/INBOX')
    mockUseParams.mockReturnValue({ folder: 'INBOX' })
  })

  describe('basic rendering', () => {
    it('renders two panes with mail selected', () => {
      mockUsePathname.mockReturnValue('/en/u/0/INBOX/34')
      render(
        <ClassicLayout
          children={<div data-testid="children" />}
          visualization={<div data-testid="visualization" />}
        />
      )
      expect(screen.getByTestId('children')).toBeInTheDocument()
      expect(screen.getByTestId('visualization')).toBeInTheDocument()
    })

    it('renders EmptyState when no mail selected (pathname ends at folder)', () => {
      mockUsePathname.mockReturnValue('/en/u/0/INBOX')
      render(
        <ClassicLayout
          children={<div data-testid="children" />}
          visualization={<div data-testid="visualization" />}
        />
      )
      expect(screen.getByText('select_message.string')).toBeInTheDocument()
      expect(screen.queryByTestId('visualization')).not.toBeInTheDocument()
    })

    it('renders visualization when mail_id in pathname', () => {
      mockUsePathname.mockReturnValue('/en/u/0/INBOX/34')
      render(
        <ClassicLayout
          children={<div data-testid="children" />}
          visualization={<div data-testid="visualization" />}
        />
      )
      expect(screen.getByTestId('visualization')).toBeInTheDocument()
      expect(screen.queryByText('select_message.string')).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('handles array folder param for pathname parsing', () => {
      mockUseParams.mockReturnValue({ folder: ['Archive', 'Old'] })
      mockUsePathname.mockReturnValue('/en/u/0/Archive/Old')
      render(
        <ClassicLayout
          children={<div data-testid="children" />}
          visualization={<div data-testid="visualization" />}
        />
      )
      expect(screen.getByText('select_message.string')).toBeInTheDocument()
    })

    it('shows mail when pathname has mail_id after folder', () => {
      mockUsePathname.mockReturnValue('/en/u/0/Archive%2FOld/99')
      mockUseParams.mockReturnValue({ folder: ['Archive', 'Old'] })
      render(
        <ClassicLayout
          children={<div data-testid="children" />}
          visualization={<div data-testid="visualization" />}
        />
      )
      expect(screen.getByTestId('visualization')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('has flex layout and overflow-hidden on root', () => {
      const { container } = render(
        <ClassicLayout children={<span />} visualization={<span />} />
      )
      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('flex', 'overflow-hidden')
    })
  })
})
