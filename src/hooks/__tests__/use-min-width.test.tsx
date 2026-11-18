import { act, render, screen } from '@testing-library/react'
import { useMinWidth } from '../use-min-width'

function Probe({ minWidth }: { minWidth: number }) {
  const { ref, matches } = useMinWidth<HTMLDivElement>(minWidth)
  return (
    <div ref={ref} data-testid="probe" style={{ padding: '0 12px' }}>
      {matches ? 'wide' : 'narrow'}
    </div>
  )
}

describe('useMinWidth', () => {
  let width = 0
  let resize: ResizeObserverCallback | undefined
  const OriginalResizeObserver = global.ResizeObserver

  beforeEach(() => {
    width = 0
    resize = undefined
    jest
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(() => width)
    global.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    jest.restoreAllMocks()
    global.ResizeObserver = OriginalResizeObserver
  })

  it('compares the content width (without padding) on mount', () => {
    width = 1024
    render(<Probe minWidth={1000} />)
    expect(screen.getByTestId('probe')).toHaveTextContent('wide')
  })

  it('is false when the padding leaves too little content width', () => {
    width = 1010 // 1010 - 24 padding = 986 < 1000
    render(<Probe minWidth={1000} />)
    expect(screen.getByTestId('probe')).toHaveTextContent('narrow')
  })

  it('updates when the element is resized', () => {
    width = 500
    render(<Probe minWidth={1000} />)
    expect(screen.getByTestId('probe')).toHaveTextContent('narrow')

    width = 1200
    act(() => resize?.([], {} as ResizeObserver))
    expect(screen.getByTestId('probe')).toHaveTextContent('wide')
  })
})
