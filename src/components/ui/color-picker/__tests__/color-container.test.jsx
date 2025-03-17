import ColorContainer from '@/components/ui/color-picker/color-container'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

// filepath: src/components/ui/color-picker/color-container.test.tsx

jest.mock('../../buttons/motion-button', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}))

jest.mock('../../color-picker/color-box', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => (
    <div data-testid="color-box">{children}</div>
  )),
}))

jest.mock('../../color-picker/color-panel', () => ({
  __esModule: true,
  default: jest.fn(({ setColor }) => (
    <div data-testid="color-panel">
      <button onClick={() => setColor('new-color')}>Set Color</button>
    </div>
  )),
}))

describe('ColorContainer Component', () => {
  it('renders the ColorContainer with initial color', () => {
    render(
      <ColorContainer
        initialColor="red"
        onColorChange={jest.fn()}
        containerId="color-container"
      />
    )
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ color: 'red' })
  })
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <ColorContainer
        initialColor="red"
        onColorChange={jest.fn()}
        containerId="color-container"
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('toggles the ColorBox on button click', () => {
    render(
      <ColorContainer
        initialColor="red"
        onColorChange={jest.fn()}
        containerId="color-container"
      />
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByTestId('color-box')).toBeInTheDocument()
    fireEvent.click(button)
    expect(screen.queryByTestId('color-box')).not.toBeInTheDocument()
  })

  it('calls onColorChange when color is changed in ColorPanel', () => {
    const handleColorChange = jest.fn()
    render(
      <ColorContainer
        initialColor="red"
        onColorChange={handleColorChange}
        containerId="color-container"
      />
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const setColorButton = screen.getByText('Set Color')
    fireEvent.click(setColorButton)
    expect(handleColorChange).toHaveBeenCalledWith('new-color')
  })

  it('closes the ColorBox when clicking outside', () => {
    render(
      <ColorContainer
        initialColor="red"
        onColorChange={jest.fn()}
        containerId="color-container"
      />
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByTestId('color-box')).toBeInTheDocument()
    fireEvent.mouseDown(document)
    expect(screen.queryByTestId('color-box')).not.toBeInTheDocument()
  })
})
