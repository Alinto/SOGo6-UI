import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ListRefresh from '../list-refresh'

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <span>{children}</span>,
}))

const getButton = () => screen.getByRole('button', { name: 'refresh.string' })
const getIcon = () => screen.getByTestId('list-refresh-icon')

describe('ListRefresh', () => {
  it('renders an accessible refresh button', () => {
    render(<ListRefresh onRefresh={jest.fn()} />)
    expect(getButton()).toHaveAttribute('aria-disabled', 'false')
  })

  it('calls onRefresh when clicked', () => {
    const onRefresh = jest.fn()
    render(<ListRefresh onRefresh={onRefresh} />)
    fireEvent.click(getButton())
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('spins and ignores clicks while refreshing, keeping focus', () => {
    const onRefresh = jest.fn()
    render(<ListRefresh onRefresh={onRefresh} isRefreshing />)
    const button = getButton()
    button.focus()
    expect(getIcon()).toHaveClass('animate-spin')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toBeDisabled()
    fireEvent.click(button)
    expect(onRefresh).not.toHaveBeenCalled()
    expect(button).toHaveFocus()
  })

  it('does not spin when idle', () => {
    render(<ListRefresh onRefresh={jest.fn()} />)
    expect(getIcon()).not.toHaveClass('animate-spin')
  })
})
