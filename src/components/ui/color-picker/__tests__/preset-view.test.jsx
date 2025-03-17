import PresetView, { colors } from '@/components/ui/color-picker/preset-view'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

// filepath: src/components/ui/color-picker/preset-view.test.tsx

jest.mock('../../button', () => ({
  Button: jest.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}))

describe('PresetView Component', () => {
  it('renders all preset color buttons', () => {
    render(<PresetView setColor={jest.fn()} />)
    const colorButtons = screen.getAllByRole('button')
    expect(colorButtons).toHaveLength(35) // There are 36 colors in the array
  })

  it('calls setColor with the correct color when a color button is clicked', () => {
    const setColor = jest.fn()
    render(<PresetView setColor={setColor} />)
    const colorButton = screen.getAllByRole('button')[0]
    fireEvent.click(colorButton)
    expect(setColor).toHaveBeenCalledWith('#FF5733') // The first color in the array
  })

  it('applies the correct styles to the color divs', () => {
    render(<PresetView setColor={jest.fn()} />)
    const colorDivs = screen
      .getAllByRole('button')
      .map((button) => button.firstChild)
    colorDivs.forEach((div, index) => {
      expect(div).toHaveStyle(`background-color: ${colors[index]}`)
    })
  })

  it('applies the correct classes to the color buttons', () => {
    render(<PresetView setColor={jest.fn()} />)
    const colorButtons = screen.getAllByRole('button')
    colorButtons.forEach((button) => {
      expect(button).toHaveClass(
        'relative flex justify-center items-center hover:bg-opacity-10'
      )
    })
  })
})
