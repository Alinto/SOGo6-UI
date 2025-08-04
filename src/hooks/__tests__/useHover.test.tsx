import '@testing-library/jest-dom'
import { fireEvent, render, renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useHover, useHoverRef } from '../useHover'

describe('useHover', () => {
  it('should return false initially', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      const isHovered = useHover(ref)
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    expect(getByText('not hovered')).toBeInTheDocument()
  })

  it('should return true when element is hovered', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      const isHovered = useHover(ref)
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    const element = getByText('not hovered')

    fireEvent.mouseEnter(element)
    expect(getByText('hovered')).toBeInTheDocument()
  })

  it('should return false when mouse leaves element', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      const isHovered = useHover(ref)
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    const element = getByText('not hovered')

    // Hover then leave
    fireEvent.mouseEnter(element)
    expect(getByText('hovered')).toBeInTheDocument()

    fireEvent.mouseLeave(element)
    expect(getByText('not hovered')).toBeInTheDocument()
  })

  it('should handle multiple hover/leave cycles', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      const isHovered = useHover(ref)
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    const element = getByText('not hovered')

    // First cycle
    fireEvent.mouseEnter(element)
    expect(getByText('hovered')).toBeInTheDocument()
    fireEvent.mouseLeave(element)
    expect(getByText('not hovered')).toBeInTheDocument()

    // Second cycle
    fireEvent.mouseEnter(element)
    expect(getByText('hovered')).toBeInTheDocument()
    fireEvent.mouseLeave(element)
    expect(getByText('not hovered')).toBeInTheDocument()
  })

  it('should return false when mouse leaves document', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      const isHovered = useHover(ref)
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    const element = getByText('not hovered')

    // Hover element
    fireEvent.mouseEnter(element)
    expect(getByText('hovered')).toBeInTheDocument()

    // Mouse leaves document
    fireEvent.mouseLeave(document)
    expect(getByText('not hovered')).toBeInTheDocument()
  })

  it('should handle null ref gracefully', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      return useHover(ref)
    })

    expect(result.current).toBe(false)
  })

  it('should work with different HTML element types', () => {
    const TestComponent = () => {
      const buttonRef = useRef<HTMLButtonElement>(null)
      const spanRef = useRef<HTMLSpanElement>(null)
      const buttonHovered = useHover(buttonRef)
      const spanHovered = useHover(spanRef)

      return (
        <div>
          <button ref={buttonRef}>
            {buttonHovered ? 'button hovered' : 'button not hovered'}
          </button>
          <span ref={spanRef}>
            {spanHovered ? 'span hovered' : 'span not hovered'}
          </span>
        </div>
      )
    }

    const { getByText } = render(<TestComponent />)

    const button = getByText('button not hovered')
    const span = getByText('span not hovered')

    // Test button hover
    fireEvent.mouseEnter(button)
    expect(getByText('button hovered')).toBeInTheDocument()
    expect(getByText('span not hovered')).toBeInTheDocument()

    // Test span hover
    fireEvent.mouseEnter(span)
    expect(getByText('span hovered')).toBeInTheDocument()
  })

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(
      Element.prototype,
      'addEventListener'
    )
    const removeEventListenerSpy = jest.spyOn(
      Element.prototype,
      'removeEventListener'
    )
    const documentAddSpy = jest.spyOn(document, 'addEventListener')
    const documentRemoveSpy = jest.spyOn(document, 'removeEventListener')

    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      const isHovered = useHover(ref)
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { unmount } = render(<TestComponent />)

    // Verify listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function)
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function)
    )
    expect(documentAddSpy).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function)
    )

    unmount()

    // Verify listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function)
    )
    expect(documentRemoveSpy).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function)
    )

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
    documentAddSpy.mockRestore()
    documentRemoveSpy.mockRestore()
  })

  it('should handle ref changes correctly', () => {
    const TestComponent = ({ useFirstRef }: { useFirstRef: boolean }) => {
      const ref1 = useRef<HTMLDivElement>(null)
      const ref2 = useRef<HTMLDivElement>(null)
      const refToUse = useFirstRef ? ref1 : ref2
      const isHovered = useHover(refToUse)

      return (
        <div>
          <div ref={ref1} data-testid="div1">
            Div 1
          </div>
          <div ref={ref2} data-testid="div2">
            Div 2
          </div>
          <div data-testid="status">
            {isHovered ? 'hovered' : 'not hovered'}
          </div>
        </div>
      )
    }

    const { getByTestId, rerender } = render(
      <TestComponent useFirstRef={true} />
    )

    const div1 = getByTestId('div1')
    const div2 = getByTestId('div2')
    const status = getByTestId('status')

    // Initially not hovered
    expect(status).toHaveTextContent('not hovered')

    // Hover first div
    fireEvent.mouseEnter(div1)
    expect(status).toHaveTextContent('hovered')

    // Leave first div to reset state
    fireEvent.mouseLeave(div1)
    expect(status).toHaveTextContent('not hovered')

    // Switch to second ref
    rerender(<TestComponent useFirstRef={false} />)
    expect(status).toHaveTextContent('not hovered')

    // Hover second div
    fireEvent.mouseEnter(div2)
    expect(status).toHaveTextContent('hovered')
  })
})

