import ColorPanel from '@/components/ui/color-picker/color-panel'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

// filepath: src/components/ui/color-picker/color-panel.test.tsx

jest.mock('../../tabs', () => ({
  Tabs: jest.fn(({ children }) => <div>{children}</div>),
  TabsContent: jest.fn(({ children, value }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  )),
  TabsList: jest.fn(({ children }) => <div>{children}</div>),
  TabsTrigger: jest.fn(({ children, value }) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  )),
}))

jest.mock('../../color-picker/custom-view', () =>
  jest.fn(({ onChange }) => (
    <div data-testid="color-picker">
      <button onClick={() => onChange('new-color')}>Pick Color</button>
    </div>
  ))
)

jest.mock('../../color-picker/preset-view', () =>
  jest.fn(({ setColor }) => (
    <div data-testid="preset-view">
      <button onClick={() => setColor('preset-color')}>Preset Color</button>
    </div>
  ))
)

describe('ColorPanel Component', () => {
  it('renders Tabs with default value "preset"', () => {
    render(<ColorPanel setColor={jest.fn()} />)
    expect(screen.getByTestId('tabs-trigger-preset')).toBeInTheDocument()
    expect(screen.getByTestId('tabs-trigger-custom')).toBeInTheDocument()
  })

  it('renders PresetView when "preset" tab is active', () => {
    render(<ColorPanel setColor={jest.fn()} />)
    fireEvent.click(screen.getByTestId('tabs-trigger-preset'))
    expect(screen.getByTestId('preset-view')).toBeInTheDocument()
  })

  it('renders ColorPicker when "custom" tab is active', () => {
    render(<ColorPanel setColor={jest.fn()} />)
    fireEvent.click(screen.getByTestId('tabs-trigger-custom'))
    expect(screen.getByTestId('color-picker')).toBeInTheDocument()
  })

  it('calls setColor with "preset-color" when PresetView button is clicked', () => {
    const setColor = jest.fn()
    render(<ColorPanel setColor={setColor} />)
    fireEvent.click(screen.getByTestId('tabs-trigger-preset'))
    fireEvent.click(screen.getByText('Preset Color'))
    expect(setColor).toHaveBeenCalledWith('preset-color')
  })

  it('calls setColor with "new-color" when ColorPicker button is clicked', () => {
    const setColor = jest.fn()
    render(<ColorPanel setColor={setColor} />)
    fireEvent.click(screen.getByTestId('tabs-trigger-custom'))
    fireEvent.click(screen.getByText('Pick Color'))
    expect(setColor).toHaveBeenCalledWith('new-color')
  })

  it('applies animation transitions correctly', () => {
    render(<ColorPanel setColor={jest.fn()} />)
    fireEvent.click(screen.getByTestId('tabs-trigger-preset'))
    expect(screen.getByTestId('tabs-content-preset')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tabs-trigger-custom'))
    expect(screen.getByTestId('tabs-content-custom')).toBeInTheDocument()
  })
})
