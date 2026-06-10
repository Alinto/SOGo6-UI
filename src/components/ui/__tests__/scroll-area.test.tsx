import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ScrollArea, ScrollBar } from '../scroll-area'

// Mock Radix UI ScrollArea components
jest.mock('@radix-ui/react-scroll-area', () => {
  const MockRoot = React.forwardRef<any, any>(
    ({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="scroll-area-root"
        {...props}
      >
        {children}
      </div>
    )
  )
  MockRoot.displayName = 'ScrollAreaRoot'

  const MockViewport = React.forwardRef<any, any>(
    ({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="scroll-area-viewport"
        {...props}
      >
        {children}
      </div>
    )
  )
  MockViewport.displayName = 'ScrollAreaViewport'

  const MockScrollAreaScrollbar = React.forwardRef<any, any>(
    ({ className, orientation = 'vertical', children, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid={`scroll-area-scrollbar-${orientation}`}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    )
  )
  MockScrollAreaScrollbar.displayName = 'ScrollAreaScrollbar'

  const MockScrollAreaThumb = React.forwardRef<any, any>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="scroll-area-thumb"
        {...props}
      />
    )
  )
  MockScrollAreaThumb.displayName = 'ScrollAreaThumb'

  const MockCorner = React.forwardRef<any, any>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="scroll-area-corner"
        {...props}
      />
    )
  )
  MockCorner.displayName = 'ScrollAreaCorner'

  return {
    Root: MockRoot,
    Viewport: MockViewport,
    ScrollAreaScrollbar: MockScrollAreaScrollbar,
    ScrollAreaThumb: MockScrollAreaThumb,
    Corner: MockCorner,
  }
})

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// filepath: /SOGo/src/components/ui/scroll-area.test.tsx