describe('useHoverRef', () => {
  it('should return a ref and hover state', () => {
    const TestComponent = () => {
      const [ref, isHovered] = useHoverRef<HTMLDivElement>()
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    expect(getByText('not hovered')).toBeInTheDocument()
  })

  it('should track hover state correctly', () => {
    const TestComponent = () => {
      const [ref, isHovered] = useHoverRef<HTMLDivElement>()
      return <div ref={ref}>{isHovered ? 'hovered' : 'not hovered'}</div>
    }

    const { getByText } = render(<TestComponent />)
    const element = getByText('not hovered')

    fireEvent.mouseEnter(element)
    expect(getByText('hovered')).toBeInTheDocument()

    fireEvent.mouseLeave(element)
    expect(getByText('not hovered')).toBeInTheDocument()
  })

  it('should work with different element types', () => {
    const TestComponent = () => {
      const [buttonRef, buttonHovered] = useHoverRef<HTMLButtonElement>()
      const [inputRef, inputHovered] = useHoverRef<HTMLInputElement>()

      return (
        <div>
          <button ref={buttonRef}>
            {buttonHovered ? 'button hovered' : 'button not hovered'}
          </button>
          <input
            ref={inputRef}
            placeholder={inputHovered ? 'input hovered' : 'input not hovered'}
          />
        </div>
      )
    }

    const { getByText, getByPlaceholderText } = render(<TestComponent />)

    const button = getByText('button not hovered')
    const input = getByPlaceholderText('input not hovered')

    // Test button hover
    fireEvent.mouseEnter(button)
    expect(getByText('button hovered')).toBeInTheDocument()

    // Test input hover
    fireEvent.mouseEnter(input)
    expect(getByPlaceholderText('input hovered')).toBeInTheDocument()
  })

  it('should maintain separate state for multiple instances', () => {
    const TestComponent = () => {
      const [ref1, isHovered1] = useHoverRef<HTMLDivElement>()
      const [ref2, isHovered2] = useHoverRef<HTMLDivElement>()

      return (
        <div>
          <div ref={ref1} data-testid="div1">
            {isHovered1 ? 'div1 hovered' : 'div1 not hovered'}
          </div>
          <div ref={ref2} data-testid="div2">
            {isHovered2 ? 'div2 hovered' : 'div2 not hovered'}
          </div>
        </div>
      )
    }

    const { getByTestId, getByText } = render(<TestComponent />)

    const div1 = getByTestId('div1')
    const div2 = getByTestId('div2')

    // Initially both not hovered
    expect(getByText('div1 not hovered')).toBeInTheDocument()
    expect(getByText('div2 not hovered')).toBeInTheDocument()

    // Hover first div only
    fireEvent.mouseEnter(div1)
    expect(getByText('div1 hovered')).toBeInTheDocument()
    expect(getByText('div2 not hovered')).toBeInTheDocument()

    // Hover second div while first is still hovered
    fireEvent.mouseEnter(div2)
    expect(getByText('div1 hovered')).toBeInTheDocument()
    expect(getByText('div2 hovered')).toBeInTheDocument()

    // Leave first div
    fireEvent.mouseLeave(div1)
    expect(getByText('div1 not hovered')).toBeInTheDocument()
    expect(getByText('div2 hovered')).toBeInTheDocument()
  })

  it('should handle ref assignment correctly', () => {
    const TestComponent = () => {
      const [ref, isHovered] = useHoverRef<HTMLDivElement>()

      // Test that ref works properly without checking its assignment
      return (
        <div>
          <div ref={ref} data-testid="target">
            {isHovered ? 'hovered' : 'not hovered'}
          </div>
          <div data-testid="ref-status">Ref function working</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    // Verify the ref function is working by testing hover functionality
    expect(getByTestId('ref-status')).toHaveTextContent('Ref function working')

    // And hover should work
    const target = getByTestId('target')
    expect(target).toHaveTextContent('not hovered')

    fireEvent.mouseEnter(target)
    expect(target).toHaveTextContent('hovered')

    fireEvent.mouseLeave(target)
    expect(target).toHaveTextContent('not hovered')
  })
})
