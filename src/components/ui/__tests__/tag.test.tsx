import { act, fireEvent, render, screen } from '@testing-library/react'

import Tag from '../tag'

// Mock cn only; keep tagDismissButtonClassName from the real module
jest.mock('@/lib/utils', () => {
  const actual = jest.requireActual<typeof import('@/lib/utils')>('@/lib/utils')
  return {
    ...actual,
    cn: jest.fn((...classes: unknown[]) => classes.filter(Boolean).join(' ')),
  }
})

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: ({ name, ...props }: any) => (
    <span data-testid={`dynamic-icon-${name}`} {...props}>
      {name}-icon
    </span>
  ),
}))

// Note: Tag component now uses native <button> instead of Button component

describe('Tag', () => {
  // Group related tests together for better organization
  describe('Basic Rendering', () => {
    it('renders with basic value prop', () => {
      render(<Tag value="test-tag" />)
      expect(screen.getByText('test-tag')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      const customClass = 'custom-tag-class'
      render(<Tag value="test" className={customClass} />)

      // The cn function should be called with the custom class
      const mockCn = require('@/lib/utils').cn as jest.Mock
      expect(mockCn).toHaveBeenCalledWith(
        expect.stringContaining('tag'),
        expect.any(String),
        undefined, // no details: no pointer cursor
        customClass
      )
    })

    it('handles empty value prop', () => {
      const { container } = render(<Tag value="" />)

      // Check that the component renders without crashing
      const tagElement = container.querySelector('.tag')
      expect(tagElement).toBeInTheDocument()
    })
  })

  describe('Icon Functionality', () => {
    it('renders with icon when provided', () => {
      render(<Tag value="test" icon="user" />)
      expect(screen.getByTestId('dynamic-icon-user')).toBeInTheDocument()
      expect(screen.getByText('user-icon')).toBeInTheDocument()
    })

    it('renders without icon when not provided', () => {
      render(<Tag value="test" />)
      expect(screen.queryByTestId(/dynamic-icon/)).not.toBeInTheDocument()
    })
  })

  describe('Action Button Behavior', () => {
    it('renders icon button when both icon and action are provided', () => {
      const mockAction = jest.fn()
      render(<Tag value="test" icon="user" action={mockAction} />)

      expect(screen.getByTestId('dynamic-icon-user')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls action function when icon button is clicked', () => {
      const mockAction = jest.fn()
      render(<Tag value="test" icon="user" action={mockAction} />)

      fireEvent.click(screen.getByRole('button'))
      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('does not render button when only action is provided without icon', () => {
      const mockAction = jest.fn()
      render(<Tag value="test" action={mockAction} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Utility Functions', () => {
    it('uses cn utility for combining classes', () => {
      const mockCn = require('@/lib/utils').cn as jest.Mock
      mockCn.mockReturnValue('combined-classes')

      render(<Tag value="test" className="custom-class" />)
      expect(mockCn).toHaveBeenCalled()
    })
  })
  describe('Tooltip', () => {
    const tapTag = () => {
      const tag = screen.getByRole('listitem')
      const pointerDown = new Event('pointerdown', { bubbles: true })
      Object.assign(pointerDown, { pointerType: 'touch' })
      fireEvent(tag, pointerDown)
      fireEvent.click(tag)
    }

    it('toggles the tooltip on tap for touch screens', () => {
      render(<Tag value="Bob" tooltip="bob@example.com" />)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

      tapTag()
      expect(screen.getByRole('tooltip')).toHaveTextContent('bob@example.com')

      tapTag()
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  describe('Details', () => {
    // React derives pointerenter/leave from pointerover/out.
    const firePointer = (
      element: Element,
      type: 'pointerdown' | 'pointerover' | 'pointerout',
      pointerType = 'mouse'
    ) => {
      const event = new Event(type, { bubbles: true })
      Object.assign(event, { pointerType })
      fireEvent(element, event)
    }

    const pressTag = (pointerType = 'mouse') => {
      const tag = screen.getByRole('listitem')
      firePointer(tag, 'pointerdown', pointerType)
      fireEvent.click(tag)
    }

    afterEach(() => {
      jest.useRealTimers()
    })

    it('toggles the details on click, in place of the tooltip', () => {
      render(
        <Tag value="Bob" tooltip="bob@example.com" details={<p>card</p>} />
      )
      expect(screen.queryByText('card')).not.toBeInTheDocument()

      pressTag()
      expect(screen.getByText('card')).toBeInTheDocument()
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

      pressTag()
      expect(screen.queryByText('card')).not.toBeInTheDocument()
    })

    it('toggles the details on tap for touch screens', () => {
      render(<Tag value="Bob" details={<p>card</p>} />)

      pressTag('touch')
      expect(screen.getByText('card')).toBeInTheDocument()

      pressTag('touch')
      expect(screen.queryByText('card')).not.toBeInTheDocument()
    })

    it('opens the details on hover and closes them on leave', () => {
      jest.useFakeTimers()
      render(<Tag value="Bob" details={<p>card</p>} />)
      const tag = screen.getByRole('listitem')

      firePointer(tag, 'pointerover')
      act(() => jest.advanceTimersByTime(300))
      expect(screen.getByText('card')).toBeInTheDocument()

      firePointer(tag, 'pointerout')
      act(() => jest.advanceTimersByTime(150))
      expect(screen.queryByText('card')).not.toBeInTheDocument()
    })

    it('does not open the details when hovered by touch', () => {
      jest.useFakeTimers()
      render(<Tag value="Bob" details={<p>card</p>} />)

      firePointer(screen.getByRole('listitem'), 'pointerover', 'touch')
      act(() => jest.advanceTimersByTime(300))
      expect(screen.queryByText('card')).not.toBeInTheDocument()
    })

    it('does not open the details when the remove button is clicked', () => {
      const action = jest.fn()
      render(
        <Tag
          value="Bob"
          details={<p>card</p>}
          icon="trash-2"
          action={action}
          aria-label="remove"
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'remove' }))
      expect(action).toHaveBeenCalledTimes(1)
      expect(screen.queryByText('card')).not.toBeInTheDocument()
    })
  })
})
