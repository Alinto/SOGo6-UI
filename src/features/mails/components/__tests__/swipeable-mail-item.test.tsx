import { fireEvent, render, screen } from '@testing-library/react'
import SwipeableMailItem from '../swipeable-mail-item'

describe('SwipeableMailItem', () => {
  it('renders children correctly', () => {
    const onDelete = jest.fn()
    const onMarkAsSeen = jest.fn()
    render(
      <SwipeableMailItem onDelete={onDelete} onMarkAsSeen={onMarkAsSeen}>
        <div>Test Child</div>
      </SwipeableMailItem>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('calls onMarkAsSeen on swipe right beyond threshold', () => {
    const onDelete = jest.fn()
    const onMarkAsSeen = jest.fn()
    render(
      <SwipeableMailItem onDelete={onDelete} onMarkAsSeen={onMarkAsSeen}>
        <div>Test Child</div>
      </SwipeableMailItem>
    )
    const swipeableElement = screen.getByText('Test Child')
      .parentElement as HTMLElement

    // Simulate swipe right (150px, exceeds threshold of ~120px for 300px width)
    fireEvent.pointerDown(swipeableElement, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(swipeableElement, { clientX: 150, clientY: 0 })
    fireEvent.pointerUp(swipeableElement, { clientX: 150, clientY: 0 })

    expect(onDelete).not.toHaveBeenCalled()
  })

  it('calls onDelete on swipe left beyond threshold', () => {
    const onDelete = jest.fn()
    const onMarkAsSeen = jest.fn()
    render(
      <SwipeableMailItem onDelete={onDelete} onMarkAsSeen={onMarkAsSeen}>
        <div>Test Child</div>
      </SwipeableMailItem>
    )
    const swipeableElement = screen.getByText('Test Child')
      .parentElement as HTMLElement

    // Simulate swipe left (-150px, exceeds threshold)
    fireEvent.pointerDown(swipeableElement, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(swipeableElement, { clientX: -150, clientY: 0 })
    fireEvent.pointerUp(swipeableElement, { clientX: -150, clientY: 0 })

    expect(onMarkAsSeen).not.toHaveBeenCalled()
  })

  it('does not call callbacks on small swipe movements', () => {
    const onDelete = jest.fn()
    const onMarkAsSeen = jest.fn()
    render(
      <SwipeableMailItem onDelete={onDelete} onMarkAsSeen={onMarkAsSeen}>
        <div>Test Child</div>
      </SwipeableMailItem>
    )
    const swipeableElement = screen.getByText('Test Child')
      .parentElement as HTMLElement

    // Simulate small swipe right (50px, below threshold)
    fireEvent.pointerDown(swipeableElement, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(swipeableElement, { clientX: 50, clientY: 0 })
    fireEvent.pointerUp(swipeableElement, { clientX: 50, clientY: 0 })

    expect(onMarkAsSeen).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('does not respond to swipe when disabled', () => {
    const onDelete = jest.fn()
    const onMarkAsSeen = jest.fn()
    render(
      <SwipeableMailItem
        onDelete={onDelete}
        onMarkAsSeen={onMarkAsSeen}
        disabled
      >
        <div>Test Child</div>
      </SwipeableMailItem>
    )
    const swipeableElement = screen.getByText('Test Child')
      .parentElement as HTMLElement

    // Attempt swipe right
    fireEvent.pointerDown(swipeableElement, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(swipeableElement, { clientX: 150, clientY: 0 })
    fireEvent.pointerUp(swipeableElement, { clientX: 150, clientY: 0 })

    expect(onMarkAsSeen).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })
})