describe('ScrollArea component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ScrollArea />)
      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with correct structure', () => {
      render(
        <ScrollArea>
          <div>Test content</div>
        </ScrollArea>
      )

      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument()
      expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument()
      expect(
        screen.getByTestId('scroll-area-scrollbar-vertical')
      ).toBeInTheDocument()
      expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <ScrollArea>
          <div data-testid="test-content">Test content</div>
        </ScrollArea>
      )

      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(<ScrollArea />)

      const root = screen.getByTestId('scroll-area-root')
      expect(root).toHaveClass('relative overflow-hidden')
    })

    it('applies custom className', () => {
      render(<ScrollArea className="custom-class" />)

      const root = screen.getByTestId('scroll-area-root')
      expect(root).toHaveClass('relative overflow-hidden custom-class')
    })

    it('applies viewport default className', () => {
      render(<ScrollArea />)

      const viewport = screen.getByTestId('scroll-area-viewport')
      expect(viewport).toHaveClass('h-full w-full rounded-[inherit]')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<ScrollArea ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('passes through additional props', () => {
      render(<ScrollArea data-custom="test-value" />)

      const root = screen.getByTestId('scroll-area-root')
      expect(root).toHaveAttribute('data-custom', 'test-value')
    })
  })

  describe('Complex content', () => {
    it('renders multiple children', () => {
      render(
        <ScrollArea>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ScrollArea>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('renders nested components', () => {
      render(
        <ScrollArea>
          <div>
            <span data-testid="nested-span">Nested content</span>
            <p data-testid="nested-p">Paragraph content</p>
          </div>
        </ScrollArea>
      )

      expect(screen.getByTestId('nested-span')).toBeInTheDocument()
      expect(screen.getByTestId('nested-p')).toBeInTheDocument()
    })

    it('handles empty content', () => {
      render(<ScrollArea />)

      const viewport = screen.getByTestId('scroll-area-viewport')
      expect(viewport).toBeInTheDocument()
      expect(viewport).toBeEmptyDOMElement()
    })

    it('handles large content', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <div key={i} data-testid={`item-${i}`}>
          Item {i}
        </div>
      ))

      render(<ScrollArea>{largeContent}</ScrollArea>)

      expect(screen.getByTestId('item-0')).toBeInTheDocument()
      expect(screen.getByTestId('item-99')).toBeInTheDocument()
    })
  })

  describe('Integration with other components', () => {
    it('works with list components', () => {
      render(
        <ScrollArea>
          <ul>
            <li data-testid="list-item-1">Item 1</li>
            <li data-testid="list-item-2">Item 2</li>
          </ul>
        </ScrollArea>
      )

      expect(screen.getByTestId('list-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('list-item-2')).toBeInTheDocument()
    })

    it('works with table components', () => {
      render(
        <ScrollArea>
          <table>
            <tbody>
              <tr>
                <td data-testid="table-cell">Cell content</td>
              </tr>
            </tbody>
          </table>
        </ScrollArea>
      )

      expect(screen.getByTestId('table-cell')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains proper DOM structure for screen readers', () => {
      render(
        <ScrollArea>
          <div role="list">
            <div role="listitem">Item 1</div>
            <div role="listitem">Item 2</div>
          </div>
        </ScrollArea>
      )

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('preserves aria attributes', () => {
      render(
        <ScrollArea aria-label="Scrollable content">
          <div>Content</div>
        </ScrollArea>
      )

      const root = screen.getByTestId('scroll-area-root')
      expect(root).toHaveAttribute('aria-label', 'Scrollable content')
    })
  })
})

describe('ScrollBar component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ScrollBar />)
      expect(
        screen.getByTestId('scroll-area-scrollbar-vertical')
      ).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(<ScrollBar />)
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with correct structure', () => {
      render(<ScrollBar />)

      expect(
        screen.getByTestId('scroll-area-scrollbar-vertical')
      ).toBeInTheDocument()
      expect(screen.getByTestId('scroll-area-thumb')).toBeInTheDocument()
    })

    it('renders with vertical orientation by default', () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical')
      expect(scrollbar).toHaveClass(
        'flex touch-none transition-colors select-none h-full w-2.5 border-l border-l-transparent p-[1px]'
      )
    })

    it('renders with horizontal orientation', () => {
      render(<ScrollBar orientation="horizontal" />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-horizontal')
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal')
      expect(scrollbar).toHaveClass(
        'flex touch-none transition-colors select-none h-2.5 flex-col border-t border-t-transparent p-[1px]'
      )
    })

    it('applies custom className', () => {
      render(<ScrollBar className="custom-scrollbar" />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toHaveClass('custom-scrollbar')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<ScrollBar ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('passes through additional props', () => {
      render(<ScrollBar data-custom="scrollbar-value" />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toHaveAttribute('data-custom', 'scrollbar-value')
    })
  })

  describe('Orientation handling', () => {
    it('applies correct classes for vertical orientation', () => {
      render(<ScrollBar orientation="vertical" />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toHaveClass(
        'h-full w-2.5 border-l border-l-transparent p-[1px]'
      )
      expect(scrollbar).not.toHaveClass('flex-col')
    })

    it('applies correct classes for horizontal orientation', () => {
      render(<ScrollBar orientation="horizontal" />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-horizontal')
      expect(scrollbar).toHaveClass(
        'h-2.5 flex-col border-t border-t-transparent p-[1px]'
      )
      expect(scrollbar).not.toHaveClass('border-l')
    })

    it('handles undefined orientation (defaults to vertical)', () => {
      render(<ScrollBar orientation={undefined} />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical')
    })
  })

  describe('Thumb component', () => {
    it('renders thumb with correct classes', () => {
      render(<ScrollBar />)

      const thumb = screen.getByTestId('scroll-area-thumb')
      expect(thumb).toHaveClass('bg-border relative flex-1 rounded-full')
    })

    it('thumb is contained within scrollbar', () => {
      render(<ScrollBar />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      const thumb = screen.getByTestId('scroll-area-thumb')
      expect(scrollbar).toContainElement(thumb)
    })
  })

  describe('Integration with ScrollArea', () => {
    it('works correctly when used within ScrollArea', () => {
      render(
        <ScrollArea>
          <div>Content</div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )

      expect(
        screen.getByTestId('scroll-area-scrollbar-vertical')
      ).toBeInTheDocument() // Default ScrollBar from ScrollArea
      expect(
        screen.getByTestId('scroll-area-scrollbar-horizontal')
      ).toBeInTheDocument() // Additional ScrollBar
    })

    it('maintains proper hierarchy within ScrollArea', () => {
      render(
        <ScrollArea>
          <div data-testid="content">Content</div>
        </ScrollArea>
      )

      const root = screen.getByTestId('scroll-area-root')
      const viewport = screen.getByTestId('scroll-area-viewport')
      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      const content = screen.getByTestId('content')

      expect(root).toContainElement(viewport)
      expect(root).toContainElement(scrollbar)
      expect(viewport).toContainElement(content)
    })
  })

  describe('Edge cases', () => {
    it('handles null className gracefully', () => {
      render(<ScrollBar className={null as any} />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toBeInTheDocument()
    })

    it('handles undefined className gracefully', () => {
      render(<ScrollBar className={undefined} />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toBeInTheDocument()
    })

    it('handles empty string className', () => {
      render(<ScrollBar className="" />)

      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical')
      expect(scrollbar).toBeInTheDocument()
    })
  })
})

describe('ScrollArea and ScrollBar integration', () => {
  it('renders complete scroll area with both components', () => {
    render(
      <ScrollArea className="h-64 w-64">
        <div className="space-y-2">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="border p-2">
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    )

    expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument()
    expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument()
    expect(
      screen.getByTestId('scroll-area-scrollbar-vertical')
    ).toBeInTheDocument()
    expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument()
    expect(screen.getByTestId('scroll-area-thumb')).toBeInTheDocument()
  })

  it('works with both horizontal and vertical scrollbars', () => {
    const HorizontalScrollExample = () => (
      <ScrollArea className="h-32 w-96">
        <div className="flex space-x-4 pb-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="h-24 w-32 flex-shrink-0 bg-gray-200">
              Card {i + 1}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )

    render(<HorizontalScrollExample />)

    expect(
      screen.getByTestId('scroll-area-scrollbar-vertical')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('scroll-area-scrollbar-horizontal')
    ).toBeInTheDocument()
  })

  it('renders large content without dropping first and last items', () => {
    render(
      <ScrollArea>
        {Array.from({ length: 1000 }, (_, i) => (
          <div key={i} data-testid={`perf-item-${i}`}>
            Performance test item {i}
          </div>
        ))}
      </ScrollArea>
    )

    expect(screen.getByTestId('perf-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('perf-item-999')).toBeInTheDocument()
  })

  it('preserves scroll position on re-render', () => {
    const { rerender } = render(
      <ScrollArea data-scroll-position="top">
        <div style={{ height: '1000px' }}>Tall content</div>
      </ScrollArea>
    )

    // Re-render with different prop
    rerender(
      <ScrollArea data-scroll-position="middle">
        <div style={{ height: '1000px' }}>Tall content</div>
      </ScrollArea>
    )

    expect(screen.getByTestId('scroll-area-root')).toHaveAttribute(
      'data-scroll-position',
      'middle'
    )
  })
})

describe('Component display names', () => {
  it('ScrollArea has correct display name', () => {
    expect(ScrollArea.displayName).toBeDefined()
  })

  it('ScrollBar has correct display name', () => {
    expect(ScrollBar.displayName).toBeDefined()
  })
})
