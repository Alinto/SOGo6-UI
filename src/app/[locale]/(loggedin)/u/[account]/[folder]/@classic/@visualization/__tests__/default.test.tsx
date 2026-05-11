import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Default from '../default'

describe('Default (visualization empty state)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders the Mail icon', () => {
      render(<Default />)
      const container = document.querySelector('.bg-muted.rounded-full')
      expect(container).toBeInTheDocument()
      const svg = container?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders the select message text', () => {
      render(<Default />)
      expect(screen.getByText('select_message.string')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('has text-muted-foreground class on root', () => {
      const { container } = render(<Default />)
      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('text-muted-foreground')
    })

    it('has flex flex-col layout', () => {
      const { container } = render(<Default />)
      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('flex', 'flex-col')
    })

    it('has select-none for non-selectable content', () => {
      const { container } = render(<Default />)
      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('select-none')
    })
  })

  describe('accessibility', () => {
    it('uses semantic structure with paragraph for message', () => {
      render(<Default />)
      const p = document.querySelector('p')
      expect(p).toBeInTheDocument()
      expect(p).toHaveClass('text-sm', 'font-medium', 'opacity-50')
    })
  })
})
