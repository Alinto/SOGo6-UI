import { render, screen } from '@testing-library/react'
import React from 'react'
import AdminPanelHeader from '../admin-panel-header'

jest.mock('@/components/ui/textarea', () => ({
  Textarea: React.forwardRef(
    ({ value, onChange, onBlur, onKeyDown, ...props }, ref) => (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        data-testid="mock-textarea"
        {...props}
      />
    )
  ),
}))

describe('AdminPanelHeader Component', () => {
  describe('Non-Editable Mode', () => {
    it('should render title when provided', () => {
      render(<AdminPanelHeader title="Test Domain" />)
      expect(screen.getByText('Test Domain')).toBeInTheDocument()
    })

    it('should render static description when editableDescription is false', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Static description"
          editableDescription={false}
        />
      )
      expect(screen.getByText('Static description')).toBeInTheDocument()
    })

    it('should render nothing when no description and not editable', () => {
      render(<AdminPanelHeader title="Test" editableDescription={false} />)
      expect(
        screen.queryByText(/Click to add|Add a description/)
      ).not.toBeInTheDocument()
    })

    it('should apply correct CSS classes to non-editable description', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Non-editable"
          editableDescription={false}
        />
      )
      const descElement = screen.getByText('Non-editable')
      expect(descElement).toHaveClass('text-base')
      expect(descElement).toHaveClass('text-muted-foreground')
    })

    it('should not show edit button when editableDescription is false', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Non-editable"
          editableDescription={false}
        />
      )
      expect(
        screen.queryByRole('button', { name: /Edit domain description/ })
      ).not.toBeInTheDocument()
    })

    it('should render nothing when no description and not editable', () => {
      render(<AdminPanelHeader title="Test" editableDescription={false} />)
      // Non-editable mode doesn't show description if not provided
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
    })
  })

  describe('Editable Mode - Initial State', () => {
    it('should render clickable area for editable description', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Edit me"
          editableDescription={true}
        />
      )
      const editableArea = screen.getByRole('button', {
        name: /Edit domain description/,
      })
      expect(editableArea).toBeInTheDocument()
    })

    it('should display description text in editable mode initial state', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="My description"
          editableDescription={true}
        />
      )
      expect(screen.getByText('My description')).toBeInTheDocument()
    })

    it('should render placeholder when no description in editable mode', () => {
      render(<AdminPanelHeader title="Test" editableDescription={true} />)
      expect(
        screen.getByText('Click to add a domain description')
      ).toBeInTheDocument()
    })

    it('should have cursor-text class on editable area', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Clickable"
          editableDescription={true}
        />
      )
      const editableArea = screen.getByRole('button', {
        name: /Edit domain description/,
      })
      expect(editableArea).toHaveClass('cursor-text')
    })

    it('should have proper ARIA role on editable area', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Accessible"
          editableDescription={true}
        />
      )
      const editableArea = screen.getByRole('button', {
        name: /Edit domain description/,
      })
      expect(editableArea).toHaveAttribute('role', 'button')
    })

    it('should use description prop when provided', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Initial description"
          editableDescription={true}
        />
      )
      expect(screen.getByText('Initial description')).toBeInTheDocument()
    })

    it('should display description text when both props provided', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Current description"
          editableDescription={true}
        />
      )
      expect(screen.getByText('Current description')).toBeInTheDocument()
    })

    it('should have proper styling on editable description area', () => {
      render(
        <AdminPanelHeader
          title="Test"
          description="Styled"
          editableDescription={true}
        />
      )
      const descElement = screen.getByText('Styled')
      expect(descElement).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('Empty States', () => {
    it('should show placeholder when no description in editable mode', () => {
      render(<AdminPanelHeader title="Test" editableDescription={true} />)
      expect(
        screen.getByText('Click to add a domain description')
      ).toBeInTheDocument()
    })

    it('should render with title only', () => {
      render(<AdminPanelHeader title="Only Title" />)
      expect(screen.getByText('Only Title')).toBeInTheDocument()
    })

    it('should render with no description when editableDescription is false and no description prop', () => {
      render(<AdminPanelHeader title="Test" editableDescription={false} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
      // The description area should not render anything
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should render on mobile viewport', () => {
      global.innerWidth = 375
      render(
        <AdminPanelHeader
          title="Mobile Test"
          description="Mobile description"
          editableDescription={true}
        />
      )
      expect(screen.getByText('Mobile Test')).toBeInTheDocument()
      expect(screen.getByText('Mobile description')).toBeInTheDocument()
    })

    it('should maintain functionality on small screens', () => {
      render(
        <AdminPanelHeader title="Small Screen" editableDescription={true} />
      )
      const editableArea = screen.getByRole('button', {
        name: /Edit domain description/,
      })
      expect(editableArea).toBeInTheDocument()
    })
  })
})
